import 'package:intl/intl.dart';

class DateHelper {
  // Format date to readable string
  static String formatDate(DateTime date) {
    // Gunakan format manual untuk Indonesia
    final months = [
      '',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return '${date.day} ${months[date.month]} ${date.year}';
  }

  // Format date to simple format
  static String formatSimpleDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  // Format time
  static String formatTime(String time) {
    try {
      final parts = time.split(':');
      if (parts.length >= 2) {
        return '${parts[0]}:${parts[1]}';
      }
      return time;
    } catch (e) {
      return time;
    }
  }

  // Get day name in Indonesian
  static String getDayName(int day) {
    const days = [
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
      'Minggu',
    ];
    return days[day - 1];
  }

  // Parse API date string
  static DateTime? parseApiDate(String? dateString) {
    if (dateString == null) return null;
    try {
      return DateTime.parse(dateString);
    } catch (e) {
      return null;
    }
  }

  // Format datetime from API
  static String formatApiDateTime(String? dateTimeString) {
    if (dateTimeString == null) return '-';
    try {
      final dateTime = DateTime.parse(dateTimeString.replaceAll(' ', 'T'));
      return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
    } catch (e) {
      return dateTimeString;
    }
  }
}
