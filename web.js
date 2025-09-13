const elements = [...document.getElementsByTagName('*')];
for(const el of elements){
  if(String(el.getAttribute('class')).includes('GoogleCreativeContainerClass') || /frame/i.test(el.tagName)){
    el.remove();
  }
}

setInterval(()=>{
  const elements = [...document.querySelectorAll('.GoogleCreativeContainerClass,iframe,frame')];
  for(const el of elements){
    el.remove();
  }
},300);
