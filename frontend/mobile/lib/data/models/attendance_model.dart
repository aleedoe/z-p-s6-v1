class AttendanceModel {
  final int attendanceId;
  final String date;
  final String createdAt;

  AttendanceModel({
    required this.attendanceId,
    required this.date,
    required this.createdAt,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      attendanceId: json['attendance_id'] ?? 0,
      date: json['date'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class AttendanceHistoryModel {
  final int employeeId;
  final String employeeName;
  final Map<String, String> weeklyRange;
  final Map<String, String> monthlyRange;
  final List<AttendanceModel> weeklyHistory;
  final List<AttendanceModel> monthlyHistory;

  AttendanceHistoryModel({
    required this.employeeId,
    required this.employeeName,
    required this.weeklyRange,
    required this.monthlyRange,
    required this.weeklyHistory,
    required this.monthlyHistory,
  });

  factory AttendanceHistoryModel.fromJson(Map<String, dynamic> json) {
    return AttendanceHistoryModel(
      employeeId: json['employee_id'] ?? 0,
      employeeName: json['employee_name'] ?? '',
      weeklyRange: Map<String, String>.from(json['weekly_range'] ?? {}),
      monthlyRange: Map<String, String>.from(json['monthly_range'] ?? {}),
      weeklyHistory:
          (json['weekly_history'] as List?)
              ?.map((item) => AttendanceModel.fromJson(item))
              .toList() ??
          [],
      monthlyHistory:
          (json['monthly_history'] as List?)
              ?.map((item) => AttendanceModel.fromJson(item))
              .toList() ??
          [],
    );
  }
}
