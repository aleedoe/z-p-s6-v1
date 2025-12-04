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
      // Pastikan content type JSON
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
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
      final userId = await StorageHelper.getUserId();

      if (userId == null) {
        throw Exception('User not logged in');
      }

      // Log untuk debugging
      debugPrint('Submitting attendance...');
      debugPrint('QR Data: $qrData');
      debugPrint('User ID: $userId');
      debugPrint('API URL: ${ApiConfig.scanAttendance}');

      final requestData = {
        'qr_data': qrData,
        'employee_id': userId,
      };

      debugPrint('Request data: $requestData');

      final response = await _dio.post(
        ApiConfig.scanAttendance,
        data: requestData,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          validateStatus: (status) {
            // Accept all status codes to handle them manually
            return status != null && status < 500;
          },
        ),
      );

      debugPrint('Response status: ${response.statusCode}');
      debugPrint('Response data: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data['message'] ?? 'Absensi berhasil';
        _attendanceData = response.data['attendance'];
        _isProcessing = false;
        notifyListeners();
        return true;
      } else if (response.statusCode == 400) {
        _errorMessage = response.data['message'] ?? 'Data tidak valid';
        debugPrint('Received data: ${response.data['received']}');
      } else if (response.statusCode == 403) {
        _errorMessage = response.data['message'] ?? 'Anda tidak terdaftar di jadwal ini';
      } else if (response.statusCode == 404) {
        _errorMessage = 'Karyawan tidak ditemukan';
      } else if (response.statusCode == 422) {
        _errorMessage = 'Data yang dikirim tidak valid. Periksa format QR Code.';
        debugPrint('422 Error - Invalid data format');
      } else {
        _errorMessage = response.data['message'] ?? 'Absensi gagal';
      }
    } on DioException catch (e) {
      debugPrint('DioException occurred');
      debugPrint('Error type: ${e.type}');
      debugPrint('Error message: ${e.message}');
      debugPrint('Response: ${e.response?.data}');
      debugPrint('Status code: ${e.response?.statusCode}');

      // Handle specific error messages from backend
      if (e.response?.statusCode == 400) {
        _errorMessage = e.response?.data['message'] ?? 'QR Code tidak valid';
      } else if (e.response?.statusCode == 403) {
        _errorMessage = e.response?.data['message'] ?? 'Anda tidak terdaftar di jadwal ini';
      } else if (e.response?.statusCode == 404) {
        _errorMessage = 'Karyawan tidak ditemukan';
      } else if (e.response?.statusCode == 422) {
        _errorMessage = 'Format data tidak valid. Pastikan QR Code benar.';
      } else if (e.type == DioExceptionType.connectionTimeout) {
        _errorMessage = 'Koneksi timeout. Periksa koneksi internet Anda.';
      } else if (e.type == DioExceptionType.receiveTimeout) {
        _errorMessage = 'Server tidak merespons. Coba lagi.';
      } else if (e.type == DioExceptionType.badResponse) {
        _errorMessage = e.response?.data['message'] ?? 'Server error. Coba lagi.';
      } else {
        _errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }
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