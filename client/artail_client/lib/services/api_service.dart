import 'package:dio/dio.dart';

import '../models/user.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    headers: {
      'Content-Type': 'application/json',
      "Accept": "*/*",
    },
  ));
  int maxPage = 1;

  Future<List<User>> fetchUsers(int page) async {
    try {
      final response = await _dio.get(
        'https://wvdk20k7eg.execute-api.ap-northeast-2.amazonaws.com/Prod/rankings',
        queryParameters: {
          'page': page,
        },
      );
      if (response.statusCode == 200) {
        print(response.data);
        List<dynamic> data = response.data['data']['data']['rankings'];
        maxPage = response.data['data']['data']['pagination']['totalPages'];
        return data.map((userData) => User.fromJson(userData)).toList();
      } else {
        throw Exception('Failed to load ranking');
      }
    } catch (e) {
      throw Exception('Failed to fetch users: $e');
    }
  }

  Future<List<User>> searchUsers(String keyword) async {
    try {
      final response = await _dio.get(
        'https://wvdk20k7eg.execute-api.ap-northeast-2.amazonaws.com/Prod/users/search',
        queryParameters: {
          'keyword': keyword,
        },
      );

      if (response.statusCode == 200) {
                print(response.data);

        List<dynamic> data = response.data['data']['data']['users'];
        return data.map((userData) => User.fromJson(userData)).toList();
      } else {
        throw Exception('검색결과 x');
      }
    } catch (e) {
      throw Exception('$e');
    }
  }

  Future<String> deleteUsers(String userId) async {
    try {
      final response = await _dio.delete(
        'https://wvdk20k7eg.execute-api.ap-northeast-2.amazonaws.com/Prod/users',
        queryParameters: {
          'userId': userId,
        },
      );
        print(response.data);

      if (response.statusCode == 200) {
        String message = response.data['data']['message'];
        return message;
      } else {
        throw Exception('아이디 삭제실패');
      }
    } catch (e) {
      throw Exception('아이디 삭제실패: $e');
    }
  }

  int getMaxPage() {
    return maxPage;
  }
}
