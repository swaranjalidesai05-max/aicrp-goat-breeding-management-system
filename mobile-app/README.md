# Mobile App

Flutter application for field data enumerators (offline-first sync, GPS verification).

## Status

**Phase 0 placeholder.** `pubspec.yaml` and a minimal `lib/main.dart` are present so the monorepo layout is complete. Full Android/iOS platform folders should be generated with the Flutter SDK before feature work.

## Planned stack (later phases)

- Flutter
- SQLite (local store)
- GPS
- Offline sync against the Express API (JWT)

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.5+
- Android Studio / Xcode as needed for device builds

## Bootstrap platform projects

From this directory, after installing Flutter:

```bash
flutter create . --project-name aicrp_goat_breeding --org in.gov.aicrp
flutter pub get
flutter run
```

If `flutter create .` warns about existing files, keep `lib/main.dart` and `pubspec.yaml` from this repo.

## Folder structure (Phase 0)

```
mobile-app/
├── lib/
│   └── main.dart              # Placeholder Material shell
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

Platform folders (`android/`, `ios/`, etc.) appear after `flutter create`.

## Phase 0 notes

- No auth, sync engine, GPS, or breeding forms yet.
- Do not treat this as a runnable production app until Flutter tooling is installed and platforms are generated.
