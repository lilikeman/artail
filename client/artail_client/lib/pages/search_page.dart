import 'package:flutter/material.dart';
import '../models/user.dart';
import '../widgets/user_tile.dart';
import '../services/api_service.dart';

class SearchPage extends StatefulWidget {
  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  TextEditingController _searchController = TextEditingController();
  List<User> _users = [];
  bool _loading = false;
  final ApiService _apiService = ApiService();

  Future<void> _searchUser(String query) async {
    setState(() {
      _loading = true;
    });

    try {
      await Future.delayed(Duration(seconds: 1)); // Simulating API delay

      List<User> searchResults = await _apiService.searchUsers(query);

      setState(() {
        _users = searchResults;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _users = [];
        _loading = false;
      });
    }
  }

  Future<void> _deleteUser(String userId) async {
    String message = await _apiService.deleteUsers(userId);
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
      appBar: AppBar(title: Text('사용자 검색'),        actions: [
          IconButton(
            icon: Icon(Icons.leaderboard),
            onPressed: () {
              // 랭킹 페이지로 이동
              Navigator.popAndPushNamed(context, '/ranking');
            },
          ),
        ],),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              // onChanged: _searchUser,
              onSubmitted: _searchUser,
              decoration: InputDecoration(
                labelText: 'User ID 또는 닉네임 입력',
                suffixIcon: IconButton(
                  icon : Icon(Icons.search),
                  onPressed: ()=>_searchUser(_searchController.text),
                )
                ,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: Text("검색결과가 없습니다"))
                : ListView.builder(
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
        ],
      ),
    );
  }
}
