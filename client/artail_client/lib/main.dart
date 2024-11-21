import 'package:flutter/material.dart';
import 'pages/ranking_page.dart';
import 'pages/search_page.dart';

void main() {
  runApp(MaterialApp(
    home: RankingPage(),
    routes: {
      '/ranking': (context) => RankingPage(),
      '/search': (context) => SearchPage(),
    },
  ));
}
