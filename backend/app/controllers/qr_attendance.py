from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
import secrets
import hashlib
from ..models import db, WorkSchedule, Employee, EmployeeSchedule, Attendance

# Store QR tokens in memory (dalam produksi, gunakan Redis)
qr_tokens = {}

def generate_qr_token(schedule_id: int):
    """
    Generate QR token untuk work schedule tertentu
    POST /api/admin/work-schedules/{schedule_id}/qr
    """
    try:
        # Validasi schedule exists
        schedule = WorkSchedule.query.get(schedule_id)
        if not schedule:
            return jsonify({"message": "Work schedule not found"}), 404
        
        # Generate unique token
        timestamp = datetime.now().isoformat()
        random_string = secrets.token_urlsafe(32)
        token_data = f"{schedule_id}:{timestamp}:{random_string}"
        qr_token = hashlib.sha256(token_data.encode()).hexdigest()
        
        # Set expiry time (60 detik)
        expires_at = datetime.now() + timedelta(seconds=60)
        
        # Store token dengan informasi schedule
        qr_tokens[qr_token] = {
            'schedule_id': schedule_id,
            'expires_at': expires_at,
            'schedule_name': schedule.name,
            'start_time': schedule.start_time.strftime("%H:%M"),
            'end_time': schedule.end_time.strftime("%H:%M"),
            'tolerance_minutes': schedule.tolerance_minutes
        }
        
        # Clean up expired tokens
        _cleanup_expired_tokens()
        
        return jsonify({
            "qr_token": qr_token,
            "expires_in": 60,
            "schedule": {
                "id": schedule.id,
                "name": schedule.name,
                "start_time": schedule.start_time.strftime("%H:%M"),
                "end_time": schedule.end_time.strftime("%H:%M")
            }
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# @jwt_required()
def scan_qr_attendance():
    """
    Scan QR dan validasi untuk absensi
    POST /api/attendance/scan
    Body: { "qr_data": "...", "employee_id": ... }
    """
    try:
        data = request.get_json()
        qr_data = data.get('qr_data')
        employee_id = data.get('employee_id')
        
        if not qr_data or not employee_id:
            return jsonify({"message": "QR data dan employee ID harus diisi"}), 400
        
        # Validasi QR token exists dan belum expired
        if qr_data not in qr_tokens:
            return jsonify({"message": "QR Code tidak valid atau sudah kadaluarsa"}), 400
        
        token_info = qr_tokens[qr_data]
        
        # Check expiry
        if datetime.now() > token_info['expires_at']:
            del qr_tokens[qr_data]
            return jsonify({"message": "QR Code sudah kadaluarsa"}), 400
        
        schedule_id = token_info['schedule_id']
        
        # Validasi employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "Karyawan tidak ditemukan"}), 404
        
        # Validasi employee memiliki jadwal ini
        employee_schedule = (
            EmployeeSchedule.query
            .filter_by(employee_id=employee_id, work_schedules_id=schedule_id)
            .first()
        )
        
        if not employee_schedule:
            return jsonify({
                "message": f"Anda tidak terdaftar di jadwal '{token_info['schedule_name']}'"
            }), 403
        
        # Get schedule details
        schedule = WorkSchedule.query.get(schedule_id)
        
        # Check apakah sudah absen hari ini
        today = datetime.now().date()
        existing_attendance = (
            Attendance.query
            .filter(
                Attendance.employee_id == employee_id,
                db.func.date(Attendance.date) == today
            )
            .first()
        )
        
        if existing_attendance:
            return jsonify({
                "message": "Anda sudah melakukan absensi hari ini"
            }), 400
        
        # Validasi waktu absensi dengan toleransi
        current_time = datetime.now().time()
        schedule_start = schedule.start_time
        
        # Calculate tolerance window
        tolerance_delta = timedelta(minutes=schedule.tolerance_minutes)
        start_datetime = datetime.combine(today, schedule_start)
        earliest_time = (start_datetime - tolerance_delta).time()
        latest_time = (start_datetime + tolerance_delta).time()
        
        # Check if current time is within tolerance window
        if not (earliest_time <= current_time <= latest_time):
            return jsonify({
                "message": f"Waktu absensi tidak sesuai. Jadwal: {schedule_start.strftime('%H:%M')} (±{schedule.tolerance_minutes} menit)"
            }), 400
        
        # Determine status (On Time / Late)
        status = "On Time" if current_time <= schedule_start else "Late"
        
        # Create attendance record
        new_attendance = Attendance(
            employee_id=employee_id,
            date=datetime.now()
        )
        
        db.session.add(new_attendance)
        db.session.commit()
        
        # Hapus token setelah digunakan (one-time use)
        del qr_tokens[qr_data]
        
        return jsonify({
            "message": f"Absensi berhasil! Status: {status}",
            "attendance": {
                "id": new_attendance.id,
                "employee_name": employee.name,
                "schedule_name": schedule.name,
                "date": new_attendance.date.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


def _cleanup_expired_tokens():
    """Helper function to remove expired tokens"""
    now = datetime.now()
    expired_keys = [k for k, v in qr_tokens.items() if v['expires_at'] < now]
    for key in expired_keys:
        del qr_tokens[key]