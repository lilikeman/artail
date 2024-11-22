import 'package:flutter/material.dart';
import '../models/user.dart';
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

  Future<void> _deleteUser(User user) async {
    String message = await _apiService.deleteUsers(user.userId);
    setState(() {
      _users.remove(user); // _users 리스트에서 해당 유저를 제거
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('$message'),
        backgroundColor: Colors.black,
      ));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('사용자 검색'),
        actions: [
          IconButton(
            icon: Icon(Icons.leaderboard),
            onPressed: () {
              // 랭킹 페이지로 이동
              Navigator.popAndPushNamed(context, '/ranking');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onSubmitted: _searchUser,
              decoration: InputDecoration(
                labelText: 'User ID 또는 닉네임 입력',
                suffixIcon: IconButton(
                  icon: Icon(Icons.search),
                  onPressed: () => _searchUser(_searchController.text),
                ),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: Text("검색결과가 없습니다"))
                : Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(0.0),
                        child: Table(
                          border: TableBorder.all(),
                          columnWidths: {
                            0: FlexColumnWidth(1), // 랭킹 열, 화면 크기에 비례하여 크기 조정
                            1: FlexColumnWidth(2), // 레벨 열
                            2: FlexColumnWidth(2), // 경험치 열
                            3: FlexColumnWidth(3), // 아이디 열
                            4: FlexColumnWidth(3), // 닉네임 열
                            5: FlexColumnWidth(1), // 삭제 버튼 열
                          },
                          children: [
                            // 표 헤더
                            TableRow(
                              decoration: BoxDecoration(
                                color: Colors.grey[200], // 헤더 배경색
                              ),
                              children: [
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '랭킹',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '레벨',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '경험치',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '아이디',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '닉네임',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                TableCell(
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '삭제',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Scrollable Table Body
                      Expanded(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.vertical,
                          child: Table(
                            border: TableBorder.all(),
                            columnWidths: {
                              0: FlexColumnWidth(1),
                              1: FlexColumnWidth(2),
                              2: FlexColumnWidth(2),
                              3: FlexColumnWidth(3),
                              4: FlexColumnWidth(3),
                              5: FlexColumnWidth(1), // 삭제 버튼 열
                            },
                            children: [
                              // 데이터 행
                              for (var user in _users)
                                TableRow(
                                  children: [
                                    TableCell(
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Text(user.rank.toString()),
                                      ),
                                    ),
                                    TableCell(
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Text(user.level.toString()),
                                      ),
                                    ),
                                    TableCell(
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Text(user.experience.toString()),
                                      ),
                                    ),
                                    TableCell(
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Text(user.userId),
                                      ),
                                    ),
                                    TableCell(
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Text(user.nickname),
                                      ),
                                    ),
                                    TableCell(
                                      child: IconButton(
                                        icon: Icon(Icons.delete,
                                            color: Colors.red),
                                        onPressed: () {
                                          // 삭제할 유저를 정확히 전달
                                          _deleteUser(user);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}
