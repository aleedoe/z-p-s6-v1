import 'package:flutter/material.dart';
import 'package:mobile/presentation/qr/scan_qr_page.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/strings.dart';
import '../../../core/utils/date_helper.dart';
import '../../providers/auth_provider.dart';
import '../../providers/home_provider.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeProvider>().getTodayStatus();
    });
  }

  Future<void> _refreshData() async {
    await context.read<HomeProvider>().refresh();
  }

  void _navigateToScan() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const ScanQrPage())).then((_) {
      // Refresh data after scanning
      _refreshData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(AppStrings.home),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildGreetingCard(authProvider.user?.name ?? 'Karyawan'),
              const SizedBox(height: 16),
              _buildTodayStatusCard(),
              const SizedBox(height: 16),
              _buildQuickActionCard(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToScan,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text(AppStrings.scanAttendance),
      ),
    );
  }

  Widget _buildGreetingCard(String name) {
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 12) {
      greeting = 'Selamat Pagi';
    } else if (hour < 15) {
      greeting = 'Selamat Siang';
    } else if (hour < 18) {
      greeting = 'Selamat Sore';
    } else {
      greeting = 'Selamat Malam';
    }

    return Card(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary, AppColors.secondary],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              greeting,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              name,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              DateHelper.formatDate(DateTime.now()),
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodayStatusCard() {
    return Consumer<HomeProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: CircularProgressIndicator()),
            ),
          );
        }

        if (provider.errorMessage != null) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.error_outline, color: AppColors.error, size: 48),
                  const SizedBox(height: 8),
                  Text(
                    provider.errorMessage!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.error),
                  ),
                ],
              ),
            ),
          );
        }

        final status = provider.homeStatus;
        if (status == null) {
          return const Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Text('Tidak ada data'),
            ),
          );
        }

        Color statusColor;
        IconData statusIcon;
        switch (status.absenStatusToday) {
          case 'present':
            statusColor = AppColors.success;
            statusIcon = Icons.check_circle;
            break;
          case 'absent':
            statusColor = AppColors.error;
            statusIcon = Icons.cancel;
            break;
          default:
            statusColor = AppColors.warning;
            statusIcon = Icons.access_time;
        }

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.today, color: AppColors.primary),
                    const SizedBox(width: 8),
                    const Text(
                      'Status Hari Ini',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  children: [
                    Icon(statusIcon, color: statusColor, size: 32),
                    const SizedBox(width: 12),
                    Text(
                      status.statusText,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildInfoRow('Hari', status.dayName),
                _buildInfoRow('Shift', status.shiftName),
                _buildInfoRow(
                  'Jam Kerja',
                  '${DateHelper.formatTime(status.startTime)} - ${DateHelper.formatTime(status.endTime)}',
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.flash_on, color: AppColors.primary),
                const SizedBox(width: 8),
                const Text(
                  'Aksi Cepat',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: Icon(Icons.qr_code_scanner, color: AppColors.primary),
              ),
              title: const Text('Scan QR Absensi'),
              subtitle: const Text('Lakukan absensi dengan scan QR'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: _navigateToScan,
            ),
          ],
        ),
      ),
    );
  }
}
