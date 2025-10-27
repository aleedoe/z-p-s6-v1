import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/storage_helper.dart';
import '../../data/models/attendance_model.dart';

class HistoryProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  AttendanceHistoryModel? _history;
  bool _showWeekly = true;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AttendanceHistoryModel? get history => _history;
  bool get showWeekly => _showWeekly;

  List<AttendanceModel> get currentHistory => _showWeekly
      ? (_history?.weeklyHistory ?? [])
      : (_history?.monthlyHistory ?? []);

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
    ),
  );

  // Toggle view
  void toggleView() {
    _showWeekly = !_showWeekly;
    notifyListeners();
  }

  // Get history
  Future<void> getHistory() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final userId = await StorageHelper.getUserId();
      final token = await StorageHelper.getToken();

      if (userId == null || token == null) {
        throw Exception('User not logged in');
      }

      final response = await _dio.get(
        ApiConfig.attendanceHistory(userId),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        _history = AttendanceHistoryModel.fromJson(response.data);
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data['message'] ?? 'Gagal memuat riwayat';
    } catch (e) {
      _errorMessage = 'Terjadi kesalahan: $e';
    }

    _isLoading = false;
    notifyListeners();
  }
}
