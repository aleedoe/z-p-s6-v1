import 'package:flutter/material.dart';
import 'package:mobile/presentation/providers/qr_provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/strings.dart';

class ScanQrPage extends StatefulWidget {
  const ScanQrPage({super.key});

  @override
  State<ScanQrPage> createState() => _ScanQrPageState();
}

class _ScanQrPageState extends State<ScanQrPage> {
  MobileScannerController? _controller;
  bool _isScanned = false;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController();
    context.read<QrProvider>().startScanning();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _handleBarcode(BarcodeCapture capture) async {
    if (_isScanned) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null || code.isEmpty) return;

    setState(() {
      _isScanned = true;
    });

    // Stop the camera
    await _controller?.stop();

    if (!mounted) return;

    final qrProvider = context.read<QrProvider>();
    final success = await qrProvider.submitAttendance(code);

    if (!mounted) return;

    if (success) {
      _showResultDialog(
        title: 'Berhasil',
        message: qrProvider.successMessage ?? AppStrings.scanSuccess,
        isSuccess: true,
      );
    } else {
      _showResultDialog(
        title: 'Gagal',
        message: qrProvider.errorMessage ?? AppStrings.scanFailed,
        isSuccess: false,
      );
    }
  }

  void _showResultDialog({
    required String title,
    required String message,
    required bool isSuccess,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : Icons.error,
              color: isSuccess ? AppColors.success : AppColors.error,
            ),
            const SizedBox(width: 8),
            Text(title),
          ],
        ),
        content: Text(message),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to home
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isSuccess
                  ? AppColors.success
                  : AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(AppStrings.scanAttendance),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          MobileScanner(controller: _controller, onDetect: _handleBarcode),
          _buildScannerOverlay(),
          _buildInstructions(),
        ],
      ),
    );
  }

  Widget _buildScannerOverlay() {
    return Container(
      decoration: BoxDecoration(color: Colors.black.withOpacity(0.5)),
      child: Stack(
        children: [
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 3),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          // Corners
          Positioned(
            left: MediaQuery.of(context).size.width / 2 - 125,
            top: MediaQuery.of(context).size.height / 2 - 125,
            child: _buildCorner(true, true),
          ),
          Positioned(
            right: MediaQuery.of(context).size.width / 2 - 125,
            top: MediaQuery.of(context).size.height / 2 - 125,
            child: _buildCorner(false, true),
          ),
          Positioned(
            left: MediaQuery.of(context).size.width / 2 - 125,
            bottom: MediaQuery.of(context).size.height / 2 - 125,
            child: _buildCorner(true, false),
          ),
          Positioned(
            right: MediaQuery.of(context).size.width / 2 - 125,
            bottom: MediaQuery.of(context).size.height / 2 - 125,
            child: _buildCorner(false, false),
          ),
        ],
      ),
    );
  }

  Widget _buildCorner(bool isLeft, bool isTop) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        border: Border(
          left: isLeft
              ? BorderSide(color: AppColors.accent, width: 4)
              : BorderSide.none,
          right: !isLeft
              ? BorderSide(color: AppColors.accent, width: 4)
              : BorderSide.none,
          top: isTop
              ? BorderSide(color: AppColors.accent, width: 4)
              : BorderSide.none,
          bottom: !isTop
              ? BorderSide(color: AppColors.accent, width: 4)
              : BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildInstructions() {
    return Positioned(
      bottom: 50,
      left: 0,
      right: 0,
      child: Consumer<QrProvider>(
        builder: (context, provider, _) {
          return Column(
            children: [
              if (provider.isProcessing)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Column(
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Memproses absensi...',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Arahkan kamera ke QR Code',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
