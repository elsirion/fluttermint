'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "bb9176104c3b74c1bbdd622cc94fedb1",
"main.dart.js": "6da938e41e086e12ab444fc01377950f",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.d.ts": "b1927f7dc2f4f278a823e462d317c1ea",
"index.html": "48e63229334e6532b5174fc4676e4058",
"/": "48e63229334e6532b5174fc4676e4058",
"version.json": "2b40852cbc0a4c583f641335864dfda1",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"index.ts": "c6057bdf06dddc854e825667eae0dcd7",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/NOTICES": "b0d1683e3a501e5fac7ad07ebf39d15a",
"assets/AssetManifest.json": "cf91af3a8b15519e1fccbd4259ca727f",
"assets/images/fed-graphic.png": "f934a497caf1f39c6ef89acbf9ac78f2",
"assets/images/bg-dark.png": "6de7e2fc30cc1d98ac49be4edd3124a3",
"assets/images/polygon.png": "f57cb139487fb0f6d2c7be9b0211e6c3",
"assets/images/dirtyqr.png": "2c20734bcbe3ea06bb366605785ba85b",
"assets/images/bolt-circle.png": "8c56c633c3bef912d9d45f45d2ee8a05",
"assets/assets/spinny_globe.riv": "d8abae6223d726b63283e18e89c1d923",
"assets/fonts/Archivo_Expanded-Thin.ttf": "27ad3884438a8a17d85aac5b63005924",
"assets/fonts/Archivo_Expanded-Light.ttf": "499ab029cf7a7c32cd030d989a28bea1",
"assets/fonts/Inter-Regular.ttf": "851660f90f21dba5ec35b1765fdd426a",
"assets/fonts/Archivo_Expanded-Bold.ttf": "f2382e6e321b3d5eadbc2ee12acc53de",
"assets/fonts/Archivo-ExtraLight.ttf": "22c0ee13bfb822d18b4ba33ea020063a",
"assets/fonts/Archivo_Expanded-Regular.ttf": "dfcf0c3a85fb17e4abe323084f471c98",
"assets/fonts/Archivo_Expanded-Black.ttf": "235e1691d50acb8b917b460e5a02cbf8",
"assets/fonts/Archivo-SemiBold.ttf": "c690e6fd48af9806f63605fb830ca06e",
"assets/fonts/Archivo_Expanded-Medium.ttf": "57a4bfbc7a800223ea6fdc89aecdd398",
"assets/fonts/Archivo-Black.ttf": "b9715d8c3c4c1864cfbb121f21d5b18e",
"assets/fonts/Archivo_Expanded-ExtraBold.ttf": "3faedabcb95e285d0d80fb73f3a8b5a7",
"assets/fonts/Archivo-Regular.ttf": "6605bf394691b0215a07167db60cefa7",
"assets/fonts/Archivo-Thin.ttf": "1c96f11746cca595a3c6610ad5eecdc2",
"assets/fonts/Archivo-Medium.ttf": "e57575f198356256cd5659a67998693e",
"assets/fonts/Archivo-Bold.ttf": "bcd0dc6438407a683457809c9b4468de",
"assets/fonts/Archivo-ExtraBold.ttf": "361ffd657efcbccc396ba5016e8a139a",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/fonts/Archivo-Light.ttf": "e88eeb4ca41d2b0c7cc325eec2255b8e",
"assets/fonts/Archivo_Expanded-SemiBold.ttf": "173aad87b04c25f21809ad77f598e1f9",
"assets/fonts/Archivo_Expanded-ExtraLight.ttf": "144ecb55d9940ac28f08173e1130e2fa",
"assets/FontManifest.json": "74490eb8070c9a8c8bd1865b2b151682",
"index.js": "6d73a8030f7dc4c4d2ba691a9c8b33a2",
"pkg/minimint_bridge.d.ts": "0765bf9f3771af86e4972411c69e7000",
"pkg/minimint_bridge_bg.wasm.d.ts": "82c52adf6e8e8b85eb57f5db3d4c0d06",
"pkg/minimint_bridge.js": "e2c68b39f01ea7b8dec79fb3af963ef5",
"pkg/package.json": "596c855a05599937de24f8abe20217bb",
"pkg/minimint_bridge_bg.wasm": "3a2824ef6dd08d088af15c021447820a",
"favicon.png": "5dcef449791fa27946b3d35ad8803796"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
