from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from ..models import db, Employee, EmployeeSchedule, WorkSchedule, Attendance, DailySchedule

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


