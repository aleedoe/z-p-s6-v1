from . import db

class WorkSchedule(db.Model):
    __tablename__ = 'work_schedules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    tolerance_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    employee_schedules = db.relationship('EmployeeSchedule', backref='work_schedule', cascade='all, delete-orphan')


class DailySchedule(db.Model):
    __tablename__ = 'daily_schedules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    employee_schedules = db.relationship('EmployeeSchedule', backref='daily_schedule', cascade='all, delete-orphan')


class EmployeeSchedule(db.Model):
    __tablename__ = 'employee_schedules'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    work_schedules_id = db.Column(db.Integer, db.ForeignKey('work_schedules.id'), nullable=False)
    daily_schedules_id = db.Column(db.Integer, db.ForeignKey('daily_schedules.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
