from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError
from ..models import db, Employee, DailySchedule, WorkSchedule, EmployeeSchedule, Attendance

def get_all_employees():
    try:
        # Query utama: ambil semua data karyawan
        employees = (
            db.session.query(
                Employee.id.label("id"),
                Employee.nik.label("nik"),
                Employee.name.label("name"),
                Employee.gender.label("gender"),
                Employee.position.label("position"),
                Employee.email.label("email")
            )
            .order_by(Employee.created_at.desc())
            .all()
        )

        result = []
        for e in employees:
            result.append({
                "id": e.id,
                "nik": e.nik,
                "name": e.name,
                "gender": e.gender,
                "position": e.position,
                "email": e.email
            })

        return jsonify({
            "total_employees": len(result),
            "employees": result
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_employee_by_id(id_employee: int):
    try:
        # Ambil data karyawan utama
        employee = (
            db.session.query(
                Employee.id.label("id"),
                Employee.nik.label("nik"),
                Employee.name.label("name"),
                Employee.gender.label("gender"),
                Employee.position.label("position"),
                Employee.email.label("email")
            )
            .filter(Employee.id == id_employee)
            .first()
        )

        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        # Ambil jadwal kerja karyawan (join ke tabel relasi)
        schedules = (
            db.session.query(
                DailySchedule.name.label("day_name"),
                WorkSchedule.name.label("schedule_name"),
                WorkSchedule.start_time.label("start_time"),
                WorkSchedule.end_time.label("end_time"),
                WorkSchedule.tolerance_minutes.label("tolerance_minutes")
            )
            .join(EmployeeSchedule, EmployeeSchedule.daily_schedules_id == DailySchedule.id)
            .join(WorkSchedule, EmployeeSchedule.work_schedules_id == WorkSchedule.id)
            .filter(EmployeeSchedule.employee_id == id_employee)
            .order_by(DailySchedule.id.asc())
            .all()
        )

        # Format hasil jadwal
        schedule_list = []
        for s in schedules:
            schedule_list.append({
                "day_name": s.day_name,
                "schedule_name": s.schedule_name,
                "start_time": s.start_time.strftime("%H:%M"),
                "end_time": s.end_time.strftime("%H:%M"),
                "tolerance_minutes": s.tolerance_minutes
            })

        # Gabungkan hasil karyawan dan jadwalnya
        result = {
            "id": employee.id,
            "nik": employee.nik,
            "name": employee.name,
            "gender": employee.gender,
            "position": employee.position,
            "email": employee.email,
            "schedules": schedule_list
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_all_work_schedules():
    try:
        schedules = (
            db.session.query(
                WorkSchedule.id.label("id"),
                WorkSchedule.name.label("name"),
                WorkSchedule.start_time.label("start_time"),
                WorkSchedule.end_time.label("end_time"),
                WorkSchedule.tolerance_minutes.label("tolerance_minutes")
            )
            .order_by(WorkSchedule.id.asc())
            .all()
        )

        result = []
        for s in schedules:
            result.append({
                "id": s.id,
                "name": s.name,
                "start_time": s.start_time.strftime("%H:%M"),
                "end_time": s.end_time.strftime("%H:%M"),
                "tolerance_minutes": s.tolerance_minutes
            })

        return jsonify({
            "total_schedules": len(result),
            "work_schedules": result
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_work_schedule_by_id(id_schedule: int):
    try:
        s = (
            db.session.query(
                WorkSchedule.id,
                WorkSchedule.name,
                WorkSchedule.start_time,
                WorkSchedule.end_time,
                WorkSchedule.tolerance_minutes
            )
            .filter(WorkSchedule.id == id_schedule)
            .first()
        )

        if not s:
            return jsonify({"message": "Work schedule not found"}), 404

        result = {
            "id": s.id,
            "name": s.name,
            "start_time": s.start_time.strftime("%H:%M"),
            "end_time": s.end_time.strftime("%H:%M"),
            "tolerance_minutes": s.tolerance_minutes
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_all_attendance():
    try:
        # Join tabel attendance dengan employee
        attendances = (
            db.session.query(
                Attendance.id.label("attendance_id"),
                Employee.id.label("employee_id"),
                Employee.name.label("employee_name"),
                Employee.position.label("position"),
                Attendance.date.label("attendance_date")
            )
            .join(Employee, Employee.id == Attendance.employee_id)
            .order_by(Attendance.date.desc())
            .all()
        )

        result = []
        for a in attendances:
            result.append({
                "attendance_id": a.attendance_id,
                "employee_id": a.employee_id,
                "employee_name": a.employee_name,
                "position": a.position,
                "attendance_date": a.attendance_date.strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify({
            "total_attendance": len(result),
            "attendances": result
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_attendance_by_id(attendance_id: int):
    try:
        # Join attendance dengan employee, dan filter berdasarkan id attendance
        attendance = (
            db.session.query(
                Attendance.id.label("attendance_id"),
                Employee.id.label("employee_id"),
                Employee.name.label("employee_name"),
                Employee.position.label("position"),
                Attendance.date.label("attendance_date")
            )
            .join(Employee, Employee.id == Attendance.employee_id)
            .filter(Attendance.id == attendance_id)
            .first()
        )

        if not attendance:
            return jsonify({"message": "Attendance record not found"}), 404

        result = {
            "attendance_id": attendance.attendance_id,
            "employee_id": attendance.employee_id,
            "employee_name": attendance.employee_name,
            "position": attendance.position,
            "attendance_date": attendance.attendance_date.strftime("%Y-%m-%d %H:%M:%S")
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

