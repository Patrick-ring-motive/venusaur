(()=>{
  // Wrap in IIFE to create non polluting closures
  (() => {
    // fallback stringifier
    const stringify = x => {
      try {
        return JSON.stringify(x);
      } catch {
        return String(x);
      }
    };
    // blocks is a list of strings we intend to filter out
    const blocks = ["adthrive"];
    // Create a closure map to store instance properties that are in accessible to external viewers
    // use WeakMap if available for better memory management but regular map also works
    const $Map = self?.WeakMap ?? Map;
    // storing the input arguments to the open method so we can access them later in the send method
    const _openArgs = new $Map();
    // List of objects in the xhr api, xhr event target is the parent class so we want to patch it last
    for (const xhr of [XMLHttpRequest, XMLHttpRequestUpload, XMLHttpRequestEventTarget]) {
      try {
        // extra IIFE layer for additional closures
        (() => {
          // store the original open method
          const _open = xhr.prototype.open;
          if (!_open) return;
          // set up inheritance between new method to old one to maintain other customizations from others
          xhr.prototype.open = Object.setPrototypeOf(function open(...args) {
            // store input args in closure map
            _openArgs.set(this, args);
            return _open.apply(this, args);
          }, _open);
        })();

        (() => {
          // store the original send method
          const _send = xhr.prototype.send;
          if (!_send) return;
          // set up inheritance between new method to old one to maintain other customizations from others
          xhr.prototype.send = Object.setPrototypeOf(function send(...args) {
            // store input args in closure map
            const openArgs = _openArgs.get(this) ?? [];
            for (const arg of openArgs) {
              const sarg = stringify(arg);
              for (const block of blocks) {
                if (sarg.includes(block)) return;
              }
            }
            return _send.apply(this, args);
          }, _send);
        })();

        // patching a property is similar to patching a method but only for the property getter
        // this example block the response if it contains one of our string representations
        for (const res of ['response', 'responseText', 'responseURL', 'responseXML']) {
          (() => {
            const _response = Object.getOwnPropertyDescriptor(xhr.prototype, res)?.get;
            if (!_response) return;
            Object.defineProperty(xhr.prototype, res, {
              configurable: true,
              enumerable: true,
              get: Object.setPrototypeOf(function response() {
                for (const block of blocks) {
                  // block request if it matches list
                  if (stringify(x).includes(block)) {
                    console.warn('blocking xhr response', stringify(x));
                    // return the expected object type but empty
                    return Object.create(_response.call(this)?.__proto__);
                  }
                }
                return _response.call(this);
              }, _response)
            });
          })()
        }
      } catch {}
    }
  })();


(()=>{
    const $fetch = globalThis.fetch;
    globalThis.fetch = Object.setPrototypeOf(async function fetch(...args){
      try{
        if(args.some(arg=>String(arg.url??arg).includes('adthrive'))){
          return new Promise(()=>{});
        }
        return await $fetch(...args);
      }catch(e){
        console.warn(e,...arguments);
        return new Response(Object.getOwnPropertyNames(e??{}).map(x=>`${x} : ${e[x]}`).join(''),{
          status : 569,
          statusText:e?.message
        });
      }
    },$fetch);
})();

(()=>{
  const selectors = 'video,div[class*="adthrive"],[class*="adthrive-ad"],.GoogleCreativeContainerClass,iframe,frame,object,embed,[src*="ads.adthrive"],.google-ad-manager-fallback-container';
  const style = document.createElement(selectors);
  style.innerText = `${selectors}{
    display:none !important;
    visibility:hidden !important;
    opacity:0 !important;
  }`;
  document.firstElementChild.appendChild(style);
  const Q = fn =>{
    try{return fn?.()}catch{}
  };
  const remove = x =>{
    Q(()=>Element.prototype.remove.apply(x));
    Q(()=>x.parentElement.removeChild(x));
  };
const elements = [...document.getElementsByTagName('*'),...document.firstElementChild.children];
for(const el of elements){
  const classes = String(el?.getAttribute?.('class'));
  if(classes.includes('GoogleCreativeContainerClass')
     || classes.includes('adthrive-ad')
     || classes.includes('google-ad')
     || /frame|iframe/i.test(el?.tagName)
     || String(el?.src).includes('ads.adthrive')){
    remove(el);
  }
}

setInterval(()=>{
  const elements = [...document.querySelectorAll(selectors)];
  for(const el of elements){
    remove(el);
  }
},300);
})();
})();


 
