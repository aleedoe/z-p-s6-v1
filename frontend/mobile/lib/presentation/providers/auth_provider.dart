import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../core/config/api_config.dart';
import '../../core/utils/storage_helper.dart';
import '../../data/models/user_model.dart';

class AuthProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  UserModel? _user;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserModel? get user => _user;

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
    ),
  );

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _dio.post(
        ApiConfig.login,
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        _user = UserModel.fromJson(data);

        // Save token and user data
        await StorageHelper.saveToken(_user!.token ?? '');
        await StorageHelper.saveUserData(
          userId: _user!.id,
          userName: _user!.name,
          userEmail: _user!.email,
        );

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on DioException catch (e) {
      _errorMessage = e.response?.data['message'] ?? 'Login gagal';
    } catch (e) {
      _errorMessage = 'Terjadi kesalahan: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  // Check session
  Future<bool> checkSession() async {
    final isLoggedIn = await StorageHelper.isLoggedIn();
    if (isLoggedIn) {
      final userId = await StorageHelper.getUserId();
      final userName = await StorageHelper.getUserName();
      final userEmail = await StorageHelper.getUserEmail();

      if (userId != null && userName != null && userEmail != null) {
        _user = UserModel(id: userId, name: userName, email: userEmail);
        notifyListeners();
        return true;
      }
    }
    return false;
  }

  // Logout
  Future<void> logout() async {
    await StorageHelper.clearAll();
    _user = null;
    notifyListeners();
  }
}
