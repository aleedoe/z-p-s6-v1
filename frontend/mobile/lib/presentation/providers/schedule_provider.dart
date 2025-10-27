import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/storage_helper.dart';
import '../../data/models/schedule_model.dart';

class ScheduleProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  List<ScheduleModel> _schedules = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<ScheduleModel> get schedules => _schedules;

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
    ),
  );

  // Get schedules
  Future<void> getSchedules() async {
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
        ApiConfig.schedules(userId),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        final scheduleList = ScheduleListModel.fromJson(response.data);
        _schedules = scheduleList.data;
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data['message'] ?? 'Gagal memuat jadwal';
    } catch (e) {
      _errorMessage = 'Terjadi kesalahan: $e';
    }

    _isLoading = false;
    notifyListeners();
  }
}
