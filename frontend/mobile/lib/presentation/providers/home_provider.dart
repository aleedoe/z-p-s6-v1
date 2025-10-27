import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/storage_helper.dart';
import '../../data/models/home_status_model.dart';

class HomeProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  HomeStatusModel? _homeStatus;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  HomeStatusModel? get homeStatus => _homeStatus;

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
    ),
  );

  // Get today status
  Future<void> getTodayStatus() async {
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
        ApiConfig.homeStatus(userId),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        _homeStatus = HomeStatusModel.fromJson(response.data);
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data['message'] ?? 'Gagal memuat data';
    } catch (e) {
      _errorMessage = 'Terjadi kesalahan: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Refresh data
  Future<void> refresh() async {
    await getTodayStatus();
  }
}
