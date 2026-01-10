import 'package:flutter/material.dart';
import 'package:publishify/utils/theme.dart';
import 'package:publishify/services/admin/admin_service.dart';

/// Admin Review Page - Kelola dan tugaskan review ke editor
class AdminReviewPage extends StatefulWidget {
  const AdminReviewPage({super.key});

  @override
  State<AdminReviewPage> createState() => _AdminReviewPageState();
}

class _AdminReviewPageState extends State<AdminReviewPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<ReviewData> _reviewList = [];
  List<NaskahAdminData> _naskahBelumDireview = [];
  List<PenggunaData> _editorList = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load reviews dan naskah yang belum direview secara paralel
      final results = await Future.wait([
        AdminService.ambilSemuaReview(halaman: 1, limit: 50),
        AdminService.ambilSemuaNaskah(
          halaman: 1,
          limit: 50,
          status: 'diajukan',
        ),
        AdminService.ambilDaftarPengguna(
          halaman: 1,
          limit: 100,
          peran: 'editor',
        ),
      ]);

      final reviewResponse = results[0] as ReviewListResponse;
      final naskahResponse = results[1] as NaskahListResponse;
      final editorResponse = results[2] as PenggunaListResponse;

      setState(() {
        _reviewList = reviewResponse.data ?? [];
        _naskahBelumDireview = naskahResponse.data ?? [];
        _editorList = editorResponse.data ?? [];
        _isLoading = false;
      });
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
          'Kelola Review',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppTheme.primaryGreen,
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Naskah Diajukan'),
            Tab(text: 'Review Aktif'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  AppTheme.primaryGreen,
                ),
              ),
            )
          : _error != null
          ? _buildErrorWidget()
          : TabBarView(
              controller: _tabController,
              children: [_buildNaskahDiajukanTab(), _buildReviewAktifTab()],
            ),
    );
  }

  Widget _buildNaskahDiajukanTab() {
    if (_naskahBelumDireview.isEmpty) {
      return _buildEmptyWidget(
        'Tidak Ada Naskah Diajukan',
        'Semua naskah sudah ditugaskan untuk direview',
        Icons.inbox_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _naskahBelumDireview.length,
        itemBuilder: (context, index) {
          return _buildNaskahCard(_naskahBelumDireview[index]);
        },
      ),
    );
  }

  Widget _buildReviewAktifTab() {
    if (_reviewList.isEmpty) {
      return _buildEmptyWidget(
        'Tidak Ada Review Aktif',
        'Belum ada naskah yang ditugaskan untuk direview',
        Icons.rate_review_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _reviewList.length,
        itemBuilder: (context, index) {
          return _buildReviewCard(_reviewList[index]);
        },
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
                    color: Colors.orange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Menunggu Review',
                    style: TextStyle(
                      color: Colors.orange,
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
                const SizedBox(width: 16),
                Icon(
                  Icons.menu_book_outlined,
                  size: 16,
                  color: AppTheme.greyText,
                ),
                const SizedBox(width: 4),
                Text(
                  naskah.genre ?? '-',
                  style: AppTheme.bodySmall.copyWith(color: AppTheme.greyText),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _showTugaskanDialog(naskah),
                icon: const Icon(Icons.assignment_ind, size: 18),
                label: const Text('Tugaskan ke Editor'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(ReviewData review) {
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
                      review.status,
                    ).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusLabel(review.status),
                    style: TextStyle(
                      color: _getStatusColor(review.status),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                if (review.rekomendasi != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getRekomendasiColor(
                        review.rekomendasi!,
                      ).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      review.rekomendasi!.toUpperCase(),
                      style: TextStyle(
                        color: _getRekomendasiColor(review.rekomendasi!),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              review.judulNaskah,
              style: AppTheme.bodyLarge.copyWith(fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.edit_note, size: 16, color: AppTheme.greyText),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Editor: ${review.namaEditor}',
                    style: AppTheme.bodySmall.copyWith(
                      color: AppTheme.greyText,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (review.skorAkhir != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.star, size: 16, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    'Skor: ${review.skorAkhir}',
                    style: AppTheme.bodySmall.copyWith(
                      color: AppTheme.greyText,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showDetailReview(review),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryGreen,
                      side: const BorderSide(color: AppTheme.primaryGreen),
                    ),
                    child: const Text('Lihat Detail'),
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
      case 'ditugaskan':
        return Colors.blue;
      case 'dalam_proses':
        return Colors.orange;
      case 'selesai':
        return Colors.green;
      case 'dibatalkan':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'ditugaskan':
        return 'Ditugaskan';
      case 'dalam_proses':
        return 'Dalam Proses';
      case 'selesai':
        return 'Selesai';
      case 'dibatalkan':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  Color _getRekomendasiColor(String rekomendasi) {
    switch (rekomendasi.toLowerCase()) {
      case 'setujui':
        return Colors.green;
      case 'revisi':
        return Colors.orange;
      case 'tolak':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildEmptyWidget(String title, String subtitle, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppTheme.greyText),
            const SizedBox(height: 16),
            Text(
              title,
              style: AppTheme.headingSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: AppTheme.bodyMedium.copyWith(color: AppTheme.greyText),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
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

  void _showTugaskanDialog(NaskahAdminData naskah) {
    String? selectedEditorId;
    String catatan = '';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Tugaskan Review'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Naskah:',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppTheme.greyText,
                      ),
                    ),
                    Text(
                      naskah.judul,
                      style: AppTheme.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text('Pilih Editor:'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      // ignore: deprecated_member_use
                      value: selectedEditorId,
                      hint: const Text('Pilih editor...'),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      items: _editorList.map((editor) {
                        return DropdownMenuItem(
                          value: editor.id,
                          child: Text(editor.namaLengkap),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setDialogState(() {
                          selectedEditorId = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text('Catatan (opsional):'),
                    const SizedBox(height: 8),
                    TextField(
                      maxLines: 3,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Catatan untuk editor...',
                      ),
                      onChanged: (value) => catatan = value,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Batal'),
                ),
                ElevatedButton(
                  onPressed: selectedEditorId == null
                      ? null
                      : () async {
                          Navigator.pop(context);
                          await _tugaskanReview(
                            naskah.id,
                            selectedEditorId!,
                            catatan.isEmpty ? null : catatan,
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                  child: const Text('Tugaskan'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _tugaskanReview(
    String idNaskah,
    String idEditor,
    String? catatan,
  ) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await AdminService.tugaskanReview(
        idNaskah: idNaskah,
        idEditor: idEditor,
        catatan: catatan,
      );

      if (!mounted) return;
      Navigator.pop(context); // Close loading

      if (response.sukses) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review berhasil ditugaskan ke editor'),
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

  void _showDetailReview(ReviewData review) {
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
                review.judulNaskah,
                style: AppTheme.headingSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildDetailRow('Status', _getStatusLabel(review.status)),
              _buildDetailRow('Editor', review.namaEditor),
              if (review.rekomendasi != null)
                _buildDetailRow('Rekomendasi', review.rekomendasi!),
              if (review.skorAkhir != null)
                _buildDetailRow('Skor Akhir', review.skorAkhir.toString()),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                  child: const Text('Tutup'),
                ),
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
            width: 120,
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
}
