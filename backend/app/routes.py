from flask import Blueprint

admin_bp = Blueprint('admin', __name__)
employee_bp = Blueprint('employee', __name__)

from .controllers.employee import get_all_employees

admin_bp.route('/employees', methods=['GET'])(get_all_employees)


