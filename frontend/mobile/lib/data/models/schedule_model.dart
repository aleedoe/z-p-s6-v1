class ScheduleModel {
  final int scheduleId;
  final String dayName;
  final String shiftName;
  final String startTime;
  final String endTime;
  final int toleranceMinutes;

  ScheduleModel({
    required this.scheduleId,
    required this.dayName,
    required this.shiftName,
    required this.startTime,
    required this.endTime,
    required this.toleranceMinutes,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      scheduleId: json['schedule_id'] ?? 0,
      dayName: json['day_name'] ?? '',
      shiftName: json['shift_name'] ?? '',
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      toleranceMinutes: json['tolerance_minutes'] ?? 0,
    );
  }
}

class ScheduleListModel {
  final int employeeId;
  final int totalSchedules;
  final List<ScheduleModel> data;

  ScheduleListModel({
    required this.employeeId,
    required this.totalSchedules,
    required this.data,
  });

  factory ScheduleListModel.fromJson(Map<String, dynamic> json) {
    return ScheduleListModel(
      employeeId: json['employee_id'] ?? 0,
      totalSchedules: json['total_schedules'] ?? 0,
      data:
          (json['data'] as List?)
              ?.map((item) => ScheduleModel.fromJson(item))
              .toList() ??
          [],
    );
  }
}
