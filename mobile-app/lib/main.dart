import 'package:flutter/material.dart';

import 'auth/auth_service.dart';
import 'auth/login_screen.dart';
import 'home_screen.dart';

void main() {
  runApp(const AicrpGoatBreedingApp());
}

class AicrpGoatBreedingApp extends StatefulWidget {
  const AicrpGoatBreedingApp({super.key});

  @override
  State<AicrpGoatBreedingApp> createState() => _AicrpGoatBreedingAppState();
}

class _AicrpGoatBreedingAppState extends State<AicrpGoatBreedingApp> {
  late Future<AuthSession?> _sessionFuture;

  @override
  void initState() {
    super.initState();
    _sessionFuture = AuthService().restoreSession();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AICRP Goat Breeding',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4A5D23)),
        useMaterial3: true,
      ),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => FutureBuilder<AuthSession?>(
          future: _sessionFuture,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }

            final session = snapshot.data;
            if (session == null) {
              return const LoginScreen();
            }

            return HomeScreen(session: session);
          },
        ),
      },
      home: FutureBuilder<AuthSession?>(
        future: _sessionFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }

          final session = snapshot.data;
          if (session == null) {
            return const LoginScreen();
          }

          return HomeScreen(session: session);
        },
      ),
    );
  }
}
