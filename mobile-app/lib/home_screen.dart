import 'package:flutter/material.dart';

import 'auth/auth_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.session});

  final AuthSession session;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Goat Breeding'),
        actions: [
          IconButton(
            onPressed: () async {
              await AuthService().logout();
              if (!context.mounted) {
                return;
              }
              Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome ${session.user.fullName}', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(session.user.role),
          ],
        ),
      ),
    );
  }
}
