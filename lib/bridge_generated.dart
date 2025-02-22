// AUTO GENERATED FILE, DO NOT EDIT.
// Generated by `flutter_rust_bridge`.

// ignore_for_file: non_constant_identifier_names, unused_element, duplicate_ignore, directives_ordering, curly_braces_in_flow_control_structures, unnecessary_lambdas, slash_for_doc_comments, prefer_const_literals_to_create_immutables, implicit_dynamic_list_literal, duplicate_import, unused_import, prefer_single_quotes, prefer_const_constructors

import 'dart:convert';
import 'dart:typed_data';

import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_rust_bridge/flutter_rust_bridge.dart';
import 'dart:ffi' as ffi;

abstract class MinimintBridge {
  /// If this returns true, user has joined a federation. Otherwise they haven't.
  Future<bool> init({required String path, dynamic hint});

  Future<void> joinFederation(
      {required String userDir, required String configUrl, dynamic hint});

  Future<void> leaveFederation({dynamic hint});

  Future<int> balance({dynamic hint});

  Future<void> pay({required String bolt11, dynamic hint});

  Future<String> decodeInvoice({required String bolt11, dynamic hint});

  Future<String> invoice(
      {required int amount, required String description, dynamic hint});
}

class MinimintBridgeImpl extends FlutterRustBridgeBase<MinimintBridgeWire>
    implements MinimintBridge {
  factory MinimintBridgeImpl(ffi.DynamicLibrary dylib) =>
      MinimintBridgeImpl.raw(MinimintBridgeWire(dylib));

  MinimintBridgeImpl.raw(MinimintBridgeWire inner) : super(inner);

  Future<bool> init({required String path, dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_init(port_, _api2wire_String(path)),
        parseSuccessData: _wire2api_bool,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "init",
          argNames: ["path"],
        ),
        argValues: [path],
        hint: hint,
      ));

  Future<void> joinFederation(
          {required String userDir, required String configUrl, dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_join_federation(
            port_, _api2wire_String(userDir), _api2wire_String(configUrl)),
        parseSuccessData: _wire2api_unit,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "join_federation",
          argNames: ["userDir", "configUrl"],
        ),
        argValues: [userDir, configUrl],
        hint: hint,
      ));

  Future<void> leaveFederation({dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_leave_federation(port_),
        parseSuccessData: _wire2api_unit,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "leave_federation",
          argNames: [],
        ),
        argValues: [],
        hint: hint,
      ));

  Future<int> balance({dynamic hint}) => executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_balance(port_),
        parseSuccessData: _wire2api_u64,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "balance",
          argNames: [],
        ),
        argValues: [],
        hint: hint,
      ));

  Future<void> pay({required String bolt11, dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_pay(port_, _api2wire_String(bolt11)),
        parseSuccessData: _wire2api_unit,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "pay",
          argNames: ["bolt11"],
        ),
        argValues: [bolt11],
        hint: hint,
      ));

  Future<String> decodeInvoice({required String bolt11, dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) =>
            inner.wire_decode_invoice(port_, _api2wire_String(bolt11)),
        parseSuccessData: _wire2api_String,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "decode_invoice",
          argNames: ["bolt11"],
        ),
        argValues: [bolt11],
        hint: hint,
      ));

  Future<String> invoice(
          {required int amount, required String description, dynamic hint}) =>
      executeNormal(FlutterRustBridgeTask(
        callFfi: (port_) => inner.wire_invoice(
            port_, _api2wire_u64(amount), _api2wire_String(description)),
        parseSuccessData: _wire2api_String,
        constMeta: const FlutterRustBridgeTaskConstMeta(
          debugName: "invoice",
          argNames: ["amount", "description"],
        ),
        argValues: [amount, description],
        hint: hint,
      ));

  // Section: api2wire
  ffi.Pointer<wire_uint_8_list> _api2wire_String(String raw) {
    return _api2wire_uint_8_list(utf8.encoder.convert(raw));
  }

  int _api2wire_u64(int raw) {
    return raw;
  }

  int _api2wire_u8(int raw) {
    return raw;
  }

  ffi.Pointer<wire_uint_8_list> _api2wire_uint_8_list(Uint8List raw) {
    final ans = inner.new_uint_8_list(raw.length);
    ans.ref.ptr.asTypedList(raw.length).setAll(0, raw);
    return ans;
  }

  // Section: api_fill_to_wire

}

// Section: wire2api
String _wire2api_String(dynamic raw) {
  return raw as String;
}

bool _wire2api_bool(dynamic raw) {
  return raw as bool;
}

int _wire2api_u64(dynamic raw) {
  return raw as int;
}

int _wire2api_u8(dynamic raw) {
  return raw as int;
}

Uint8List _wire2api_uint_8_list(dynamic raw) {
  return raw as Uint8List;
}

void _wire2api_unit(dynamic raw) {
  return;
}

// ignore_for_file: camel_case_types, non_constant_identifier_names, avoid_positional_boolean_parameters, annotate_overrides, constant_identifier_names

// AUTO GENERATED FILE, DO NOT EDIT.
//
// Generated by `package:ffigen`.

/// generated by flutter_rust_bridge
class MinimintBridgeWire implements FlutterRustBridgeWireBase {
  /// Holds the symbol lookup function.
  final ffi.Pointer<T> Function<T extends ffi.NativeType>(String symbolName)
      _lookup;

  /// The symbols are looked up in [dynamicLibrary].
  MinimintBridgeWire(ffi.DynamicLibrary dynamicLibrary)
      : _lookup = dynamicLibrary.lookup;

  /// The symbols are looked up with [lookup].
  MinimintBridgeWire.fromLookup(
      ffi.Pointer<T> Function<T extends ffi.NativeType>(String symbolName)
          lookup)
      : _lookup = lookup;

