const elements = [...document.getElementsByTagName('*')];
for(const el of elements){
  const classes = String(el.getAttribute('class'));
  if(classes.includes('GoogleCreativeContainerClass')
     || classes.includes('adthrive')
     || classes.includes('google-ad')
     || /frame|iframe/i.test(el.tagName)
     || String(el.src).includes('ads.adthrive')){
    el.remove();
  }
}

setInterval(()=>{
  const elements = [...document.querySelectorAll('[class*="adthrive"],.GoogleCreativeContainerClass,iframe,frame,[src*="ads.adthrive"],.google-ad-manager-fallback-container')];
  for(const el of elements){
    el.remove();
  }
},300);
