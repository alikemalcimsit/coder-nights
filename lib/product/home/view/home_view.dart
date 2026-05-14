import 'package:flutter/material.dart';
import 'package:mesajcell/product/utility/const/constant_color.dart';
import 'package:mesajcell/product/utility/const/constant_string.dart';

// TODO: API entegrasyonu yapıldığında bu model ayrı bir dosyaya taşınacak
class ChatUser {
  final String name;
  final String lastMessage;
  final String time;
  final String avatarInitials;
  final Color avatarColor;
  final int unreadCount;

  const ChatUser({
    required this.name,
    required this.lastMessage,
    required this.time,
    required this.avatarInitials,
    required this.avatarColor,
    this.unreadCount = 0,
  });
}

// TODO: API'den çekilecek, mock data
final List<ChatUser> _mockUsers = [
  ChatUser(
    name: 'Ahmet Yılmaz',
    lastMessage: 'Yarın görüşürüz 👋',
    time: '09:45',
    avatarInitials: 'AY',
    avatarColor: ConstColor.avatarBlue,
    unreadCount: 2,
  ),
  ChatUser(
    name: 'Zeynep Kaya',
    lastMessage: 'Tamam, anlıyorum.',
    time: 'Dün',
    avatarInitials: 'ZK',
    avatarColor: ConstColor.avatarPurple,
  ),
  ChatUser(
    name: 'Mehmet Demir',
    lastMessage: 'Dosyayı gönderdim.',
    time: 'Dün',
    avatarInitials: 'MD',
    avatarColor: ConstColor.avatarGreen,
    unreadCount: 5,
  ),
  ChatUser(
    name: 'Elif Şahin',
    lastMessage: 'Harika! Görüşürüz 😊',
    time: 'Pazartesi',
    avatarInitials: 'EŞ',
    avatarColor: ConstColor.avatarOrange,
  ),
  ChatUser(
    name: 'Can Arslan',
    lastMessage: 'Nerede buluşuyoruz?',
    time: 'Pazar',
    avatarInitials: 'CA',
    avatarColor: ConstColor.avatarTeal,
  ),
  ChatUser(
    name: 'Ayşe Çelik',
    lastMessage: 'Evet, uygun.',
    time: '12.05.2026',
    avatarInitials: 'AÇ',
    avatarColor: ConstColor.avatarRed,
  ),
];

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final TextEditingController _searchController = TextEditingController();
  List<ChatUser> _filteredUsers = _mockUsers;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredUsers = _mockUsers;
      } else {
        _filteredUsers = _mockUsers
            .where((user) =>
                user.name.toLowerCase().contains(query.toLowerCase()) ||
                user.lastMessage.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ConstColor.scaffold,
      appBar: AppBar(
        backgroundColor: ConstColor.appBarBackground,
        elevation: 0,
        titleSpacing: 20,
        title: Text(
          ConstantString.chats,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: ConstColor.black,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: ConstColor.black),
            onPressed: () {
              // TODO: Yeni sohbet başlatma
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Arama çubuğu
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: ConstantString.search,
                hintStyle: TextStyle(color: ConstColor.grey500),
                prefixIcon: Icon(Icons.search, color: ConstColor.grey500),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, color: ConstColor.grey500),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: ConstColor.searchFieldBackground,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          // Kullanıcı listesi
          Expanded(
            child: _filteredUsers.isEmpty
                ? Center(
                    child: Text(
                      ConstantString.noResultFound,
                      style: TextStyle(color: ConstColor.grey500),
                    ),
                  )
                : ListView.separated(
                    itemCount: _filteredUsers.length,
                    separatorBuilder: (_, __) => const Divider(
                      indent: 80,
                      height: 1,
                      color: ConstColor.divider,
                    ),
                    itemBuilder: (context, index) {
                      final user = _filteredUsers[index];
                      return _ChatTile(user: user);
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Yeni sohbet başlatma
        },
        backgroundColor: ConstColor.primary,
        child: const Icon(Icons.message_outlined, color: ConstColor.white),
      ),
    );
  }
}

class _ChatTile extends StatelessWidget {
  final ChatUser user;

  const _ChatTile({required this.user});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      leading: CircleAvatar(
        radius: 26,
        backgroundColor: user.avatarColor,
        child: Text(
          user.avatarInitials,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
      title: Text(
        user.name,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
      subtitle: Text(
        user.lastMessage,
        style: TextStyle(
          color: ConstColor.grey600,
          fontSize: 13,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            user.time,
            style: TextStyle(
              color: user.unreadCount > 0
                  ? ConstColor.primary
                  : ConstColor.grey500,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          if (user.unreadCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: ConstColor.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                user.unreadCount.toString(),
                style: const TextStyle(
                  color: ConstColor.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
      onTap: () {
        // TODO: Sohbet detay sayfasına git
      },
    );
  }
}