  void wire_init(
    int port_,
    ffi.Pointer<wire_uint_8_list> path,
  ) {
    return _wire_init(
      port_,
      path,
    );
  }

  late final _wire_initPtr = _lookup<
      ffi.NativeFunction<
          ffi.Void Function(
              ffi.Int64, ffi.Pointer<wire_uint_8_list>)>>('wire_init');
  late final _wire_init = _wire_initPtr
      .asFunction<void Function(int, ffi.Pointer<wire_uint_8_list>)>();

  void wire_join_federation(
    int port_,
    ffi.Pointer<wire_uint_8_list> user_dir,
    ffi.Pointer<wire_uint_8_list> config_url,
  ) {
    return _wire_join_federation(
      port_,
      user_dir,
      config_url,
    );
  }

  late final _wire_join_federationPtr = _lookup<
      ffi.NativeFunction<
          ffi.Void Function(ffi.Int64, ffi.Pointer<wire_uint_8_list>,
              ffi.Pointer<wire_uint_8_list>)>>('wire_join_federation');
  late final _wire_join_federation = _wire_join_federationPtr.asFunction<
      void Function(
          int, ffi.Pointer<wire_uint_8_list>, ffi.Pointer<wire_uint_8_list>)>();

  void wire_leave_federation(
    int port_,
  ) {
    return _wire_leave_federation(
      port_,
    );
  }

  late final _wire_leave_federationPtr =
      _lookup<ffi.NativeFunction<ffi.Void Function(ffi.Int64)>>(
          'wire_leave_federation');
  late final _wire_leave_federation =
      _wire_leave_federationPtr.asFunction<void Function(int)>();

  void wire_balance(
    int port_,
  ) {
    return _wire_balance(
      port_,
    );
  }

  late final _wire_balancePtr =
      _lookup<ffi.NativeFunction<ffi.Void Function(ffi.Int64)>>('wire_balance');
  late final _wire_balance = _wire_balancePtr.asFunction<void Function(int)>();

  void wire_pay(
    int port_,
    ffi.Pointer<wire_uint_8_list> bolt11,
  ) {
    return _wire_pay(
      port_,
      bolt11,
    );
  }

  late final _wire_payPtr = _lookup<
      ffi.NativeFunction<
          ffi.Void Function(
              ffi.Int64, ffi.Pointer<wire_uint_8_list>)>>('wire_pay');
  late final _wire_pay = _wire_payPtr
      .asFunction<void Function(int, ffi.Pointer<wire_uint_8_list>)>();

  void wire_decode_invoice(
    int port_,
    ffi.Pointer<wire_uint_8_list> bolt11,
  ) {
    return _wire_decode_invoice(
      port_,
      bolt11,
    );
  }

  late final _wire_decode_invoicePtr = _lookup<
      ffi.NativeFunction<
          ffi.Void Function(ffi.Int64,
              ffi.Pointer<wire_uint_8_list>)>>('wire_decode_invoice');
  late final _wire_decode_invoice = _wire_decode_invoicePtr
      .asFunction<void Function(int, ffi.Pointer<wire_uint_8_list>)>();

  void wire_invoice(
    int port_,
    int amount,
    ffi.Pointer<wire_uint_8_list> description,
  ) {
    return _wire_invoice(
      port_,
      amount,
      description,
    );
  }

  late final _wire_invoicePtr = _lookup<
      ffi.NativeFunction<
          ffi.Void Function(ffi.Int64, ffi.Uint64,
              ffi.Pointer<wire_uint_8_list>)>>('wire_invoice');
  late final _wire_invoice = _wire_invoicePtr
      .asFunction<void Function(int, int, ffi.Pointer<wire_uint_8_list>)>();

  ffi.Pointer<wire_uint_8_list> new_uint_8_list(
    int len,
  ) {
    return _new_uint_8_list(
      len,
    );
  }

  late final _new_uint_8_listPtr = _lookup<
      ffi.NativeFunction<
          ffi.Pointer<wire_uint_8_list> Function(
              ffi.Int32)>>('new_uint_8_list');
  late final _new_uint_8_list = _new_uint_8_listPtr
      .asFunction<ffi.Pointer<wire_uint_8_list> Function(int)>();

  void free_WireSyncReturnStruct(
    WireSyncReturnStruct val,
  ) {
    return _free_WireSyncReturnStruct(
      val,
    );
  }

  late final _free_WireSyncReturnStructPtr =
      _lookup<ffi.NativeFunction<ffi.Void Function(WireSyncReturnStruct)>>(
          'free_WireSyncReturnStruct');
  late final _free_WireSyncReturnStruct = _free_WireSyncReturnStructPtr
      .asFunction<void Function(WireSyncReturnStruct)>();

  void store_dart_post_cobject(
    DartPostCObjectFnType ptr,
  ) {
    return _store_dart_post_cobject(
      ptr,
    );
  }

  late final _store_dart_post_cobjectPtr =
      _lookup<ffi.NativeFunction<ffi.Void Function(DartPostCObjectFnType)>>(
          'store_dart_post_cobject');
  late final _store_dart_post_cobject = _store_dart_post_cobjectPtr
      .asFunction<void Function(DartPostCObjectFnType)>();
}

class wire_uint_8_list extends ffi.Struct {
  external ffi.Pointer<ffi.Uint8> ptr;

  @ffi.Int32()
  external int len;
}

typedef DartPostCObjectFnType = ffi.Pointer<
    ffi.NativeFunction<ffi.Uint8 Function(DartPort, ffi.Pointer<ffi.Void>)>>;
typedef DartPort = ffi.Int64;
