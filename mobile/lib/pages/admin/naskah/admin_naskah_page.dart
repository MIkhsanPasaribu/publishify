import 'package:flutter/material.dart';
import 'package:publishify/utils/theme.dart';
import 'package:publishify/services/admin/admin_service.dart';

/// Admin Naskah Page - Kelola semua naskah dalam sistem
class AdminNaskahPage extends StatefulWidget {
  const AdminNaskahPage({super.key});

  @override
  State<AdminNaskahPage> createState() => _AdminNaskahPageState();
}

class _AdminNaskahPageState extends State<AdminNaskahPage> {
  bool _isLoading = true;
  List<NaskahAdminData> _naskahList = [];
  String? _error;
  String _selectedStatus = 'semua';
  int _currentPage = 1;
  int _totalPages = 1;

  final List<Map<String, String>> _statusFilters = [
    {'value': 'semua', 'label': 'Semua'},
    {'value': 'draft', 'label': 'Draft'},
    {'value': 'diajukan', 'label': 'Diajukan'},
    {'value': 'dalam_review', 'label': 'Review'},
    {'value': 'disetujui', 'label': 'Disetujui'},
    {'value': 'diterbitkan', 'label': 'Terbit'},
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await AdminService.ambilSemuaNaskah(
        halaman: _currentPage,
        limit: 20,
        status: _selectedStatus == 'semua' ? null : _selectedStatus,
      );

      if (response.sukses) {
        setState(() {
          _naskahList = response.data ?? [];
          _totalPages = response.metadata?.totalHalaman ?? 1;
          _isLoading = false;
        });
      } else {
        throw Exception(response.pesan);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundWhite,
      appBar: AppBar(
        title: const Text(
          'Kelola Naskah',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppTheme.primaryGreen,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _showSearchDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppTheme.primaryGreen,
                      ),
                    ),
                  )
                : _error != null
                ? _buildErrorWidget()
                : _naskahList.isEmpty
                ? _buildEmptyWidget()
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _naskahList.length,
                      itemBuilder: (context, index) {
                        return _buildNaskahCard(_naskahList[index]);
                      },
                    ),
                  ),
          ),
          if (_totalPages > 1) _buildPagination(),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: _statusFilters.map((filter) {
            final isSelected = _selectedStatus == filter['value'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(filter['label']!),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    _selectedStatus = filter['value']!;
                    _currentPage = 1;
                  });
                  _loadData();
                },
                selectedColor: AppTheme.primaryGreen.withValues(alpha: 0.2),
                checkmarkColor: AppTheme.primaryGreen,
                labelStyle: TextStyle(
                  color: isSelected ? AppTheme.primaryGreen : AppTheme.greyText,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildNaskahCard(NaskahAdminData naskah) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(
                      naskah.status,
                    ).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusLabel(naskah.status),
                    style: TextStyle(
                      color: _getStatusColor(naskah.status),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  naskah.kategori ?? '-',
                  style: AppTheme.bodySmall.copyWith(color: AppTheme.greyText),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              naskah.judul,
              style: AppTheme.bodyLarge.copyWith(fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.person_outline, size: 16, color: AppTheme.greyText),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    naskah.penulis,
                    style: AppTheme.bodySmall.copyWith(
                      color: AppTheme.greyText,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (naskah.genre != null) ...[
                  const SizedBox(width: 16),
                  Icon(Icons.label_outline, size: 16, color: AppTheme.greyText),
                  const SizedBox(width: 4),
                  Text(
                    naskah.genre!,
                    style: AppTheme.bodySmall.copyWith(
                      color: AppTheme.greyText,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showDetailNaskah(naskah),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryGreen,
                      side: const BorderSide(color: AppTheme.primaryGreen),
                    ),
                    child: const Text('Detail'),
                  ),
                ),
                const SizedBox(width: 8),
                if (naskah.status == 'disetujui')
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _showTerbitkanDialog(naskah),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                      ),
                      child: const Text('Terbitkan'),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return Colors.grey;
      case 'diajukan':
        return Colors.blue;
      case 'dalam_review':
        return Colors.orange;
      case 'perlu_revisi':
        return Colors.purple;
      case 'disetujui':
        return Colors.teal;
      case 'ditolak':
        return Colors.red;
      case 'diterbitkan':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'diajukan':
        return 'Diajukan';
      case 'dalam_review':
        return 'Dalam Review';
      case 'perlu_revisi':
        return 'Perlu Revisi';
      case 'disetujui':
        return 'Disetujui';
      case 'ditolak':
        return 'Ditolak';
      case 'diterbitkan':
        return 'Diterbitkan';
      default:
        return status;
    }
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: AppTheme.errorRed),
          const SizedBox(height: 16),
          Text('Terjadi Kesalahan', style: AppTheme.headingSmall),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(_error ?? 'Unknown error', textAlign: TextAlign.center),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadData,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
            ),
            child: const Text('Coba Lagi'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.menu_book_outlined, size: 64, color: AppTheme.greyText),
          const SizedBox(height: 16),
          Text(
            'Tidak ada naskah',
            style: AppTheme.bodyLarge.copyWith(color: AppTheme.greyText),
          ),
        ],
      ),
    );
  }

  Widget _buildPagination() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: _currentPage > 1
                ? () {
                    setState(() => _currentPage--);
                    _loadData();
                  }
                : null,
          ),
          Text('Halaman $_currentPage dari $_totalPages'),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _currentPage < _totalPages
                ? () {
                    setState(() => _currentPage++);
                    _loadData();
                  }
                : null,
          ),
        ],
      ),
    );
  }

  void _showSearchDialog() {
    String searchQuery = '';
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Cari Naskah'),
          content: TextField(
            onChanged: (value) => searchQuery = value,
            decoration: const InputDecoration(
              hintText: 'Masukkan judul naskah...',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                // TODO: Implement search with searchQuery
                debugPrint('Searching for: $searchQuery');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
              ),
              child: const Text('Cari'),
            ),
          ],
        );
      },
    );
  }

  void _showDetailNaskah(NaskahAdminData naskah) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                naskah.judul,
                style: AppTheme.headingSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildDetailRow('Status', _getStatusLabel(naskah.status)),
              _buildDetailRow('Penulis', naskah.penulis),
              _buildDetailRow('Kategori', naskah.kategori ?? '-'),
              _buildDetailRow('Genre', naskah.genre ?? '-'),
              if (naskah.sinopsis != null) ...[
                const SizedBox(height: 16),
                Text(
                  'Sinopsis',
                  style: AppTheme.bodyMedium.copyWith(color: AppTheme.greyText),
                ),
                const SizedBox(height: 4),
                Text(
                  naskah.sinopsis!,
                  style: AppTheme.bodyMedium,
                  maxLines: 5,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.greyText,
                      ),
                      child: const Text('Tutup'),
                    ),
                  ),
                  if (naskah.status == 'disetujui') ...[
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showTerbitkanDialog(naskah);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                        ),
                        child: const Text('Terbitkan'),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTheme.bodyMedium.copyWith(color: AppTheme.greyText),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  void _showTerbitkanDialog(NaskahAdminData naskah) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Konfirmasi Terbitkan'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Apakah Anda yakin ingin menerbitkan naskah ini?'),
              const SizedBox(height: 16),
              Text(
                naskah.judul,
                style: AppTheme.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Oleh: ${naskah.penulis}',
                style: AppTheme.bodySmall.copyWith(color: AppTheme.greyText),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                await _terbitkanNaskah(naskah.id);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: const Text('Terbitkan'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _terbitkanNaskah(String idNaskah) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.terbitkanNaskah(idNaskah);

      if (!mounted) return;
      Navigator.pop(context); // Close loading

      if (response.sukses) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Naskah berhasil diterbitkan'),
            backgroundColor: Colors.green,
          ),
        );
        _loadData(); // Refresh
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.pesan),
            backgroundColor: AppTheme.errorRed,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppTheme.errorRed,
        ),
      );
    }
  }
}
