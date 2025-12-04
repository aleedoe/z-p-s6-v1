from flask import Blueprint
from .controllers.admin import get_all_employees, get_employee_by_id, create_employee, update_employee, delete_employee, get_all_work_schedules, get_work_schedule_by_id, get_all_attendance, get_attendance_by_id, get_available_schedules_for_employee, add_employee_schedule, update_employee_schedule, delete_employee_schedule, get_all_work_schedulesOP, get_work_schedule_by_idOP, create_work_scheduleOP, update_work_scheduleOP, delete_work_scheduleOP, admin_login

from .controllers.qr_attendance import generate_qr_token, scan_qr_attendance

admin_bp = Blueprint('admin', __name__)
employee_bp = Blueprint('employee', __name__)

# routes for admin
admin_bp.route('/employees', methods=['GET'])(get_all_employees)
admin_bp.route('/login', methods=['POST'])(admin_login)
admin_bp.route('/employees/<int:id_employee>', methods=['GET'])(get_employee_by_id)
admin_bp.route('/employees/available-schedules/<int:id_employee>', methods=['GET'])(get_available_schedules_for_employee)
admin_bp.route('/employees/<int:id_employee>/schedules', methods=['POST'])(add_employee_schedule)
admin_bp.route('/employees/<int:id_employee>/schedules/<int:id_employee_schedule>', methods=['PUT'])(update_employee_schedule)
admin_bp.route('/employees/<int:id_employee>/schedules/<int:id_employee_schedule>', methods=['DELETE'])(delete_employee_schedule)
admin_bp.route('/employees', methods=['POST'])(create_employee)
admin_bp.route('/employees/<int:id_employee>', methods=['PUT'])(update_employee)
admin_bp.route('/employees/<int:id_employee>', methods=['DELETE'])(delete_employee)

admin_bp.route('/work-schedules', methods=['GET'])(get_all_work_schedules)
admin_bp.route('/work-schedules/<int:id_schedule>', methods=['GET'])(get_work_schedule_by_id)
admin_bp.route('/attendance', methods=['GET'])(get_all_attendance)
admin_bp.route('/attendance/<int:attendance_id>', methods=['GET'])(get_attendance_by_id)


admin_bp.route('/work-schedulesOP', methods=['GET'])(get_all_work_schedulesOP)
admin_bp.route('/work-schedulesOP/<int:id_schedule>', methods=['GET'])(get_work_schedule_by_idOP)
admin_bp.route('/work-schedulesOP', methods=['POST'])(create_work_scheduleOP)
admin_bp.route('/work-schedulesOP/<int:id_schedule>', methods=['PUT'])(update_work_scheduleOP)
admin_bp.route('/work-schedulesOP/<int:id_schedule>', methods=['DELETE'])(delete_work_scheduleOP)

admin_bp.route('/work-schedulesOP/<int:schedule_id>/qr', methods=['POST'])(generate_qr_token)




from .controllers.employee import get_employee_today_status, get_employee_schedules, get_attendance_history, get_employee_detail, login, register, verify_token, change_password, get_attendance_detail, delete_attendance, get_all_attendance_today

employee_bp.route('/home/today-status/<int:id_employee>', methods=['GET'])(get_employee_today_status)
employee_bp.route('/schedules/<int:employee_id>', methods=['GET'])(get_employee_schedules)
employee_bp.route('/attendance-history/<int:employee_id>', methods=['GET'])(get_attendance_history)
employee_bp.route('/detail/<int:employee_id>', methods=['GET'])(get_employee_detail)


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

# =====================
# AUTH ROUTES
# =====================
auth_bp.route('/login', methods=['POST'])(login)
auth_bp.route('/register', methods=['POST'])(register)
auth_bp.route('/verify', methods=['GET'])(verify_token)
auth_bp.route('/change-password', methods=['POST'])(change_password)

# # =====================
# # EMPLOYEE ROUTES
# # =====================
# # Home status
# employee_bp.route('/home/today-status/<int:id_employee>', methods=['GET'])(
#     get_employee_today_status
# )

# # Schedules
# employee_bp.route('/schedules/<int:employee_id>', methods=['GET'])(
#     get_employee_schedules
# )

# # Attendance history
# employee_bp.route('/attendance-history/<int:employee_id>', methods=['GET'])(
#     get_attendance_history
# )

# # Employee detail
# employee_bp.route('/detail/<int:employee_id>', methods=['GET'])(
#     get_employee_detail
# )

# =====================
# ATTENDANCE ROUTES
# =====================
# Scan QR for attendance
attendance_bp.route('/scan', methods=['POST'])(
    scan_qr_attendance
)

# Get attendance detail
attendance_bp.route('/<int:attendance_id>', methods=['GET'])(
    get_attendance_detail
)

# Delete attendance
attendance_bp.route('/<int:attendance_id>', methods=['DELETE'])(
    delete_attendance
)

# Get all attendance today (monitoring)
attendance_bp.route('/today', methods=['GET'])(
    get_all_attendance_today
)