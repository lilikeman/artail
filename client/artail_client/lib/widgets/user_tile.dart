import 'package:flutter/material.dart';
import '../models/user.dart';

class UserTile extends StatelessWidget {
  final User user;
  final Function onDelete;

  UserTile({required this.user, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text('닉네임 : ${user.nickname}'),
      subtitle: Text('레벨: ${user.level}, 경험치: ${user.experience}, 랭킹: ${user.rank}'),
      trailing: IconButton(
        icon: Icon(Icons.delete),
        onPressed: () => onDelete(user.userId),
      ),
    );
  }
}
