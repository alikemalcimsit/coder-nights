import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:mesajcell/product/home/view/home_view.dart';
import 'package:mesajcell/product/utility/const/constant_string.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: ConstantString.supportedLocales,
      path: ConstantString.langPath,
      fallbackLocale: ConstantString.trLocale,
      startLocale: ConstantString.trLocale,
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MesajCell',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6C3EED)),
        useMaterial3: true,
      ),
      home: const HomeView(),
    );
  }
}
