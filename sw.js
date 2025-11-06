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

  const cacheMatch = async(key)=>{
    try{
      key = String(key?.clone?.().url ?? key);
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(key,{ignoreMethod:true,ignorVary:true});
    }catch(e){
      console.warn(e,...args);
    }
  };

  const serviceFetch = async(...args)=>{
    try{
      return await fetch(...args);
    }catch(e){
      console.warn(e,...args);
      return new Response(String(e?.stack??e),{status:569,statusText:String(e?.message??e)});
    }
  };
  
  self.addEventListener('fetch', event => {
  });

})();
