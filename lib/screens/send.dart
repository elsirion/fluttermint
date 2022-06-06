import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttermint/data/send.dart';
import 'package:fluttermint/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:fluttermint/widgets/qr_scanner.dart';
import 'package:go_router/go_router.dart';

import 'package:fluttermint/widgets/content_padding.dart';
import 'package:fluttermint/widgets/fedi_appbar.dart';
import 'package:fluttermint/widgets/textured.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

// import 'package:mobile_scanner/mobile_scanner.dart';

class SendScreen extends ConsumerWidget {
  const SendScreen({Key? key}) : super(key: key);

  // TODO error: MobileScanner: Called start() while already started!
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // MobileScannerController? controller;
    final sendNotifier = ref.read(sendProvider.notifier);
    // TODO is it right that I'm defining the function in here?
    void onDetect(Barcode barcode) async {
      final data = barcode.code;
      if (data != null) {
        debugPrint('Barcode found! $data');
        // TODO use rust to figure out if it's a valid bolt11
        try {
          throw Exception("yeeeehaw");
          await sendNotifier
              .createSend(Send(
                  description: "This is a test",
                  amountSats: 42069,
                  invoice: data))
              .then((_) {
            context.go("/send/confirm");
          });
        } catch (err) {
          context.go("/errormodal", extra: err);
        }
      }
    }

    return Textured(
      child: Scaffold(
          appBar: FediAppBar(
            title: "Send bitcoin",
            closeAction: () => context.go("/"),
          ),
          backgroundColor: Colors.transparent,
          body: ContentPadding(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Expanded(
                //     // TODO some sort of clip for aiming the scanner
                //     child: ClipRRect(
                //   borderRadius: BorderRadius.circular(8.0),
                //   child: MobileScanner(
                //       // controller: controller,
                //       allowDuplicates: false,
                //       onDetect: onDetect,
                //       fit: BoxFit.cover),
                // )),
                Expanded(
                  // TODO some sort of clip for aiming the scanner
                  child: ClipRRect(
                      borderRadius: BorderRadius.circular(8.0),
                      child: QRViewExample(onDetect: onDetect)),
                ),
                const SizedBox(
                  height: 32,
                ),
                OutlineGradientButton(
                    disabled: true,
                    text: "Continue",
                    onTap: () => context.go("/send/confirm"))
              ],
            ),
          )),
    );
  }
}
