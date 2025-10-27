class HomeStatusModel {
  final String absenStatusToday;
  final int employeeId;
  final String startTime;
  final String endTime;
  final String shiftName;
  final String dayName;

  HomeStatusModel({
    required this.absenStatusToday,
    required this.employeeId,
    required this.startTime,
    required this.endTime,
    required this.shiftName,
    required this.dayName,
  });

  factory HomeStatusModel.fromJson(Map<String, dynamic> json) {
    return HomeStatusModel(
      absenStatusToday: json['absen_status_today'] ?? 'not_yet',
      employeeId: json['employee_id'] ?? 0,
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      shiftName: json['shift_name'] ?? '',
      dayName: json['day_name'] ?? '',
    );
  }

  String get statusText {
    switch (absenStatusToday) {
      case 'present':
        return 'Sudah Absen';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return 'Belum Absen';
    }
  }
}
