import 'package:fluttermint/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:fluttermint/widgets/content_padding.dart';
import 'package:fluttermint/widgets/fedi_appbar.dart';
import 'package:fluttermint/widgets/textured.dart';

class Send extends StatelessWidget {
  const Send({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                const Spacer(),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8.0),
                  child: const Image(
                      image: AssetImage(
                    "images/dirtyqr.png",
                  )),
                ),
                const Spacer(),
                OutlineGradientButton(
                    text: "Continue", onTap: () => context.go("/send/confirm"))
              ],
            ),
          )),
    );
  }
}
