import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../widgets/user_tile.dart';

class RankingPage extends StatefulWidget {
  @override
  _RankingPageState createState() => _RankingPageState();
}

class _RankingPageState extends State<RankingPage> {
  List<User> _users = [];
  int _currentPage = 1;
  int _maxPage = 100;
  bool _loading = false;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchRanking();
  }

  Future<void> _fetchRanking() async {
    setState(() {
      _loading = true;
    });

    try {
      List<User> fetchedUsers = await _apiService.fetchUsers(_currentPage);
      _maxPage = _apiService.getMaxPage();
      setState(() {
        _users = fetchedUsers;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Error: $e'),
        backgroundColor: Colors.red,
      ));
    }
  }

  void _changePage(int page) {
    setState(() {
      _currentPage = page;
    });
    _fetchRanking();
  }

  Future<void> _deleteUser(String userId) async {
    String message = await _apiService.deleteUsers(userId);
    _fetchRanking();
    setState(() {
      _users.removeWhere((user) => user.userId == userId);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('$message'),
        backgroundColor: Colors.black,
      ));
    });
    // 실제로는 DB에서 삭제하는 API 호출을 여기에 추가
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('랭킹 조회'),actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {
              // 검색 페이지로 이동
              Navigator.popAndPushNamed(context, '/search');
            },
          ),
        ],),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: _users.length,
                    itemBuilder: (context, index) {
                      final user = _users[index];
                      return UserTile(
                        user: user,
                        onDelete: _deleteUser,
                      );
                    },
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_left),
                      onPressed: _currentPage > 1
                          ? () => _changePage(_currentPage - 1)
                          : null,
                    ),
                    Text('Page $_currentPage'),
                    IconButton(
                      icon: Icon(Icons.arrow_right),
                      onPressed: _currentPage < _maxPage
                          ? () => _changePage(_currentPage + 1)
                          : null,
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}
