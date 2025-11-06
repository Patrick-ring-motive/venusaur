(()=>{
  if(!typeof Window)return;
  navigator.serviceWorker.register(document.currentScript.src);
})();


(()=>{
// service-worker.js
  if(typeof Window)return;

  const CACHE_NAME = 'app-cache-v1';
    
  // Install: pre-cache app shell
  self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

  const awaitUntil = (event,promise) =>{
    event.waitUntil((async()=>{
      await event;
      await promise;
      await event;
    };
    return promise;
  };

  const cacheMatch = (async()=>{
    try{
      const cache = await caches.open(CACHE_NAME);
    }catch(e){
      console.warn(e,...args);
    }
  };
  
  self.addEventListener('fetch', event => {
  });

})();
