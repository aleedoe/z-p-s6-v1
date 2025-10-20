from . import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

class Employee(db.Model):
    __tablename__ = 'employee'

    id = db.Column(db.Integer, primary_key=True)
    nik = db.Column(db.String(20), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False)
    gender = db.Column(db.Enum('Male', 'Female', 'Other'), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    attendances = db.relationship('Attendance', backref='employee', cascade='all, delete-orphan')
    employee_schedules = db.relationship('EmployeeSchedule', backref='employee', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_auth_token(self):
        return create_access_token(identity={'id': self.id, 'role': 'employee'})