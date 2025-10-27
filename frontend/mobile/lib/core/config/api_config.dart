class ApiConfig {
  // Base URL - ganti dengan IP server Anda
  static const String baseUrl = 'http://127.0.0.1:5000/api';

  // Auth Endpoints
  static const String login = '$baseUrl/auth/login';

  // Employee Endpoints
  static String homeStatus(int employeeId) =>
      '$baseUrl/employee/home/today-status/$employeeId';
  static String schedules(int employeeId) =>
      '$baseUrl/employee/schedules/$employeeId';
  static String attendanceHistory(int employeeId) =>
      '$baseUrl/employee/attendance-history/$employeeId';

  // Attendance Endpoints
  static const String scanAttendance = '$baseUrl/attendance/scan';

  // Timeout
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
