/* Service worker for the PDF splitter.

   The page is served network-first: a launch with a connection always gets the
   current build, falling back to the cached copy when the network is slow or
   absent, so it still works offline. Static assets stay cache-first.

   Bump CACHE when index.html changes, and keep it in step with the version and
   date in that file's footer — the footer is how anyone checks which build they
   are actually running. */
var CACHE = "pdf-splitter-v7";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon.svg"
];
var NET_TIMEOUT = 4000;

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function fromCache(req){
  return caches.match(req, { ignoreSearch: true }).then(function(hit){
    return hit || caches.match("./index.html");
  });
}

function save(req, res){
  if(res && res.ok && res.type === "basic"){
    var copy = res.clone();
    caches.open(CACHE).then(function(c){ c.put(req, copy); });
  }
  return res;
}

// The page itself: whichever answers first, but the network result is always
// cached, so a slow launch still leaves the newest build ready for the next.
function networkFirst(req){
  var net = fetch(req).then(function(res){ return save(req, res); });
  var timed = new Promise(function(resolve){
    setTimeout(function(){ resolve(fromCache(req).then(function(hit){ return hit || net; })); }, NET_TIMEOUT);
  });
  return Promise.race([net, timed]).catch(function(){ return fromCache(req); });
}

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var isPage = e.request.mode === "navigate" ||
               /\/(index\.html)?(\?.*)?$/.test(new URL(e.request.url).pathname);
  e.respondWith(
    isPage ? networkFirst(e.request)
           : caches.match(e.request, { ignoreSearch: true }).then(function(hit){
               return hit || fetch(e.request).then(function(res){ return save(e.request, res); })
                                             .catch(function(){ return fromCache(e.request); });
             })
  );
});
