from flask import jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import db, Employee, EmployeeSchedule, WorkSchedule, Attendance, DailySchedule


def login():
    """
    Endpoint login untuk employee
    POST /api/auth/login
    Body: { "email": "...", "password": "..." }
    """
    try:
        data = request.get_json()
        
        # Validasi input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Email dan password harus diisi"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # Cari employee berdasarkan email
        employee = Employee.query.filter_by(email=email).first()
        
        if not employee:
            return jsonify({"message": "Email atau password salah"}), 401
        
        # Verifikasi password
        if not check_password_hash(employee.password, password):
            return jsonify({"message": "Email atau password salah"}), 401
        
        # Generate JWT token (expired dalam 7 hari)
        access_token = create_access_token(
            identity={'id': employee.id, 'role': 'employee'},
            expires_delta=timedelta(days=7)
        )
        
        # Return data employee + token
        return jsonify({
            "message": "Login berhasil",
            "token": access_token,
            "id": employee.id,
            "employee_id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "position": employee.position
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


def register():
    """
    Endpoint register employee baru (opsional)
    POST /api/auth/register
    """
    try:
        data = request.get_json()
        
        # Validasi required fields
        required_fields = ['nik', 'name', 'gender', 'position', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} harus diisi"}), 400
        
        # Cek apakah email atau NIK sudah ada
        if Employee.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email sudah terdaftar"}), 409
        
        if Employee.query.filter_by(nik=data['nik']).first():
            return jsonify({"message": "NIK sudah terdaftar"}), 409
        
        # Validasi gender
        if data['gender'] not in ['Male', 'Female', 'Other']:
            return jsonify({"message": "Gender tidak valid"}), 400
        
        # Hash password
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        # Buat employee baru
        new_employee = Employee(
            nik=data['nik'],
            name=data['name'],
            gender=data['gender'],
            position=data['position'],
            email=data['email'],
            password=hashed_password
        )
        
        db.session.add(new_employee)
        db.session.commit()
        
        return jsonify({
            "message": "Registrasi berhasil",
            "employee_id": new_employee.id,
            "name": new_employee.name,
            "email": new_employee.email
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


@jwt_required()
def verify_token():
    """
    Endpoint untuk verify JWT token
    GET /api/auth/verify
    Header: Authorization: Bearer <token>
    """
    try:
        current_user = get_jwt_identity()
        employee_id = current_user.get('id')
        
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "User tidak ditemukan"}), 404
        
        return jsonify({
            "message": "Token valid",
            "id": employee.id,
            "employee_id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "position": employee.position
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Token tidak valid", "error": str(e)}), 401


@jwt_required()
def change_password():
    """
    Endpoint untuk ganti password
    POST /api/auth/change-password
    Body: { "old_password": "...", "new_password": "..." }
    """
    try:
        current_user = get_jwt_identity()
        employee_id = current_user.get('id')
        
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not old_password or not new_password:
            return jsonify({"message": "Password lama dan baru harus diisi"}), 400
        
        if len(new_password) < 6:
            return jsonify({"message": "Password baru minimal 6 karakter"}), 400
        
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "User tidak ditemukan"}), 404
        
        # Verifikasi password lama
        if not check_password_hash(employee.password, old_password):
            return jsonify({"message": "Password lama tidak sesuai"}), 401
        
        # Update password
        from werkzeug.security import generate_password_hash
        employee.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        db.session.commit()
        
        return jsonify({"message": "Password berhasil diubah"}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500



def get_employee_today_status(id_employee: int):
    try:
        # 1️⃣ Pastikan karyawan ada
        employee = Employee.query.get(id_employee)
        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        # 2️⃣ Dapatkan nama hari sekarang (dalam bahasa Indonesia)
        hari_mapping = {
            "Monday": "Senin",
            "Tuesday": "Selasa",
            "Wednesday": "Rabu",
            "Thursday": "Kamis",
            "Friday": "Jumat",
            "Saturday": "Sabtu",
            "Sunday": "Minggu",
        }
        today_en = datetime.now().strftime("%A")
        today_name = hari_mapping[today_en]

        # 3️⃣ Ambil jadwal kerja karyawan untuk hari ini
        schedule = (
            db.session.query(
                WorkSchedule.start_time,
                WorkSchedule.end_time,
                WorkSchedule.tolerance_minutes,
                WorkSchedule.name.label("shift_name"),
                DailySchedule.name.label("day_name")
            )
            .join(EmployeeSchedule, EmployeeSchedule.work_schedules_id == WorkSchedule.id)
            .join(DailySchedule, DailySchedule.id == EmployeeSchedule.daily_schedules_id)
            .filter(EmployeeSchedule.employee_id == id_employee)
            .filter(DailySchedule.name == today_name)
            .first()
        )

        # Kalau tidak ada jadwal untuk hari ini
        if not schedule:
            return jsonify({
                "absen_status_today": "none",
                "employee_id": id_employee,
                "start_time": None,
                "end_time": None
            }), 200

        # 4️⃣ Cek apakah sudah absen hari ini
        today_date = datetime.now().date()
        attendance_today = (
            Attendance.query
            .filter(
                Attendance.employee_id == id_employee,
                db.func.date(Attendance.date) == today_date
            )
            .first()
        )

        absen_status = "present" if attendance_today else "none"

        # 5️⃣ Format hasil JSON
        result = {
            "absen_status_today": absen_status,
            "employee_id": id_employee,
            "start_time": schedule.start_time.strftime("%H:%M"),
            "end_time": schedule.end_time.strftime("%H:%M"),
            "shift_name": schedule.shift_name,
            "day_name": schedule.day_name
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_employee_schedules(employee_id):
    # Query join 3 tabel
    schedules = (
        db.session.query(
            EmployeeSchedule.id,
            DailySchedule.name.label('day_name'),
            WorkSchedule.name.label('shift_name'),
            WorkSchedule.start_time,
            WorkSchedule.end_time,
            WorkSchedule.tolerance_minutes
        )
        .join(DailySchedule, EmployeeSchedule.daily_schedules_id == DailySchedule.id)
        .join(WorkSchedule, EmployeeSchedule.work_schedules_id == WorkSchedule.id)
        .filter(EmployeeSchedule.employee_id == employee_id)
        .order_by(DailySchedule.id.asc())
        .all()
    )

    # Kalau gak ada jadwal
    if not schedules:
        return jsonify({
            "message": f"Tidak ada jadwal untuk employee_id {employee_id}",
            "data": []
        }), 200

    # Format hasil
    result = [
        {
            "schedule_id": s.id,
            "day_name": s.day_name,
            "shift_name": s.shift_name,
            "start_time": s.start_time.strftime("%H:%M"),
            "end_time": s.end_time.strftime("%H:%M"),
            "tolerance_minutes": s.tolerance_minutes
        }
        for s in schedules
    ]

    return jsonify({
        "employee_id": employee_id,
        "total_schedules": len(result),
        "data": result
    }), 200



def get_attendance_history(employee_id):
    # Pastikan employee ada
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"message": f"Employee dengan id {employee_id} tidak ditemukan"}), 404

    # Ambil waktu sekarang
    now = datetime.now()

    # Hitung rentang minggu ini (Senin - Minggu)
    start_of_week = now - timedelta(days=now.weekday())  # Senin
    end_of_week = start_of_week + timedelta(days=6)      # Minggu

    # Hitung rentang bulan ini
    start_of_month = datetime(now.year, now.month, 1)
    if now.month == 12:
        next_month = datetime(now.year + 1, 1, 1)
    else:
        next_month = datetime(now.year, now.month + 1, 1)
    end_of_month = next_month - timedelta(seconds=1)

    # Query absensi minggu ini
    weekly_records = (
        Attendance.query
        .filter(
            Attendance.employee_id == employee_id,
            Attendance.date >= start_of_week,
            Attendance.date <= end_of_week
        )
        .order_by(Attendance.date.asc())
        .all()
    )

    # Query absensi bulan ini
    monthly_records = (
        Attendance.query
        .filter(
            Attendance.employee_id == employee_id,
            Attendance.date >= start_of_month,
            Attendance.date <= end_of_month
        )
        .order_by(Attendance.date.asc())
        .all()
    )

    def serialize_record(record):
        return {
            "attendance_id": record.id,
            "date": record.date.strftime("%Y-%m-%d"),
            "created_at": record.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

    weekly_data = [serialize_record(r) for r in weekly_records]
    monthly_data = [serialize_record(r) for r in monthly_records]

    return jsonify({
        "employee_id": employee_id,
        "employee_name": employee.name,
        "weekly_range": {
            "start": start_of_week.strftime("%Y-%m-%d"),
            "end": end_of_week.strftime("%Y-%m-%d")
        },
        "monthly_range": {
            "start": start_of_month.strftime("%Y-%m-%d"),
            "end": end_of_month.strftime("%Y-%m-%d")
        },
        "weekly_history": weekly_data,
        "monthly_history": monthly_data
    }), 200



def get_employee_detail(employee_id):
    # Cek apakah employee ada
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({
            "message": f"Employee dengan id {employee_id} tidak ditemukan"
        }), 404

    # Format hasil data diri saja
    employee_data = {
        "employee_id": employee.id,
        "nik": employee.nik,
        "name": employee.name,
        "gender": employee.gender,
        "position": employee.position,
        "email": employee.email,
        "created_at": employee.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": employee.updated_at.strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify(employee_data), 200




@jwt_required()
def scan_qr_attendance():
    """
    Endpoint untuk scan QR dan catat absensi
    POST /api/attendance/scan
    Body: { "qr_data": "...", "employee_id": ... }
    Header: Authorization: Bearer <token>
    """
    try:
        # Ambil data dari request
        data = request.get_json()
        qr_data = data.get('qr_data')
        employee_id = data.get('employee_id')
        
        # Validasi input
        if not qr_data or not employee_id:
            return jsonify({"message": "QR data dan employee ID harus diisi"}), 400
        
        # Verifikasi JWT identity
        current_user = get_jwt_identity()
        if current_user.get('id') != employee_id:
            return jsonify({"message": "Unauthorized: Employee ID tidak sesuai"}), 403
        
        # Pastikan employee ada
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "Employee tidak ditemukan"}), 404
        
        # Validasi QR Code (opsional: sesuaikan dengan format QR Anda)
        # Contoh: QR harus berisi keyword tertentu
        if "ATTENDANCE" not in qr_data.upper():
            return jsonify({"message": "QR Code tidak valid"}), 400
        
        # Dapatkan hari sekarang
        hari_mapping = {
            "Monday": "Senin",
            "Tuesday": "Selasa",
            "Wednesday": "Rabu",
            "Thursday": "Kamis",
            "Friday": "Jumat",
            "Saturday": "Sabtu",
            "Sunday": "Minggu",
        }
        today_en = datetime.now().strftime("%A")
        today_name = hari_mapping[today_en]
        today_date = datetime.now().date()
        current_time = datetime.now().time()
        
        # Cek apakah karyawan punya jadwal hari ini
        schedule = (
            db.session.query(
                WorkSchedule.start_time,
                WorkSchedule.end_time,
                WorkSchedule.tolerance_minutes,
                WorkSchedule.name.label("shift_name")
            )
            .join(EmployeeSchedule, EmployeeSchedule.work_schedules_id == WorkSchedule.id)
            .join(DailySchedule, DailySchedule.id == EmployeeSchedule.daily_schedules_id)
            .filter(EmployeeSchedule.employee_id == employee_id)
            .filter(DailySchedule.name == today_name)
            .first()
        )
        
        if not schedule:
            return jsonify({
                "message": f"Anda tidak memiliki jadwal kerja pada hari {today_name}"
            }), 400
        
        # Cek apakah sudah absen hari ini
        existing_attendance = (
            Attendance.query
            .filter(
                Attendance.employee_id == employee_id,
                db.func.date(Attendance.date) == today_date
            )
            .first()
        )
        
        if existing_attendance:
            return jsonify({
                "message": "Anda sudah melakukan absensi hari ini",
                "attendance_id": existing_attendance.id,
                "time": existing_attendance.created_at.strftime("%H:%M:%S")
            }), 409
        
        # Cek apakah masih dalam toleransi waktu
        start_time = schedule.start_time
        tolerance = schedule.tolerance_minutes
        
        # Hitung waktu maksimal absen (start_time + tolerance)
        max_time_datetime = datetime.combine(today_date, start_time) + timedelta(minutes=tolerance)
        max_time = max_time_datetime.time()
        
        # Status absensi
        status = "tepat_waktu"
        if current_time > max_time:
            status = "terlambat"
        
        # Simpan absensi
        new_attendance = Attendance(
            employee_id=employee_id,
            date=datetime.now()
        )
        
        db.session.add(new_attendance)
        db.session.commit()
        
        return jsonify({
            "message": f"Absensi berhasil! Status: {status}",
            "attendance_id": new_attendance.id,
            "employee_name": employee.name,
            "shift": schedule.shift_name,
            "attendance_time": new_attendance.created_at.strftime("%H:%M:%S"),
            "scheduled_time": start_time.strftime("%H:%M"),
            "status": status
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


@jwt_required()
def delete_attendance(attendance_id):
    """
    Endpoint untuk hapus absensi (admin only atau untuk koreksi)
    DELETE /api/attendance/<id>
    """
    try:
        current_user = get_jwt_identity()
        
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return jsonify({"message": "Attendance tidak ditemukan"}), 404
        
        # Verifikasi ownership (employee hanya bisa hapus absensinya sendiri)
        if current_user.get('id') != attendance.employee_id and current_user.get('role') != 'admin':
            return jsonify({"message": "Unauthorized"}), 403
        
        db.session.delete(attendance)
        db.session.commit()
        
        return jsonify({"message": "Attendance berhasil dihapus"}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


@jwt_required()
def get_attendance_detail(attendance_id):
    """
    Endpoint untuk mendapatkan detail absensi
    GET /api/attendance/<id>
    """
    try:
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return jsonify({"message": "Attendance tidak ditemukan"}), 404
        
        employee = Employee.query.get(attendance.employee_id)
        
        return jsonify({
            "attendance_id": attendance.id,
            "employee_id": attendance.employee_id,
            "employee_name": employee.name if employee else None,
            "date": attendance.date.strftime("%Y-%m-%d"),
            "time": attendance.date.strftime("%H:%M:%S"),
            "created_at": attendance.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


def get_all_attendance_today():
    """
    Endpoint untuk mendapatkan semua absensi hari ini (untuk admin/monitoring)
    GET /api/attendance/today
    """
    try:
        today_date = datetime.now().date()
        
        attendances = (
            db.session.query(
                Attendance.id,
                Attendance.employee_id,
                Employee.name.label('employee_name'),
                Attendance.date,
                Attendance.created_at
            )
            .join(Employee, Attendance.employee_id == Employee.id)
            .filter(db.func.date(Attendance.date) == today_date)
            .order_by(Attendance.created_at.desc())
            .all()
        )
        
        result = [
            {
                "attendance_id": att.id,
                "employee_id": att.employee_id,
                "employee_name": att.employee_name,
                "date": att.date.strftime("%Y-%m-%d"),
                "time": att.created_at.strftime("%H:%M:%S")
            }
            for att in attendances
        ]
        
        return jsonify({
            "date": today_date.strftime("%Y-%m-%d"),
            "total_attendance": len(result),
            "data": result
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500