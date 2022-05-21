import 'package:fluttermint/widgets/button.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../widgets/contentpadding.dart';
import '../widgets/fediappbar.dart';
import '../widgets/textured.dart';

class Send extends StatelessWidget {
  const Send({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Textured(
      child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: FediAppBar(
            title: "Send",
            closeAction: () {
              context.go("/");
            },
          ),
          body: ContentPadding(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlineGradientButton(
                    text: "Continue", onTap: () => context.go("/send/confirm"))
              ],
            ),
          )),
    );
  }
}
