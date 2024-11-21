class User {
  final String userId;
  final String nickname;
  final int level;
  final int experience;
  final int rank;

  User({
    required this.userId,
    required this.nickname,
    required this.level,
    required this.experience,
    required this.rank
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'],
      nickname: json['nickname'],
      level: json['level'],
      experience: json['experience'],
      rank: json['rank'],
    );
  }
}
