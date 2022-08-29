use crate::client::Client;
use std::sync::Arc;

use fedimint_api::db::batch::DbBatch;
use fedimint_api::db::mem_impl::MemDatabase;
use fedimint_api::db::Database;
use fedimint_api::db::PrefixIter;
use js_sys::{Promise, Uint8Array};
use rexie::Rexie;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen_futures::spawn_local;

#[wasm_bindgen]
pub struct WasmClient(Arc<Client>);
type Result<T> = std::result::Result<T, JsValue>;

#[wasm_bindgen(start)]
pub fn start() {
    tracing_wasm::set_as_global_default_with_config(
        tracing_wasm::WASMLayerConfigBuilder::default()
            .set_console_config(tracing_wasm::ConsoleConfig::ReportWithConsoleColor)
            .set_max_level(tracing::Level::INFO)
            .build(),
    );
    console_error_panic_hook::set_once();
}

/// If this returns Some, user has joined a federation. Otherwise they haven't.
// wasm doesn't like init function
#[wasm_bindgen]
pub async fn init_(db: WasmDb) -> Result<Option<WasmClient>> {
    if let Some(client) = Client::try_load(Box::new(db)).await.map_err(anyhow_to_js)? {
        let client = Arc::new(client);
        let client_poll = client.clone();
        wasm_bindgen_futures::spawn_local(async move {
            client_poll.poll().await;
        });
        tracing::info!("already joined federation");
        Ok(Some(WasmClient(client)))
    } else {
        tracing::info!("needs to join federation");
        Ok(None)
    }
}

fn anyhow_to_js(error: anyhow::Error) -> JsValue {
    JsValue::from(error.to_string())
}

#[wasm_bindgen]
impl WasmClient {
    #[wasm_bindgen]
    pub async fn join_federation(db: WasmDb, cfg: String) -> Result<WasmClient> {
        let client = Client::new(Box::new(db), &cfg)
            .await
            .map_err(anyhow_to_js)?;

        let client = Arc::new(client);
        let client_poll = client.clone();
        wasm_bindgen_futures::spawn_local(async move {
            client_poll.poll().await;
        });
        Ok(WasmClient(client))
    }

    #[wasm_bindgen]
    pub fn info(&self) {
        let coins = self.0.client.coins();
        tracing::info!(
            "We own {} coins with a total value of {}",
            coins.coin_count(),
            coins.amount()
        );
        for (amount, coins) in coins.coins {
            tracing::info!("We own {} coins of denomination {}", coins.len(), amount);
        }
    }

    #[wasm_bindgen]
    pub fn leave_federation(self) -> Result<()> {
        // delete the database (their ecash tokens will disappear ... this shouldn't be done lightly ...)
        // set CLIENT to None
        Ok(())
    }

    // NOTE: we need to use `Promise` instead of `async` support due to lifetimes.
    #[wasm_bindgen]
    pub fn balance(&self) -> Promise {
        let this = self.0.clone();
        future_to_promise(async move { Ok(JsValue::from(this.balance().await as u32)) })
    }

    #[wasm_bindgen]
    pub fn pay(&self, bolt11: String) -> Promise {
        let this = self.0.clone();
        future_to_promise(async move {
            this.pay(bolt11).await.map_err(anyhow_to_js)?;
            Ok(JsValue::null())
        })
    }

    #[wasm_bindgen]
    // TODO: wasm doesn't like u64
    pub fn invoice(&self, amount: u32, description: String) -> Promise {
        let this = self.0.clone();
        future_to_promise(async move {
            Ok(JsValue::from(
                this.invoice(amount as u64, "example".to_string()).await.map_err(anyhow_to_js)?,
            ))
        })
    }
}

#[wasm_bindgen]
pub struct WasmDb {
    idb_name: String,
    mem_db: MemDatabase,
}

impl Database for WasmDb {
    fn raw_insert_entry(&self, key: &[u8], value: Vec<u8>) -> anyhow::Result<Option<Vec<u8>>> {
        let result = self.mem_db.raw_insert_entry(key, value);
        spawn_local(self.clone().save_inner());
        result
    }

    fn raw_get_value(&self, key: &[u8]) -> anyhow::Result<Option<Vec<u8>>> {
        self.mem_db.raw_get_value(key)
    }

    fn raw_remove_entry(&self, key: &[u8]) -> anyhow::Result<Option<Vec<u8>>> {
        let result = self.mem_db.raw_remove_entry(key);
        spawn_local(self.clone().save_inner());
        result
    }

    fn raw_find_by_prefix(&self, key_prefix: &[u8]) -> PrefixIter<'_> {
        self.mem_db.raw_find_by_prefix(key_prefix)
    }

    fn raw_apply_batch(&self, batch: DbBatch) -> anyhow::Result<()> {
        let result = self.mem_db.raw_apply_batch(batch);
        spawn_local(self.clone().save_inner());
        result
    }
}

const STORE_NAME: &str = "main";

#[wasm_bindgen]
impl WasmDb {
    /// Load the database from indexed db.
    #[wasm_bindgen]
    pub async fn load(idb_name: String) -> Self {
        let db = Rexie::builder(&idb_name)
            .add_object_store(rexie::ObjectStore::new(STORE_NAME))
            .build()
            .await
            .expect("db error");
        let t = db
            .transaction(&[STORE_NAME], rexie::TransactionMode::ReadOnly)
            .expect("db error");

        let store = t.store(STORE_NAME).expect("db error");

        let db = MemDatabase::new();
        for (k, v) in store
            .get_all(None, None, None, None)
            .await
            .expect("db error")
        {
            // key is an `ArrayBuffer`
            let k = Uint8Array::new(&k).to_vec();
            let v = Uint8Array::try_from(v)
                .expect("value must be uint8array")
                .to_vec();

            db.raw_insert_entry(&k, v).expect("db error");
        }
        t.commit().await.expect("db error");
        Self {
            idb_name: idb_name.to_string(),
            mem_db: db,
        }
    }

    #[wasm_bindgen]
    pub fn clone(&self) -> Self {
        Self {
            idb_name: self.idb_name.clone(),
            mem_db: self.mem_db.clone(),
        }
    }

    async fn save_inner(self) {
        tracing::info!("saving db");
        let db = Rexie::builder(&self.idb_name)
            .add_object_store(rexie::ObjectStore::new(STORE_NAME))
            .build()
            .await
            .expect("db error");
        let t = db
            .transaction(&[STORE_NAME], rexie::TransactionMode::ReadWrite)
            .expect("db error");

        let store = t.store(STORE_NAME).expect("db error");
        store.clear().await.expect("db error");

        for kv in self.mem_db.raw_find_by_prefix(&[]) {
            let (k, v) = kv.expect("db error");
            // NOTE: we can't avoid copying here
            let js_key = Uint8Array::from(&k[..]);
            let js_val = Uint8Array::from(&v[..]);
            store
                // value-key order is correct here
                .add(js_val.as_ref(), Some(js_key.as_ref()))
                .await
                .expect("db error");
        }
        t.commit().await.expect("db error");
    }

    /// Save the database into indexed db.
    #[wasm_bindgen]
    pub fn save(&self) -> Promise {
        let this = self.clone();
        future_to_promise(async move {
            this.save_inner().await;
            Ok(JsValue::UNDEFINED)
        })
    }
}

#[wasm_bindgen]
pub fn decode_invoice(bolt11: String) -> Result<String> {
    crate::client::decode_invoice(bolt11).map_err(anyhow_to_js)
}
