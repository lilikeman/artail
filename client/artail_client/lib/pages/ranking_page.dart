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
      appBar: AppBar(
        title: Text('랭킹 조회'),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {
              // 검색 페이지로 이동
              Navigator.popAndPushNamed(context, '/search');
            },
          ),
        ],
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator())
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
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          TableCell(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                '레벨',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          TableCell(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                '경험치',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          TableCell(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                '아이디',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          TableCell(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                '닉네임',
                                style: TextStyle(fontWeight: FontWeight.bold),
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
                            ],
                          ),
                      ],
                    ),
                  ),
                ),
                // 페이지 네비게이션 버튼
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
