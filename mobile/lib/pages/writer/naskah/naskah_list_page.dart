import 'package:flutter/material.dart';
import 'package:publishify/utils/theme.dart';
import 'package:publishify/models/writer/naskah_models.dart';
import 'package:publishify/services/writer/naskah_service.dart';
import 'package:publishify/utils/routes.dart';

class NaskahListPage extends StatefulWidget {
  const NaskahListPage({super.key});

  @override
  State<NaskahListPage> createState() => _NaskahListPageState();
}

class _NaskahListPageState extends State<NaskahListPage> {
  List<NaskahData> _naskahList = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  int _totalPages = 1;
  String _selectedSort = 'dibuatPada';
  String _selectedDirection = 'desc';
  String? _searchQuery;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadNaskah();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoadingMore && _currentPage < _totalPages) {
        _loadMore();
      }
    }
  }

  Future<void> _loadNaskah() async {
    setState(() {
      _isLoading = true;
      _currentPage = 1;
    });

    try {
      final response = await NaskahService.getAllNaskah(
        halaman: _currentPage,
        limit: 20,
        cari: _searchQuery,
        urutkan: _selectedSort,
        arah: _selectedDirection,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
          if (response.sukses && response.data != null) {
            _naskahList = response.data!;
            _totalPages = response.metadata?.totalHalaman ?? 1;
          } else {
            _naskahList = [];
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _naskahList = [];
        });
      }
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || _currentPage >= _totalPages) return;

    setState(() {
      _isLoadingMore = true;
      _currentPage++;
    });

    try {
      final response = await NaskahService.getAllNaskah(
        halaman: _currentPage,
        limit: 20,
        cari: _searchQuery,
        urutkan: _selectedSort,
        arah: _selectedDirection,
      );

      if (mounted) {
        setState(() {
          _isLoadingMore = false;
          if (response.sukses && response.data != null) {
            _naskahList.addAll(response.data!);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingMore = false;
        });
      }
    }
  }

  /// Navigasi ke halaman buat naskah baru
  Future<void> _createNewNaskah() async {
    final result = await AppRoutes.navigateToCreateNaskah(context);
    if (result == true) {
      // Refresh list jika naskah berhasil dibuat
      _loadNaskah();
    }
  }

  /// Navigasi ke halaman edit naskah
  Future<void> _editNaskah(NaskahData naskah) async {
    final result = await AppRoutes.navigateToEditNaskah(context, naskah);
    if (result == true) {
      // Refresh list jika naskah berhasil diperbarui
      _loadNaskah();
    }
  }

  void _showSortDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Urutkan'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildSortOption('Tanggal Upload', 'dibuatPada'),
              _buildSortOption('Judul', 'judul'),
              _buildSortOption('Status', 'status'),
              _buildSortOption('Jumlah Halaman', 'jumlahHalaman'),
              const Divider(),
              _buildDirectionOption('Terbaru → Terlama', 'desc'),
              _buildDirectionOption('Terlama → Terbaru', 'asc'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSortOption(String label, String value) {
    final isSelected = _selectedSort == value;
    return ListTile(
      leading: Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppTheme.primaryGreen : AppTheme.greyMedium,
            width: 2,
          ),
        ),
        child: isSelected
            ? Center(
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.primaryGreen,
                  ),
                ),
              )
            : null,
      ),
      title: Text(label),
      onTap: () {
        setState(() {
          _selectedSort = value;
        });
        Navigator.pop(context);
        _loadNaskah();
      },
    );
  }

  Widget _buildDirectionOption(String label, String value) {
    final isSelected = _selectedDirection == value;
    return ListTile(
      leading: Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppTheme.primaryGreen : AppTheme.greyMedium,
            width: 2,
          ),
        ),
        child: isSelected
            ? Center(
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.primaryGreen,
                  ),
                ),
              )
            : null,
      ),
      title: Text(label),
      onTap: () {
        setState(() {
          _selectedDirection = value;
        });
        Navigator.pop(context);
        _loadNaskah();
      },
    );
  }

  String _getStatusLabel(String status) {
    final Map<String, String> statusLabels = {
      'draft': 'Draft',
      'diajukan': 'Diajukan',
      'dalam_review': 'Dalam Review',
      'perlu_revisi': 'Perlu Revisi',
      'disetujui': 'Disetujui',
      'ditolak': 'Ditolak',
      'diterbitkan': 'Diterbitkan',
    };
    return statusLabels[status] ?? status;
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return AppTheme.greyMedium;
      case 'diajukan':
        return Colors.blue;
      case 'dalam_review':
        return Colors.orange;
      case 'perlu_revisi':
        return AppTheme.errorRed;
      case 'disetujui':
        return Colors.green;
      case 'ditolak':
        return Colors.red;
      case 'diterbitkan':
        return AppTheme.primaryGreen;
      default:
        return AppTheme.greyMedium;
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundWhite,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createNewNaskah,
        backgroundColor: AppTheme.primaryGreen,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'Buat Naskah',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(),

            // Search Bar
            _buildSearchBar(),

            // Content
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppTheme.primaryGreen,
                        ),
                      ),
                    )
                  : _naskahList.isEmpty
                  ? _buildEmptyState()
                  : _buildNaskahList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppTheme.primaryGreen,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: AppTheme.white),
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Semua Naskah',
              style: AppTheme.headingMedium.copyWith(
                color: AppTheme.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.sort, color: AppTheme.white),
            onPressed: _showSortDialog,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Cari naskah...',
          hintStyle: AppTheme.bodyMedium.copyWith(color: AppTheme.greyMedium),
          prefixIcon: const Icon(Icons.search, color: AppTheme.greyMedium),
          filled: true,
          fillColor: AppTheme.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: AppTheme.greyDisabled,
              width: 1,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: AppTheme.greyDisabled,
              width: 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: AppTheme.primaryGreen,
              width: 2,
            ),
          ),
        ),
        onChanged: (value) {
          // Debounce search
          Future.delayed(const Duration(milliseconds: 500), () {
            if (value == _searchQuery) return;
            setState(() {
              _searchQuery = value.isEmpty ? null : value;
            });
            _loadNaskah();
          });
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.book_outlined, size: 64, color: AppTheme.greyMedium),
          const SizedBox(height: 16),
          Text(
            'Belum ada naskah',
            style: AppTheme.bodyLarge.copyWith(
              color: AppTheme.primaryDark,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mulai menulis naskah pertamamu',
            textAlign: TextAlign.center,
            style: AppTheme.bodyMedium.copyWith(color: AppTheme.greyMedium),
          ),
        ],
      ),
    );
  }

  Widget _buildNaskahList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _naskahList.length + (_isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= _naskahList.length) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  AppTheme.primaryGreen,
                ),
              ),
            ),
          );
        }

        final naskah = _naskahList[index];
        return _buildNaskahCard(naskah);
      },
    );
  }

  Widget _buildNaskahCard(NaskahData naskah) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          // Navigate to detail naskah page
          AppRoutes.navigateToDetailNaskah(context, naskah.id);
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title, Status and Menu
              Row(
                children: [
                  Expanded(
                    child: Text(
                      naskah.judul,
                      style: AppTheme.bodyLarge.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryDark,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(
                        naskah.status,
                      ).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getStatusLabel(naskah.status),
                      style: AppTheme.bodySmall.copyWith(
                        color: _getStatusColor(naskah.status),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  // Menu popup untuk edit dan delete
                  PopupMenuButton<String>(
                    icon: Icon(Icons.more_vert, color: AppTheme.greyMedium),
                    onSelected: (value) async {
                      if (value == 'edit') {
                        _editNaskah(naskah);
                      } else if (value == 'delete') {
                        _showDeleteConfirmation(naskah);
                      }
                    },
                    itemBuilder: (context) => [
                      // Hanya tampilkan edit jika status draft atau perlu_revisi
                      if (naskah.status == 'draft' ||
                          naskah.status == 'perlu_revisi')
                        const PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit, size: 20),
                              SizedBox(width: 8),
                              Text('Edit'),
                            ],
                          ),
                        ),
                      // Hanya tampilkan delete jika status draft
                      if (naskah.status == 'draft')
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete, size: 20, color: Colors.red),
                              SizedBox(width: 8),
                              Text(
                                'Hapus',
                                style: TextStyle(color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // Synopsis
              if (naskah.sinopsis.isNotEmpty)
                Text(
                  naskah.sinopsis,
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppTheme.greyMedium,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

              const SizedBox(height: 12),

              // Metadata
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: AppTheme.greyMedium,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(naskah.dibuatPada),
                    style: AppTheme.bodySmall.copyWith(
                      color: AppTheme.greyMedium,
                    ),
                  ),
                  const SizedBox(width: 16),
                  if (naskah.jumlahHalaman > 0) ...[
                    Icon(
                      Icons.description,
                      size: 16,
                      color: AppTheme.greyMedium,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${naskah.jumlahHalaman} hal',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppTheme.greyMedium,
                      ),
                    ),
                  ] else if (naskah.jumlahKata > 0) ...[
                    Icon(
                      Icons.text_fields,
                      size: 16,
                      color: AppTheme.greyMedium,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${naskah.jumlahKata} kata',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppTheme.greyMedium,
                      ),
                    ),
                  ],
                  const Spacer(),
                  Icon(Icons.chevron_right, color: AppTheme.greyMedium),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Menampilkan dialog konfirmasi hapus
  void _showDeleteConfirmation(NaskahData naskah) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Naskah'),
        content: Text(
          'Apakah Anda yakin ingin menghapus naskah "${naskah.judul}"?\n\nTindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteNaskah(naskah);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  /// Menghapus naskah
  Future<void> _deleteNaskah(NaskahData naskah) async {
    try {
      final response = await NaskahService.deleteNaskah(naskah.id);

      if (mounted) {
        if (response.sukses) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Naskah "${naskah.judul}" berhasil dihapus'),
              backgroundColor: AppTheme.primaryGreen,
              behavior: SnackBarBehavior.floating,
            ),
          );
          // Refresh list
          _loadNaskah();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.pesan),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menghapus naskah: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }
}
