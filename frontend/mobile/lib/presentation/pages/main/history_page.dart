import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/strings.dart';
import '../../../core/utils/date_helper.dart';
import '../../providers/history_provider.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HistoryProvider>().getHistory();
    });
  }

  Future<void> _refreshData() async {
    await context.read<HistoryProvider>().getHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.history),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<HistoryProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, color: AppColors.error, size: 64),
                  const SizedBox(height: 16),
                  Text(
                    provider.errorMessage!,
                    style: TextStyle(color: AppColors.error),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _refreshData,
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          if (provider.history == null) {
            return const Center(child: Text('Tidak ada data'));
          }

          return RefreshIndicator(
            onRefresh: _refreshData,
            child: Column(
              children: [
                _buildPeriodSelector(provider),
                Expanded(child: _buildHistoryList(provider)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPeriodSelector(HistoryProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: provider.showWeekly
                  ? null
                  : () => provider.toggleView(),
              style: ElevatedButton.styleFrom(
                backgroundColor: provider.showWeekly
                    ? AppColors.primary
                    : Colors.grey[300],
                foregroundColor: provider.showWeekly
                    ? Colors.white
                    : Colors.black,
                elevation: provider.showWeekly ? 2 : 0,
              ),
              child: const Text('Mingguan'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: !provider.showWeekly
                  ? null
                  : () => provider.toggleView(),
              style: ElevatedButton.styleFrom(
                backgroundColor: !provider.showWeekly
                    ? AppColors.primary
                    : Colors.grey[300],
                foregroundColor: !provider.showWeekly
                    ? Colors.white
                    : Colors.black,
                elevation: !provider.showWeekly ? 2 : 0,
              ),
              child: const Text('Bulanan'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(HistoryProvider provider) {
    final history = provider.currentHistory;

    if (history.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.history_outlined,
              size: 64,
              color: AppColors.textSecondary,
            ),
            const SizedBox(height: 16),
            Text(
              'Tidak ada riwayat absensi',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final attendance = history[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.success.withOpacity(0.1),
              child: Icon(Icons.check_circle, color: AppColors.success),
            ),
            title: Text(
              DateHelper.formatSimpleDate(DateTime.parse(attendance.date)),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              DateHelper.formatApiDateTime(attendance.createdAt),
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            trailing: Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppColors.textSecondary,
            ),
          ),
        );
      },
    );
  }
}
