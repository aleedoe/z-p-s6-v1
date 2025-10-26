from flask import jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from werkzeug.security import generate_password_hash
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
                DailySchedule.id.label("day_id"),
                DailySchedule.name.label("day_name"),
                EmployeeSchedule.id.label("employee_schedule_id"),
                WorkSchedule.id.label("schedule_id"),
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
                "employee_schedule_id": s.employee_schedule_id,
                "day_id": s.day_id,
                "day_name": s.day_name,
                "schedule_id": s.schedule_id,
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


def get_available_schedules_for_employee(id_employee: int):
    try:
        # --- Ambil daftar daily_schedules_id yang sudah dimiliki oleh employee ---
        # (Masih bisa disimpan kalau nanti dibutuhkan)
        assigned_daily_schedules = (
            db.session.query(EmployeeSchedule.daily_schedules_id)
            .filter(EmployeeSchedule.employee_id == id_employee)
            .subquery()
        )

        # --- Ambil semua WorkSchedule (tanpa filter) ---
        all_work_schedules = (
            db.session.query(
                WorkSchedule.id,
                WorkSchedule.name,
                WorkSchedule.start_time,
                WorkSchedule.end_time,
                WorkSchedule.tolerance_minutes
            )
            .order_by(WorkSchedule.id.asc())
            .all()
        )

        # --- Ambil semua DailySchedule (tanpa filter) ---
        available_daily_schedules = (
            db.session.query(
                DailySchedule.id,
                DailySchedule.name
            )
            .order_by(DailySchedule.id.asc())
            .all()
        )

        # --- Format hasil ---
        work_schedule_list = [
            {
                "id": ws.id,
                "name": ws.name,
                "start_time": ws.start_time.strftime("%H:%M"),
                "end_time": ws.end_time.strftime("%H:%M"),
                "tolerance_minutes": ws.tolerance_minutes,
            }
            for ws in all_work_schedules
        ]

        daily_schedule_list = [
            {
                "id": ds.id,
                "name": ds.name,
            }
            for ds in available_daily_schedules
        ]

        result = {
            "daily_schedules": daily_schedule_list,
            "work_schedules": work_schedule_list,
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def add_employee_schedule(id_employee):  # Tambahkan parameter ini
    try:
        data = request.get_json()

        employee_id = id_employee  # Gunakan dari URL parameter, bukan dari body
        work_schedules_id = data.get("work_schedules_id")
        daily_schedules_id = data.get("daily_schedules_id")

        # --- Validasi input dasar ---
        if not all([employee_id, work_schedules_id, daily_schedules_id]):
            return jsonify({"message": "work_schedules_id dan daily_schedules_id wajib diisi"}), 400

        # --- Cek apakah employee, work schedule, dan daily schedule benar-benar ada ---
        employee_exists = db.session.query(Employee.id).filter_by(id=employee_id).first()
        if not employee_exists:
            return jsonify({"message": "Employee tidak ditemukan"}), 404

        work_schedule_exists = db.session.query(WorkSchedule.id).filter_by(id=work_schedules_id).first()
        if not work_schedule_exists:
            return jsonify({"message": "Work schedule tidak ditemukan"}), 404

        daily_schedule_exists = db.session.query(DailySchedule.id).filter_by(id=daily_schedules_id).first()
        if not daily_schedule_exists:
            return jsonify({"message": "Daily schedule tidak ditemukan"}), 404

        # --- Cek apakah kombinasi sudah ada (hindari duplikasi) ---
        existing_schedule = (
            db.session.query(EmployeeSchedule)
            .filter_by(
                employee_id=employee_id,
                work_schedules_id=work_schedules_id,
                daily_schedules_id=daily_schedules_id
            )
            .first()
        )

        if existing_schedule:
            return jsonify({"message": "Schedule untuk kombinasi ini sudah ada"}), 400

        # --- Buat entri baru ---
        new_schedule = EmployeeSchedule(
            employee_id=employee_id,
            work_schedules_id=work_schedules_id,
            daily_schedules_id=daily_schedules_id
        )

        db.session.add(new_schedule)
        db.session.commit()

        return jsonify({
            "message": "Employee schedule berhasil ditambahkan",
            "data": {
                "id": new_schedule.id,
                "employee_id": new_schedule.employee_id,
                "work_schedules_id": new_schedule.work_schedules_id,
                "daily_schedules_id": new_schedule.daily_schedules_id
            }
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def update_employee_schedule(id_employee, id_employee_schedule):
    try:
        data = request.get_json()

        work_schedules_id = data.get("work_schedules_id")
        daily_schedules_id = data.get("daily_schedules_id")

        # --- Validasi input dasar ---
        if not any([work_schedules_id, daily_schedules_id]):
            return jsonify({"message": "Minimal salah satu dari work_schedules_id atau daily_schedules_id harus diisi"}), 400

        # --- Cek apakah employee ada ---
        employee = db.session.query(Employee).filter_by(id=id_employee).first()
        if not employee:
            return jsonify({"message": "Employee tidak ditemukan"}), 404

        # --- Cek apakah schedule yang akan diupdate ada dan milik employee tersebut ---
        schedule = db.session.query(EmployeeSchedule).filter_by(
            id=id_employee_schedule,
            employee_id=id_employee
        ).first()
        
        if not schedule:
            return jsonify({"message": "Employee schedule tidak ditemukan"}), 404

        # --- Validasi work dan daily schedule jika diubah ---
        if work_schedules_id:
            work_schedule_exists = db.session.query(WorkSchedule.id).filter_by(id=work_schedules_id).first()
            if not work_schedule_exists:
                return jsonify({"message": "Work schedule tidak ditemukan"}), 404
            schedule.work_schedules_id = work_schedules_id

        if daily_schedules_id:
            daily_schedule_exists = db.session.query(DailySchedule.id).filter_by(id=daily_schedules_id).first()
            if not daily_schedule_exists:
                return jsonify({"message": "Daily schedule tidak ditemukan"}), 404
            schedule.daily_schedules_id = daily_schedules_id

        db.session.commit()

        return jsonify({
            "message": "Employee schedule berhasil diperbarui",
            "data": {
                "id": schedule.id,
                "employee_id": schedule.employee_id,
                "work_schedules_id": schedule.work_schedules_id,
                "daily_schedules_id": schedule.daily_schedules_id
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def delete_employee_schedule(id_employee, id_employee_schedule):
    try:
        # --- Cek apakah employee ada ---
        employee = db.session.query(Employee).filter_by(id=id_employee).first()
        if not employee:
            return jsonify({"message": "Employee tidak ditemukan"}), 404

        # --- Cek apakah schedule ada dan milik employee tersebut ---
        schedule = db.session.query(EmployeeSchedule).filter_by(
            id=id_employee_schedule,
            employee_id=id_employee
        ).first()
        
        if not schedule:
            return jsonify({"message": "Employee schedule tidak ditemukan"}), 404

        db.session.delete(schedule)
        db.session.commit()

        return jsonify({"message": "Employee schedule berhasil dihapus"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def create_employee():
    try:
        data = request.get_json()

        # Validasi field wajib
        required_fields = ["nik", "name", "gender", "position", "email", "password"]
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        # Cek duplikasi email/nik
        if Employee.query.filter((Employee.email == data["email"]) | (Employee.nik == data["nik"])).first():
            return jsonify({"message": "Employee with this email or NIK already exists"}), 409

        hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256")

        new_employee = Employee(
            nik=data["nik"],
            name=data["name"],
            gender=data["gender"],
            position=data["position"],
            email=data["email"],
            password=hashed_password
        )

        db.session.add(new_employee)
        db.session.commit()

        return jsonify({"message": "Employee created successfully", "id": new_employee.id}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def update_employee(id_employee: int):
    try:
        data = request.get_json()
        employee = Employee.query.get(id_employee)

        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        # Field yang boleh diubah oleh admin
        allowed_fields = {"nik", "name", "gender", "position", "email", "password"}

        # Cek duplikasi NIK/email jika ada perubahan
        if "nik" in data and data["nik"] != employee.nik:
            if Employee.query.filter(Employee.nik == data["nik"]).first():
                return jsonify({"message": "NIK already exists"}), 409

        if "email" in data and data["email"] != employee.email:
            if Employee.query.filter(Employee.email == data["email"]).first():
                return jsonify({"message": "Email already exists"}), 409

        # Update field yang dikirim di request
        for field in allowed_fields:
            if field in data:
                if field == "password":
                    # hash password baru
                    setattr(employee, field, generate_password_hash(data[field], method='pbkdf2:sha256'))
                else:
                    setattr(employee, field, data[field])

        db.session.commit()

        return jsonify({"message": "Employee updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def delete_employee(id_employee: int):
    try:
        employee = Employee.query.get(id_employee)

        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        db.session.delete(employee)
        db.session.commit()

        return jsonify({"message": "Employee deleted successfully"}), 200

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




def get_all_work_schedulesOP():
    """
    Mendapatkan semua jadwal kerja
    """
    try:
        schedules = (
            db.session.query(
                WorkSchedule.id.label("id"),
                WorkSchedule.name.label("name"),
                WorkSchedule.start_time.label("start_time"),
                WorkSchedule.end_time.label("end_time"),
                WorkSchedule.tolerance_minutes.label("tolerance_minutes"),
                WorkSchedule.created_at.label("created_at")
            )
            .order_by(WorkSchedule.created_at.desc())
            .all()
        )

        result = []
        for s in schedules:
            result.append({
                "id": s.id,
                "name": s.name,
                "start_time": s.start_time.strftime("%H:%M"),
                "end_time": s.end_time.strftime("%H:%M"),
                "tolerance_minutes": s.tolerance_minutes,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify({
            "total_schedules": len(result),
            "work_schedules": result
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def get_work_schedule_by_idOP(id_schedule: int):
    """
    Mendapatkan detail jadwal kerja berdasarkan ID
    """
    try:
        schedule = (
            db.session.query(
                WorkSchedule.id.label("id"),
                WorkSchedule.name.label("name"),
                WorkSchedule.start_time.label("start_time"),
                WorkSchedule.end_time.label("end_time"),
                WorkSchedule.tolerance_minutes.label("tolerance_minutes"),
                WorkSchedule.created_at.label("created_at"),
                WorkSchedule.updated_at.label("updated_at")
            )
            .filter(WorkSchedule.id == id_schedule)
            .first()
        )

        if not schedule:
            return jsonify({"message": "Work schedule not found"}), 404

        # Hitung jumlah karyawan yang menggunakan jadwal ini
        employee_count = (
            db.session.query(EmployeeSchedule)
            .filter(EmployeeSchedule.work_schedules_id == id_schedule)
            .count()
        )

        result = {
            "id": schedule.id,
            "name": schedule.name,
            "start_time": schedule.start_time.strftime("%H:%M"),
            "end_time": schedule.end_time.strftime("%H:%M"),
            "tolerance_minutes": schedule.tolerance_minutes,
            "created_at": schedule.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": schedule.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
            "employee_count": employee_count
        }

        return jsonify(result), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def create_work_scheduleOP():
    """
    Membuat jadwal kerja baru
    """
    try:
        data = request.get_json()

        # Validasi field wajib
        required_fields = ["name", "start_time", "end_time"]
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        # Cek duplikasi nama jadwal
        if WorkSchedule.query.filter(WorkSchedule.name == data["name"]).first():
            return jsonify({"message": "Work schedule with this name already exists"}), 409

        # Parse waktu dari string HH:MM ke time object
        try:
            start_time = datetime.strptime(data["start_time"], "%H:%M").time()
            end_time = datetime.strptime(data["end_time"], "%H:%M").time()
        except ValueError:
            return jsonify({"message": "Invalid time format. Use HH:MM format"}), 400

        # Validasi waktu mulai harus lebih awal dari waktu selesai
        if start_time >= end_time:
            return jsonify({"message": "Start time must be earlier than end time"}), 400

        new_schedule = WorkSchedule(
            name=data["name"],
            start_time=start_time,
            end_time=end_time,
            tolerance_minutes=data.get("tolerance_minutes", 0)
        )

        db.session.add(new_schedule)
        db.session.commit()

        return jsonify({
            "message": "Work schedule created successfully",
            "id": new_schedule.id
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def update_work_scheduleOP(id_schedule: int):
    """
    Mengupdate jadwal kerja
    """
    try:
        data = request.get_json()
        schedule = WorkSchedule.query.get(id_schedule)

        if not schedule:
            return jsonify({"message": "Work schedule not found"}), 404

        # Cek duplikasi nama jika ada perubahan
        if "name" in data and data["name"] != schedule.name:
            if WorkSchedule.query.filter(WorkSchedule.name == data["name"]).first():
                return jsonify({"message": "Work schedule name already exists"}), 409

        # Update nama jika ada
        if "name" in data:
            schedule.name = data["name"]

        # Update start_time jika ada
        if "start_time" in data:
            try:
                schedule.start_time = datetime.strptime(data["start_time"], "%H:%M").time()
            except ValueError:
                return jsonify({"message": "Invalid start_time format. Use HH:MM format"}), 400

        # Update end_time jika ada
        if "end_time" in data:
            try:
                schedule.end_time = datetime.strptime(data["end_time"], "%H:%M").time()
            except ValueError:
                return jsonify({"message": "Invalid end_time format. Use HH:MM format"}), 400

        # Validasi waktu mulai harus lebih awal dari waktu selesai
        if schedule.start_time >= schedule.end_time:
            return jsonify({"message": "Start time must be earlier than end time"}), 400

        # Update tolerance_minutes jika ada
        if "tolerance_minutes" in data:
            schedule.tolerance_minutes = data["tolerance_minutes"]

        db.session.commit()

        return jsonify({"message": "Work schedule updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def delete_work_scheduleOP(id_schedule: int):
    """
    Menghapus jadwal kerja
    """
    try:
        schedule = WorkSchedule.query.get(id_schedule)

        if not schedule:
            return jsonify({"message": "Work schedule not found"}), 404

        # Cek apakah jadwal sedang digunakan oleh karyawan
        employee_count = (
            db.session.query(EmployeeSchedule)
            .filter(EmployeeSchedule.work_schedules_id == id_schedule)
            .count()
        )

        if employee_count > 0:
            return jsonify({
                "message": f"Cannot delete work schedule. It is currently assigned to {employee_count} employee(s)"
            }), 409

        db.session.delete(schedule)
        db.session.commit()

        return jsonify({"message": "Work schedule deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500