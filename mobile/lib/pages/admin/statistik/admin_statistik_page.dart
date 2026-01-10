import 'package:flutter/material.dart';
import 'package:publishify/utils/theme.dart';
import 'package:publishify/services/admin/admin_service.dart';
import 'package:fl_chart/fl_chart.dart';

/// Admin Statistik Page - Dashboard statistik keseluruhan sistem
class AdminStatistikPage extends StatefulWidget {
  const AdminStatistikPage({super.key});

  @override
  State<AdminStatistikPage> createState() => _AdminStatistikPageState();
}

class _AdminStatistikPageState extends State<AdminStatistikPage> {
  bool _isLoading = true;
  StatistikPenggunaData? _statistikPengguna;
  String? _error;

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
      final response = await AdminService.ambilStatistikPengguna();

      if (response.sukses && response.data != null) {
        setState(() {
          _statistikPengguna = response.data;
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
          'Statistik Sistem',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppTheme.primaryGreen,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
        ],
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
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeaderStatistik(),
                    const SizedBox(height: 24),
                    _buildUserDistributionChart(),
                    const SizedBox(height: 24),
                    _buildDetailStatistik(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHeaderStatistik() {
    final total = _statistikPengguna?.totalPengguna ?? 0;

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [AppTheme.primaryGreen, Color(0xFF2E7D32)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            const Icon(Icons.groups, size: 48, color: Colors.white),
            const SizedBox(height: 16),
            Text(
              total.toString(),
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const Text(
              'Total Pengguna',
              style: TextStyle(fontSize: 16, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserDistributionChart() {
    final penulis = _statistikPengguna?.totalPenulis ?? 0;
    final editor = _statistikPengguna?.totalEditor ?? 0;
    final percetakan = _statistikPengguna?.totalPercetakan ?? 0;
    final total = penulis + editor + percetakan;

    if (total == 0) {
      return const SizedBox.shrink();
    }

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Distribusi Pengguna',
              style: AppTheme.headingSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: Row(
                children: [
                  Expanded(
                    child: PieChart(
                      PieChartData(
                        sections: [
                          PieChartSectionData(
                            value: penulis.toDouble(),
                            title:
                                '${((penulis / total) * 100).toStringAsFixed(0)}%',
                            color: Colors.orange,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          PieChartSectionData(
                            value: editor.toDouble(),
                            title:
                                '${((editor / total) * 100).toStringAsFixed(0)}%',
                            color: Colors.purple,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          PieChartSectionData(
                            value: percetakan.toDouble(),
                            title:
                                '${((percetakan / total) * 100).toStringAsFixed(0)}%',
                            color: Colors.green,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                        centerSpaceRadius: 40,
                        sectionsSpace: 2,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLegendItem('Penulis', Colors.orange, penulis),
                      const SizedBox(height: 8),
                      _buildLegendItem('Editor', Colors.purple, editor),
                      const SizedBox(height: 8),
                      _buildLegendItem('Percetakan', Colors.green, percetakan),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, int value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Text('$label ($value)', style: AppTheme.bodyMedium),
      ],
    );
  }

  Widget _buildDetailStatistik() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Detail Statistik',
          style: AppTheme.headingSmall.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Penulis',
                _statistikPengguna?.totalPenulis ?? 0,
                Icons.edit,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Editor',
                _statistikPengguna?.totalEditor ?? 0,
                Icons.rate_review,
                Colors.purple,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Percetakan',
                _statistikPengguna?.totalPercetakan ?? 0,
                Icons.print,
                Colors.green,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Admin',
                1, // Biasanya admin jumlahnya sedikit
                Icons.admin_panel_settings,
                Colors.red,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, int value, IconData icon, Color color) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              value.toString(),
              style: AppTheme.headingMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: AppTheme.bodySmall.copyWith(color: AppTheme.greyText),
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
}
