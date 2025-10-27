from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
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



