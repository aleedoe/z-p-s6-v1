from flask_sqlalchemy import SQLAlchemy

# Inisialisasi database
db = SQLAlchemy()

from .admin import Admin
from .employee import Employee
from .attendance import Attendance
from .schedules import EmployeeSchedule, WorkSchedule, DailySchedule
