import 'package:flutter/material.dart';
import 'package:publishify/utils/theme.dart';
import 'package:publishify/models/writer/naskah_models.dart';
import 'package:publishify/models/writer/kategori_models.dart';
import 'package:publishify/models/writer/genre_models.dart';
import 'package:publishify/services/writer/naskah_service.dart';
import 'package:publishify/services/writer/kategori_service.dart';
import 'package:publishify/services/writer/genre_service.dart';

/// Halaman Form Naskah - untuk membuat atau mengedit naskah
/// Digunakan oleh penulis untuk mengelola naskah mereka
class NaskahFormPage extends StatefulWidget {
  /// Jika naskah tidak null, berarti mode edit
  final NaskahData? naskah;

  const NaskahFormPage({super.key, this.naskah});

  @override
  State<NaskahFormPage> createState() => _NaskahFormPageState();
}

class _NaskahFormPageState extends State<NaskahFormPage> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _judulController = TextEditingController();
  final _subJudulController = TextEditingController();
  final _sinopsisController = TextEditingController();
  final _isbnController = TextEditingController();
  final _jumlahHalamanController = TextEditingController();
  final _jumlahKataController = TextEditingController();

  // State
  bool _isLoading = false;
  bool _isLoadingData = true;
  bool _publik = false;
  String? _selectedKategoriId;
  String? _selectedGenreId;
  List<Kategori> _kategoriList = [];
  List<Genre> _genreList = [];
  String? _error;

  /// Mode edit jika naskah tidak null
  bool get _isEditMode => widget.naskah != null;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _judulController.dispose();
    _subJudulController.dispose();
    _sinopsisController.dispose();
    _isbnController.dispose();
    _jumlahHalamanController.dispose();
    _jumlahKataController.dispose();
    super.dispose();
  }

  /// Memuat data kategori dan genre
  Future<void> _loadInitialData() async {
    setState(() {
      _isLoadingData = true;
      _error = null;
    });

    try {
      // Load kategori dan genre secara paralel
      final results = await Future.wait([
        KategoriService.getKategori(limit: 100, aktif: true),
        GenreService.getGenres(limit: 100, aktif: true),
      ]);

      final kategoriResponse = results[0] as KategoriResponse;
      final genreResponse = results[1] as GenreResponse;

      if (mounted) {
        setState(() {
          _kategoriList = kategoriResponse.data ?? [];
          _genreList = genreResponse.data ?? [];
          _isLoadingData = false;
        });

        // Jika mode edit, isi form dengan data naskah
        if (_isEditMode) {
          _populateForm();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingData = false;
          _error = 'Gagal memuat data: ${e.toString()}';
        });
      }
    }
  }

  /// Mengisi form dengan data naskah yang ada (mode edit)
  void _populateForm() {
    final naskah = widget.naskah!;
    _judulController.text = naskah.judul;
    _subJudulController.text = naskah.subJudul ?? '';
    _sinopsisController.text = naskah.sinopsis;
    _isbnController.text = naskah.isbn ?? '';
    _jumlahHalamanController.text = naskah.jumlahHalaman > 0
        ? naskah.jumlahHalaman.toString()
        : '';
    _jumlahKataController.text = naskah.jumlahKata > 0
        ? naskah.jumlahKata.toString()
        : '';
    _publik = naskah.publik;
    _selectedKategoriId = naskah.kategori?.id;
    _selectedGenreId = naskah.genre?.id;
    setState(() {});
  }

  /// Menyimpan naskah (create atau update)
  Future<void> _simpanNaskah() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedKategoriId == null) {
      _showSnackBar('Silakan pilih kategori', isError: true);
      return;
    }

    if (_selectedGenreId == null) {
      _showSnackBar('Silakan pilih genre', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final judul = _judulController.text.trim();
      final subJudul = _subJudulController.text.trim();
      final sinopsis = _sinopsisController.text.trim();
      final isbn = _isbnController.text.trim();
      final jumlahHalaman = int.tryParse(_jumlahHalamanController.text.trim());
      final jumlahKata = int.tryParse(_jumlahKataController.text.trim());

      if (_isEditMode) {
        // Update naskah
        final response = await NaskahService.updateNaskah(
          id: widget.naskah!.id,
          judul: judul,
          subJudul: subJudul.isNotEmpty ? subJudul : null,
          sinopsis: sinopsis,
          idKategori: _selectedKategoriId!,
          idGenre: _selectedGenreId!,
          isbn: isbn.isNotEmpty ? isbn : null,
          jumlahHalaman: jumlahHalaman,
          jumlahKata: jumlahKata,
          publik: _publik,
        );

        if (mounted) {
          if (response.sukses) {
            _showSnackBar('Naskah berhasil diperbarui');
            Navigator.pop(context, true); // Return true untuk refresh list
          } else {
            _showSnackBar(response.pesan, isError: true);
          }
        }
      } else {
        // Create naskah baru
        final response = await NaskahService.createNaskah(
          judul: judul,
          subJudul: subJudul.isNotEmpty ? subJudul : null,
          sinopsis: sinopsis,
          idKategori: _selectedKategoriId!,
          idGenre: _selectedGenreId!,
          isbn: isbn.isNotEmpty ? isbn : null,
          jumlahHalaman: jumlahHalaman,
          jumlahKata: jumlahKata,
          publik: _publik,
        );

        if (mounted) {
          if (response.sukses) {
            _showSnackBar('Naskah berhasil dibuat');
            Navigator.pop(context, true); // Return true untuk refresh list
          } else {
            _showSnackBar(response.pesan, isError: true);
          }
        }
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Terjadi kesalahan: ${e.toString()}', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : AppTheme.primaryGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _isEditMode ? 'Edit Naskah' : 'Buat Naskah Baru',
          style: AppTheme.headingSmall.copyWith(color: Colors.white),
        ),
        backgroundColor: AppTheme.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoadingData
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? _buildErrorView()
          : _buildForm(),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
          const SizedBox(height: 16),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: AppTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadInitialData,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
            ),
            child: const Text('Coba Lagi'),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Judul
            _buildSectionTitle('Informasi Dasar'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _judulController,
              decoration: _inputDecoration(
                label: 'Judul Naskah *',
                hint: 'Masukkan judul naskah',
                icon: Icons.title,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Judul wajib diisi';
                }
                if (value.trim().length < 3) {
                  return 'Judul minimal 3 karakter';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Sub Judul
            TextFormField(
              controller: _subJudulController,
              decoration: _inputDecoration(
                label: 'Sub Judul',
                hint: 'Masukkan sub judul (opsional)',
                icon: Icons.subtitles,
              ),
            ),
            const SizedBox(height: 16),

            // Sinopsis
            TextFormField(
              controller: _sinopsisController,
              decoration: _inputDecoration(
                label: 'Sinopsis *',
                hint: 'Tuliskan sinopsis naskah (minimal 50 karakter)',
                icon: Icons.description,
              ),
              maxLines: 5,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Sinopsis wajib diisi';
                }
                if (value.trim().length < 50) {
                  return 'Sinopsis minimal 50 karakter';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Kategori & Genre
            _buildSectionTitle('Kategori & Genre'),
            const SizedBox(height: 12),

            // Dropdown Kategori
            DropdownButtonFormField<String>(
              // ignore: deprecated_member_use
              value: _selectedKategoriId,
              decoration: _inputDecoration(
                label: 'Kategori *',
                hint: 'Pilih kategori',
                icon: Icons.category,
              ),
              items: _kategoriList.map((kategori) {
                return DropdownMenuItem(
                  value: kategori.id,
                  child: Text(kategori.nama),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedKategoriId = value);
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Kategori wajib dipilih';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Dropdown Genre
            DropdownButtonFormField<String>(
              // ignore: deprecated_member_use
              value: _selectedGenreId,
              decoration: _inputDecoration(
                label: 'Genre *',
                hint: 'Pilih genre',
                icon: Icons.bookmark,
              ),
              items: _genreList.map((genre) {
                return DropdownMenuItem(
                  value: genre.id,
                  child: Text(genre.nama),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedGenreId = value);
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Genre wajib dipilih';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Detail Naskah
            _buildSectionTitle('Detail Naskah'),
            const SizedBox(height: 12),

            // ISBN
            TextFormField(
              controller: _isbnController,
              decoration: _inputDecoration(
                label: 'ISBN',
                hint: 'Masukkan ISBN (opsional)',
                icon: Icons.qr_code,
              ),
            ),
            const SizedBox(height: 16),

            // Jumlah Halaman & Kata
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _jumlahHalamanController,
                    decoration: _inputDecoration(
                      label: 'Jumlah Halaman',
                      hint: '0',
                      icon: Icons.pages,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _jumlahKataController,
                    decoration: _inputDecoration(
                      label: 'Jumlah Kata',
                      hint: '0',
                      icon: Icons.text_fields,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Pengaturan
            _buildSectionTitle('Pengaturan'),
            const SizedBox(height: 12),

            // Switch Publik
            Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: SwitchListTile(
                title: const Text('Tampilkan di Publik'),
                subtitle: Text(
                  _publik
                      ? 'Naskah akan terlihat oleh semua orang'
                      : 'Naskah hanya terlihat oleh Anda',
                  style: AppTheme.bodySmall.copyWith(color: AppTheme.greyText),
                ),
                value: _publik,
                onChanged: (value) {
                  setState(() => _publik = value);
                },
                activeTrackColor: AppTheme.primaryGreen,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Tombol Simpan
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _simpanNaskah,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(
                        _isEditMode ? 'Perbarui Naskah' : 'Simpan Naskah',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 16),

            // Tombol Batal
            SizedBox(
              height: 50,
              child: OutlinedButton(
                onPressed: _isLoading ? null : () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.greyText,
                  side: BorderSide(color: Colors.grey.shade300),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Batal',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTheme.bodyLarge.copyWith(
        fontWeight: FontWeight.bold,
        color: AppTheme.primaryGreen,
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    required IconData icon,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: Icon(icon, color: AppTheme.primaryGreen),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red),
      ),
      filled: true,
      fillColor: Colors.grey.shade50,
    );
  }
}
