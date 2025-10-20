from flask import Blueprint
from .controllers.admin import get_all_employees, get_employee_by_id, get_all_work_schedules, get_work_schedule_by_id

admin_bp = Blueprint('admin', __name__)
employee_bp = Blueprint('employee', __name__)

# routes for admin
admin_bp.route('/employees', methods=['GET'])(get_all_employees)
admin_bp.route('/employees/<int:id_employee>', methods=['GET'])(get_employee_by_id)
admin_bp.route('/work-schedules', methods=['GET'])(get_all_work_schedules)
admin_bp.route('/work-schedules/<int:id_schedule>', methods=['GET'])(get_work_schedule_by_id)

