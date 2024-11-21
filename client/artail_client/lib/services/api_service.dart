import 'package:dio/dio.dart';
import '../models/user.dart';

class ApiService {
  final Dio _dio = Dio();
  int maxPage = 1;
  Future<List<User>> fetchUsers(int page) async {
    try {
      final response = await _dio.get(
        'http://15.165.170.112:3000/rankings',  
        queryParameters: {
          'page': page,
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = response.data['data']['rankings'];
        maxPage = response.data['data']['pagination']['totalPages'];
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
        'http://15.165.170.112:3000/users/search',  
        queryParameters: {
          'keyword': keyword,
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> data = response.data['data']['users'];
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
        'http://15.165.170.112:3000/users/$userId', 
        queryParameters: {
          'userId': userId,
        },
      );

      if (response.statusCode == 200) {
        String message = response.data['message'];
        return message;
      } else {
        throw Exception('Failed to delete id');
      }
    } catch (e) {
      throw Exception('Failed to delete id: $e');
    }
  }


  int getMaxPage(){
    return maxPage;
  }
}
