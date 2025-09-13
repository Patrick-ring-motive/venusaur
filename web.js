const elements = [...document.getElementsByTagName('*')];
for(const el of elements){
  const classes = String(el.getAttribute('class'))
  if( classes.includes('GoogleCreativeContainerClass') || classes.includes('adthrive-ad') || /frame/i.test(el.tagName)){
    el.remove();
  }
}

setInterval(()=>{
  const elements = [...document.querySelectorAll('.adthrive-ad,.GoogleCreativeContainerClass,iframe,frame')];
  for(const el of elements){
    el.remove();
  }
},300);
