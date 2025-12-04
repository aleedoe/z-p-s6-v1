import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/storage_helper.dart';

class QrProvider with ChangeNotifier {
  bool _isScanning = false;
  bool _isProcessing = false;
  String? _errorMessage;
  String? _successMessage;
  Map<String, dynamic>? _attendanceData;

  bool get isScanning => _isScanning;
  bool get isProcessing => _isProcessing;
  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;
  Map<String, dynamic>? get attendanceData => _attendanceData;

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
    ),
  );

  void startScanning() {
    _isScanning = true;
    _errorMessage = null;
    _successMessage = null;
    _attendanceData = null;
    notifyListeners();
  }

  void stopScanning() {
    _isScanning = false;
    notifyListeners();
  }

  /// Submit attendance with QR validation
  Future<bool> submitAttendance(String qrData) async {
    if (_isProcessing) return false;

    _isProcessing = true;
    _errorMessage = null;
    _successMessage = null;
    _attendanceData = null;
    notifyListeners();

    try {
      final token = await StorageHelper.getToken();
      final userId = await StorageHelper.getUserId();

      if (token == null || userId == null) {
        throw Exception('User not logged in');
      }

      final response = await _dio.post(
        ApiConfig.scanAttendance,
        data: {
          'qr_data': qrData,
          'employee_id': userId,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data['message'] ?? 'Absensi berhasil';
        _attendanceData = response.data['attendance'];
        _isProcessing = false;
        notifyListeners();
        return true;
      } else {
        throw Exception('Unexpected status code: ${response.statusCode}');
      }
    } on DioException catch (e) {
      // Handle specific error messages from backend
      if (e.response?.statusCode == 400) {
        _errorMessage = e.response?.data['message'] ?? 'QR Code tidak valid';
      } else if (e.response?.statusCode == 403) {
        _errorMessage = e.response?.data['message'] ?? 'Anda tidak terdaftar di jadwal ini';
      } else if (e.response?.statusCode == 404) {
        _errorMessage = 'Karyawan tidak ditemukan';
      } else {
        _errorMessage = e.response?.data['message'] ?? 'Absensi gagal. Silakan coba lagi.';
      }
      debugPrint('Attendance error: ${e.message}');
      debugPrint('Response: ${e.response?.data}');
    } catch (e) {
      _errorMessage = 'Terjadi kesalahan: ${e.toString()}';
      debugPrint('Unexpected error: $e');
    }

    _isProcessing = false;
    notifyListeners();
    return false;
  }

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    _attendanceData = null;
    notifyListeners();
  }
}