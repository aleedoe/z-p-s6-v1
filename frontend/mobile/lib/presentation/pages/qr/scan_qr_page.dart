import 'package:flutter/material.dart';
import 'package:mobile/presentation/providers/qr_provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/constants/strings.dart';

class ScanQrPage extends StatefulWidget {
  const ScanQrPage({super.key});

  @override
  State<ScanQrPage> createState() => _ScanQrPageState();
}

class _ScanQrPageState extends State<ScanQrPage>
    with SingleTickerProviderStateMixin {
  MobileScannerController? _controller;
  bool _isScanned = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    context.read<QrProvider>().startScanning();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _pulseController.dispose();
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

    await _controller?.stop();

    if (!mounted) return;

    final qrProvider = context.read<QrProvider>();
    final success = await qrProvider.submitAttendance(code);

    if (!mounted) return;

    if (success) {
      _showResultDialog(
        title: 'Berhasil!',
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
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isSuccess
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.error.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                  color: isSuccess ? AppColors.success : AppColors.error,
                  size: 64,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isSuccess
                        ? AppColors.success
                        : AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'OK',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(controller: _controller, onDetect: _handleBarcode),
          _buildTopBar(),
          _buildScannerOverlay(),
          _buildInstructions(),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                color: Colors.white,
                iconSize: 24,
                onPressed: () => Navigator.pop(context),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.qr_code_scanner_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      AppStrings.scanAttendance,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerOverlay() {
    return Center(
      child: Container(
        width: 280,
        height: 280,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Stack(
          children: [
            // Animated pulse effect
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Opacity(
                  opacity: 0.3 * _pulseController.value,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.primary, width: 3),
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                );
              },
            ),

            // Corners
            _buildCornerDecoration(Alignment.topLeft, true, true),
            _buildCornerDecoration(Alignment.topRight, false, true),
            _buildCornerDecoration(Alignment.bottomLeft, true, false),
            _buildCornerDecoration(Alignment.bottomRight, false, false),
          ],
        ),
      ),
    );
  }

  Widget _buildCornerDecoration(Alignment alignment, bool isLeft, bool isTop) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          border: Border(
            left: isLeft
                ? BorderSide(color: AppColors.primary, width: 5)
                : BorderSide.none,
            right: !isLeft
                ? BorderSide(color: AppColors.primary, width: 5)
                : BorderSide.none,
            top: isTop
                ? BorderSide(color: AppColors.primary, width: 5)
                : BorderSide.none,
            bottom: !isTop
                ? BorderSide(color: AppColors.primary, width: 5)
                : BorderSide.none,
          ),
          borderRadius: BorderRadius.only(
            topLeft: isLeft && isTop ? const Radius.circular(24) : Radius.zero,
            topRight: !isLeft && isTop
                ? const Radius.circular(24)
                : Radius.zero,
            bottomLeft: isLeft && !isTop
                ? const Radius.circular(24)
                : Radius.zero,
            bottomRight: !isLeft && !isTop
                ? const Radius.circular(24)
                : Radius.zero,
          ),
        ),
      ),
    );
  }

  Widget _buildInstructions() {
    return Positioned(
      bottom: 80,
      left: 0,
      right: 0,
      child: Consumer<QrProvider>(
        builder: (context, provider, _) {
          return Center(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: provider.isProcessing
                  ? Container(
                      key: const ValueKey('processing'),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 20,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.95),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 32,
                            height: 32,
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Memproses absensi...',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    )
                  : Container(
                      key: const ValueKey('instruction'),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 20,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.qr_code_2_rounded,
                            color: Colors.white,
                            size: 40,
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Arahkan kamera ke QR Code',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Pastikan QR Code berada di dalam frame',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
            ),
          );
        },
      ),
    );
  }
}
