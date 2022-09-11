
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error('expected a boolean argument');
    }
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error('expected a string argument');

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}

function logError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let error = (function () {
            try {
                return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
            } catch(_) {
                return "<failed to stringify thrown value>";
            }
        }());
        console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
        throw e;
    }
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error('expected a number argument');
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertNum(arg0);
        _assertNum(arg1);
        wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd42fc06378b9e3d2(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wbg_adapter_35(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1114687322dbefb1(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_38(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbb5f18c8cf450740(arg0, arg1);
}

function __wbg_adapter_41(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha5ac6e4a19e25ec6(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_44(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1e774435d9722aa9(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_47(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8095a373963e4c78(arg0, arg1);
}

function __wbg_adapter_50(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h60a8679718e5d22c(arg0, arg1, addHeapObject(arg2));
}

/**
*/
export function start() {
    wasm.start();
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* If this returns Some, user has joined a federation. Otherwise they haven't.
* @param {WasmDb} db
* @returns {Promise<WasmClient | undefined>}
*/
export function init_(db) {
    _assertClass(db, WasmDb);
    if (db.ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    var ptr0 = db.ptr;
    db.ptr = 0;
    const ret = wasm.init_(ptr0);
    return takeObject(ret);
}

/**
* @param {string} bolt11
* @returns {string}
*/
export function decode_invoice(bolt11) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(bolt11, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decode_invoice(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr1 = r0;
        var len1 = r1;
        if (r3) {
            ptr1 = 0; len1 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(ptr1, len1);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
function __wbg_adapter_269(arg0, arg1, arg2, arg3) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h825801fadbe4b1ff(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export class WasmClient {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        const obj = Object.create(WasmClient.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmclient_free(ptr);
    }
    /**
    * @param {WasmDb} db
    * @param {string} cfg
    * @returns {Promise<WasmClient>}
    */
    static join_federation(db, cfg) {
        _assertClass(db, WasmDb);
        if (db.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = db.ptr;
        db.ptr = 0;
        const ptr1 = passStringToWasm0(cfg, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmclient_join_federation(ptr0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    */
    info() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        wasm.wasmclient_info(this.ptr);
    }
    /**
    */
    leave_federation() {
        try {
            if (this.ptr == 0) throw new Error('Attempt to use a moved value');
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(ptr);
            wasm.wasmclient_leave_federation(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Promise<any>}
    */
    balance() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        const ret = wasm.wasmclient_balance(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} bolt11
    * @returns {Promise<any>}
    */
    pay(bolt11) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        const ptr0 = passStringToWasm0(bolt11, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmclient_pay(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {number} amount
    * @param {string} description
    * @returns {Promise<any>}
    */
    invoice(amount, description) {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        _assertNum(amount);
        const ptr0 = passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmclient_invoice(this.ptr, amount, ptr0, len0);
        return takeObject(ret);
    }
}
/**
*/
export class WasmDb {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        const obj = Object.create(WasmDb.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdb_free(ptr);
    }
    /**
    * Load the database from indexed db.
    * @param {string} idb_name
    * @returns {Promise<WasmDb>}
    */
    static load(idb_name) {
        const ptr0 = passStringToWasm0(idb_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdb_load(ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @returns {WasmDb}
    */
    clone() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        const ret = wasm.wasmdb_clone(this.ptr);
        return WasmDb.__wrap(ret);
    }
    /**
    * Save the database into indexed db.
    * @returns {Promise<any>}
    */
    save() {
        if (this.ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.ptr);
        const ret = wasm.wasmdb_save(this.ptr);
        return takeObject(ret);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_wasmclient_new = function() { return logError(function (arg0) {
        const ret = WasmClient.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_wasmdb_new = function() { return logError(function (arg0) {
        const ret = WasmDb.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_mark_abc7631bdced64f0 = function() { return logError(function (arg0, arg1) {
        performance.mark(getStringFromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_measure_c528ff64085b7146 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        try {
            performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
            wasm.__wbindgen_free(arg2, arg3);
        }
    }, arguments) };
    imports.wbg.__wbg_log_02e20a3c32305fb7 = function() { return logError(function (arg0, arg1) {
        try {
            console.log(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    }, arguments) };
    imports.wbg.__wbg_log_5c7513aa8c164502 = function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        try {
            console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    }, arguments) };
    imports.wbg.__wbindgen_is_falsy = function(arg0) {
        const ret = !getObject(arg0);
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function() { return logError(function (arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    }, arguments) };
    imports.wbg.__wbg_new_693216e109162396 = function() { return logError(function () {
        const ret = new Error();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_fetch_b1379d93c1e2b015 = function() { return logError(function (arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_readyState_d3fe8d73ef14c490 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).readyState;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setonopen_e58b724aa21610a4 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonerror_3375cf6162c60ad1 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonclose_b0ba2b247964c57a = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonmessage_7ff15f986bd94ef0 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setbinaryType_9aeb85b4bbc6b124 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_new_875d595b7582236e = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_23fa900ecee13ee4 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_send_56ace0158235d307 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_send_25548b20044c16cb = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_new_4cba26249c1686cd = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_9c6d4d7f71076e48 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbFactory_acaddaa9df3f73bc = function() { return logError(function (arg0) {
        const ret = getObject(arg0) instanceof IDBFactory;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_open_3384efa97bde264f = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_open_2a1e9120d3d8897d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_objectStoreNames_d11a3d06e3226638 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).objectStoreNames;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createObjectStore_454d7cf701faa545 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_deleteObjectStore_ec34033b22e0c4e1 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).deleteObjectStore(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_transaction_0dcffc72158c7b6f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_240e67e5796c3c6b = function() { return logError(function (arg0) {
        const ret = getObject(arg0) instanceof Response;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_url_0f503b904b694ff5 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_status_9067c6a4fdd064c9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).status;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_aa309e800cf75016 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_indexNames_8f97f1f79bc278bf = function() { return logError(function (arg0) {
        const ret = getObject(arg0).indexNames;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_add_2fedfab99713dd64 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).add(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_add_4a04c7e49a08d5f1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).add(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clear_599e4af90fdce033 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).clear();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createIndex_20c39366f6b22548 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_deleteIndex_9d33d4fd04e9038c = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).deleteIndex(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_openCursor_10a7a7a41fce054c = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).openCursor();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_4292a52d0e6d4246 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).openCursor(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_abefd2bc54b71e0f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).openCursor(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_wasClean_ebeac2953d350fb6 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).wasClean;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_code_a328d8c712da06b9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).code;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_reason_39f05679febda710 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).reason;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_length_580a8f6d9757b9da = function() { return logError(function (arg0) {
        const ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_contains_bcaf1388e1ca982c = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).contains(getStringFromWasm0(arg1, arg2));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_50220f3428ca7e51 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg1)[arg2 >>> 0];
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_setonupgradeneeded_8956d6214819f478 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_result_4b44b0d900b4ab6f = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_c872d3f7251736f1 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_0ba302b35542323f = function() { return logError(function (arg0) {
        const ret = getObject(arg0).transaction;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonsuccess_bb91afe1f8110021 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonerror_db491b84dd45e918 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_newwithstrandinit_de7c409ec8538105 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_fetch_17b968b9c79d3c56 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_target_68a5c10e2732a79e = function() { return logError(function (arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_data_63829cccb08a0246 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_value_a3a782e66c6935d3 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_key_3ce14c27a234543a = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).key;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_advance_5da26ebf2f15b82e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).advance(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_continue_43562ff8da972056 = function() { return handleError(function (arg0) {
        getObject(arg0).continue();
    }, arguments) };
    imports.wbg.__wbg_setoncomplete_8bfbade4ed628fd0 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).oncomplete = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonerror_9d842115702fd223 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_commit_6211fe2744b83edc = function() { return handleError(function (arg0) {
        getObject(arg0).commit();
    }, arguments) };
    imports.wbg.__wbg_objectStore_76c268be095ec9a5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setTimeout_131fc254e1bd5624 = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_65417660fe82f08d = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_self_86b4b13392c7af56 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_9ad6677321a08dd8 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_b8c92eaac23d0d80 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_dd27e6b0652b3236 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_e57c9b75ddead065 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_d2ba53160aec6aba = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_static_accessor_MODULE_452b4680e8614c81 = function() { return logError(function () {
        const ret = module;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_require_f5521a5b85ad2542 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_5a86d77a66230f81 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_b95d7173266618a9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_b14734aa289bc356 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_static_accessor_NODE_MODULE_26b231378c1be7dd = function() { return logError(function () {
        const ret = module;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_require_0db1598d9ccecb30 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_91e2b39becca6147 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_process_e56fd54cf6319b6c = function() { return logError(function (arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_versions_77e21455908dad33 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_node_0dd25d832e4785d5 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_new_ee1a3da85465d621 = function() { return logError(function () {
        const ret = new Array();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_push_0bc7fce4a139a883 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_ArrayBuffer_02bbeeb60438c785 = function() { return logError(function (arg0) {
        const ret = getObject(arg0) instanceof ArrayBuffer;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_Error_2082612c1902c887 = function() { return logError(function (arg0) {
        const ret = getObject(arg0) instanceof Error;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_message_924b46658b69b295 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_name_e88a3b3a0f6b23c2 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_toString_dc4768002eeae1b0 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newnoargs_971e9a5abe185139 = function() { return logError(function (arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_33d7bcddbbfa394a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_65af9f665ab6ade5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_3d0c4cc33e7418c9 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_726d1c2255989269 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_e5655b169bb04f60 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).done;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_value_8f901bca1014f843 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getTime_58b0bdbebd4ef11d = function() { return logError(function (arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new0_adda2d4bcb124f0a = function() { return logError(function () {
        const ret = new Date();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_e6a9fecc2bf26696 = function() { return logError(function () {
        const ret = new Object();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_iterator_22ed2b976832ff0c = function() { return logError(function () {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_52205195aa880fc2 = function() { return logError(function (arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_269(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    }, arguments) };
    imports.wbg.__wbg_resolve_0107b3a501450ba0 = function() { return logError(function (arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_18da6e5453572fc8 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_e5489f796341454b = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_3348936ac49df00a = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_self_fd00a1ef86d1b2ed = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_6f6e346d8bbd61d7 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_67175caf56f55ca9 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_cda198d9dbc6d7ea = function() { return logError(function (arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithlength_66e5530e7079ea1b = function() { return logError(function (arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithbyteoffsetandlength_88fdad741db1b182 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_subarray_270ff8dd5582c1ac = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_51f19f73d6d9eff3 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_1a930cfcda1a8067 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_buffer_34f5ec9f8a838ba0 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stringify_d8d1ee75d5b55ce4 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_72332cd2bc57924c = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_3be27932089d278e = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_2762e698c2f5b7e0 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_3a746f2619705add = function() { return logError(function (arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_f54d3a6dadb199ca = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_self_ac379e780a0d8b94 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_1e4302b85d4f64a2 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_1b4ba144162a5c9e = function() { return logError(function (arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_1ef11e888e5228e9 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_require_6461b1e9a0d7c34a = function() { return logError(function (arg0, arg1) {
        const ret = require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_1b52c8482374c55b = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper13616 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 730, __wbg_adapter_32);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper20125 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1205, __wbg_adapter_35);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper20127 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1199, __wbg_adapter_38);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper20129 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1203, __wbg_adapter_41);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper20131 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1201, __wbg_adapter_44);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper32273 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1649, __wbg_adapter_47);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper32417 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1671, __wbg_adapter_50);
        return addHeapObject(ret);
    }, arguments) };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = new Int32Array();
    cachedUint8Memory0 = new Uint8Array();

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(bytes) {
    const imports = getImports();

    initMemory(imports);

    const module = new WebAssembly.Module(bytes);
    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('minimint_bridge_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
