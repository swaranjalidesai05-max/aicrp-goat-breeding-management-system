import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthUser {
  AuthUser({required this.id, required this.email, required this.fullName, required this.role});

  final String id;
  final String email;
  final String fullName;
  final String role;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: json['role'] as String,
    );
  }
}

class AuthSession {
  AuthSession({required this.user, required this.accessToken, required this.refreshToken});

  final AuthUser user;
  final String accessToken;
  final String refreshToken;
}

class AuthService {
  static const _baseUrl = 'http://localhost:4000/api/v1/auth';

  Future<AuthSession> login({required String email, required String password}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode != 200) {
      throw Exception('Unable to sign in');
    }

    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    final user = AuthUser.fromJson(payload['user'] as Map<String, dynamic>);
    final tokens = payload['tokens'] as Map<String, dynamic>;
    final session = AuthSession(
      user: user,
      accessToken: tokens['accessToken'] as String,
      refreshToken: tokens['refreshToken'] as String,
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth.user', jsonEncode(payload['user']));
    await prefs.setString('auth.accessToken', session.accessToken);
    await prefs.setString('auth.refreshToken', session.refreshToken);
    return session;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('auth.refreshToken');
    if (refreshToken != null) {
      await http.post(
        Uri.parse('$_baseUrl/logout'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );
    }
    await prefs.remove('auth.user');
    await prefs.remove('auth.accessToken');
    await prefs.remove('auth.refreshToken');
  }

  Future<AuthSession?> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final storedUser = prefs.getString('auth.user');
    final accessToken = prefs.getString('auth.accessToken');
    final refreshToken = prefs.getString('auth.refreshToken');

    if (storedUser == null || accessToken == null || refreshToken == null) {
      return null;
    }

    final user = AuthUser.fromJson(jsonDecode(storedUser) as Map<String, dynamic>);
    return AuthSession(user: user, accessToken: accessToken, refreshToken: refreshToken);
  }
}
