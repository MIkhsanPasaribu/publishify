import 'package:flutter/material.dart';
import 'package:publishify/pages/auth/splash_screen.dart';
import 'package:publishify/pages/auth/login_page.dart';
import 'package:publishify/pages/auth/register_page.dart';
import 'package:publishify/pages/auth/success_page.dart';
import 'package:publishify/pages/main_layout.dart';
import 'package:publishify/pages/writer/upload/upload_book_page.dart';
import 'package:publishify/pages/writer/review/review_page.dart';
import 'package:publishify/pages/writer/print/print_page.dart';
import 'package:publishify/pages/writer/percetakan/pilih_percetakan_page.dart';
import 'package:publishify/pages/writer/naskah/naskah_list_page.dart';
import 'package:publishify/pages/writer/naskah/detail_naskah_page.dart';
import 'package:publishify/pages/writer/naskah/naskah_form_page.dart';
import 'package:publishify/pages/editor/home/editor_dashboard_page.dart';
import 'package:publishify/models/writer/naskah_models.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String success = '/success';
  static const String home = '/home';
  static const String statistics = '/statistics';
  static const String notifications = '/notifications';
  static const String profile = '/profile';
  static const String uploadBook = '/upload-book';
  static const String review = '/review';
  static const String print = '/print';
  static const String pilihPercetakan = '/pilih-percetakan';
  static const String naskahList = '/naskah-list';
  static const String detailNaskah = '/detail-naskah';
  static const String naskahForm = '/naskah-form';

  // Dashboard routes untuk setiap role
  static const String dashboardPenulis = '/dashboard/penulis';
  static const String dashboardEditor = '/dashboard/editor';
  static const String dashboardPercetakan = '/dashboard/percetakan';
  static const String dashboardAdmin = '/dashboard/admin';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      splash: (context) => const SplashScreen(),
      login: (context) => const LoginPage(),
      register: (context) => const RegisterPage(),
      success: (context) => const SuccessPage(),
      home: (context) => const MainLayout(initialIndex: 0),
      uploadBook: (context) => const UploadBookPage(),
      review: (context) => const ReviewPage(),
      print: (context) => const PrintPage(),
      pilihPercetakan: (context) => const PilihPercetakanPage(),
      naskahList: (context) => const NaskahListPage(),
      naskahForm: (context) => const NaskahFormPage(), // Create new naskah
      // Dashboard routes - sesuai role masing-masing
      dashboardPenulis: (context) => const MainLayout(initialIndex: 0),
      dashboardEditor: (context) => const EditorDashboardPage(),
      dashboardPercetakan: (context) => const MainLayout(initialIndex: 0),
      dashboardAdmin: (context) => const MainLayout(initialIndex: 0),
    };
  }

  // Navigate to detail naskah with parameter
  static void navigateToDetailNaskah(BuildContext context, String naskahId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DetailNaskahPage(naskahId: naskahId),
      ),
    );
  }

  // Navigate to create new naskah
  static Future<bool?> navigateToCreateNaskah(BuildContext context) {
    return Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (context) => const NaskahFormPage()),
    );
  }

  // Navigate to edit naskah
  static Future<bool?> navigateToEditNaskah(
    BuildContext context,
    NaskahData naskah,
  ) {
    return Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (context) => NaskahFormPage(naskah: naskah)),
    );
  }
}
