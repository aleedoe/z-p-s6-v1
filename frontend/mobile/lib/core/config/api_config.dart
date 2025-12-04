class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  static const String login = '$baseUrl/auth/login';

  static String homeStatus(int employeeId) =>
      '$baseUrl/employee/home/today-status/$employeeId';
  static String schedules(int employeeId) =>
      '$baseUrl/employee/schedules/$employeeId';
  static String attendanceHistory(int employeeId) =>
      '$baseUrl/employee/attendance-history/$employeeId';

  static const String scanAttendance = '$baseUrl/attendance/scan';

  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
