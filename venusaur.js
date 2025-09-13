const targetHost = 'bulbapedia.bulbagarden.net';
const targetHostRe = new RegExp(targetHost,'gi');
let time = new Date().getTime();
let started = false;
const init = ()=>{
	if(started)return;
	time = new Date().getTime();
	setInterval(()=>time++,1);
	started = true;
};
const setCacheHeaders = (headers,seconds=96400) =>{
	for(const header of ["CDN-Cache-Control","Cache-Control","Cloudflare-CDN-Cache-Control","Surrogate-Control","Vercel-CDN-Cache-Control"]){
		headers.set(header,`public, max-age=${seconds}, s-max-age=${seconds}, stale-if-error=31535000, stale-while-revalidate=31535000`);
	}
	for(const header of ['vary','etag','nel','pragma','cf-ray']){
		headers.delete(header);
	}
	headers.set('nel','{}');
	headers.set('expires',new Date(time+(1000*seconds)).toUTCString());
	return headers;
};
const transformRequestHeaders = (requestHeaders,replacer)=>{
	const newHeaders = new Headers();
	for(const [key,value] of requestHeaders){
		if(/proto|policy/i.test(key))continue;
		newHeaders.append(key,`${value}`.replace(replacer,targetHost));
	}
	return setCacheHeaders(newHeaders,30);
};
const transformResponseHeaders = (responseHeaders,replacement)=>{
	const newHeaders = new Headers();
	for(const [key,value] of responseHeaders){
		if(/proto|policy/i.test(key))continue;
		newHeaders.append(key,`${value}`.replace(targetHostRe,replacement));
	}
	return newHeaders;
};

const gzip = body => new Response(body).body.pipeThrough(new CompressionStream("gzip"));
export default {
  async fetch(request) {
	init();
	const thisHost = `${request.headers.get('host')}`;
	const thisHostRe = new RegExp(thisHost,'gi');
	const requestInit = {
		method : request.method,
		headers : transformRequestHeaders(request.headers,thisHostRe),
	};
	if(request.body && !/GET|HEAD/.test(request.method)){
		requestInit.body = request.body;
	}
	const url = request.url.replace(thisHostRe,targetHost);
    let response = await fetch(url,requestInit);
	const responseInit = {
		status:response.status,
		statusText:response.statusText,
		headers:transformResponseHeaders(response.headers,thisHost)
	};
    if(/text|html|script|xml|json/i.test(response.headers.get('content-type'))){
		let resBody = await response.text();
		resBody = resBody.replace(targetHostRe,thisHost);
		if(/html/i.test(response.headers.get('content-type')) && !request.url.includes('convlist.php') && !request.url.includes('ajax')){
			resBody = `<style>html{filter: hue-rotate(45deg);  img:not([src*="header_img"]){filter:hue-rotate(-45deg);}}</style>
			${resBody}
			<script>
			setInterval(()=>{
				const imgs = [...document.querySelectorAll('img[src*="upload.cheese-taupe.pokeheroes.workers.dev"]')];
				for(const img of imgs){
					img.src = img.src.replace("upload.cheese-taupe.pokeheroes.workers.dev","upload.pokeheroes.com");
				}
			},100);
			</script>`
		}
		setCacheHeaders(responseInit.headers,3);
		if(!responseInit.headers.get('transfer-encoding')){
			responseInit.headers.set('content-encoding','gzip');
			resBody = gzip(resBody);
		}
		response = new Response(resBody,responseInit);
	}else{
		setCacheHeaders(responseInit.headers);
		response = new Response(response.body,responseInit);
	}
    return response;
  },
};
