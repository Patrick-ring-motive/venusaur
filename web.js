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

const elements = [...document.getElementsByTagName('*'),...document.firstElementChild.children];
for(const el of elements){
  const classes = String(el?.getAttribute?.('class'));
  if(classes.includes('GoogleCreativeContainerClass')
     || classes.includes('adthrive-ad')
     || classes.includes('google-ad')
     || /frame|iframe/i.test(el?.tagName)
     || String(el?.src).includes('ads.adthrive')){
    el?.remove?.();
  }
}

setInterval(()=>{
  const elements = [...document.querySelectorAll('div[class*="adthrive"],[class*="adthrive-ad"],.GoogleCreativeContainerClass,iframe,frame,[src*="ads.adthrive"],.google-ad-manager-fallback-container')];
  for(const el of elements){
    el?..remove?.();
  }
},300);
