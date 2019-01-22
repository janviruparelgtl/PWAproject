
workbox.skipWaiting()
workbox.clientsClaim()

const url = "https://node-project-011019.herokuapp.com/";

//for CDN link to store in cache file
workbox.routing.registerRoute(
    new RegExp('https:.*min\.(css|js)'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'cdn-cache'
    })
)

workbox.routing.registerRoute(
    new RegExp('https:.*.herokuapp.com'),
    workbox.strategies.networkFirst({
        cacheName: 'my-cache'
    })
)

self.addEventListener('fetch', event => {
    if (event.request.method === "POST") {
        // self.registration.sync.register('image-fetch').then(() => {
        //     console.log('Sync registered');
        // });
        event.respondWith(
            fetch(event.request).catch(err => {
                return new Response(
                    JSON.stringify({ error: "This action disabled while app is offline" }),
                    { headers: { 'Content-Type': 'application/json' } }
                )
            })
        )
    }
})

self.addEventListener('push', event => {
    event.waitUntil(self.registration.showNotification('React-app', {
        icon: '/images/icons/icon-128x128.png',
        body: event.data.text()
    }))
})

function readUser(){
        var openRequest = indexedDB.open("test", 1);
        var dbExists = true;
        openRequest.onupgradeneeded = function (e){
          e.target.transaction.abort();
          dbExists = false;
        }
        if(dbExists){
        openRequest.onsuccess = function (e) {
          var db = e.target.result;
          console.log(db)
          var transaction = db.transaction(["users"], "readwrite");
          var store = transaction.objectStore("users");
          var request = store.getAllKeys();
          request.onsuccess = function () {
           
            if (request.result.length >= 1) {
             
              for (var i = 0; i < request.result.length; i++) {
                fetch(url + 'postitems.json', {
                  method: 'POST',
                  body: JSON.stringify({ item: request.result[i] }),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
                  .then(res => res.json())
                store.delete(request.result[i]);
              }
            }
            // if(request.result.length ===1) {
            //   console.log("in 1")
            //   fetch(url + 'postitems.json', {
            //     method: 'POST',
            //     body: JSON.stringify({ item: request.result }),
            //     headers: {
            //       'Content-Type': 'application/json'
            //     }
            //   })
            //     .then(res => res.json())
            //   store.delete(request.result);
            // }
          }
          db.close();
        }
      }
}
self.addEventListener('sync', function (event) {

    if (event.tag === 'image-fetch') {
        // createDB()
        //readUser()
    }

});

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])