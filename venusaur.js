const hostMap = {
	'm-venu.lenguapedia.com' :'m.bulbapedia.bulbagarden.net',
	'm.venu.lenguapedia.com' :'m.bulbapedia.bulbagarden.net',
	'venu.lenguapedia.com' :'bulbapedia.bulbagarden.net',
	'.lenguapedia.com' : '.bulbagarden.net'
};
const targetHost = 'bulbapedia.bulbagarden.net';
const targetHostRe = new RegExp(targetHost,'gi');
const webScriptURL = "https://raw.githubusercontent.com/Patrick-ring-motive/venusaur/refs/heads/main/web";
const fetchText = async function fetchText(...args){
	const resp = await fetch(...args);
	return resp.text();
};
let time = new Date().getTime();
let started = false;
const init = ()=>{
	if(started)return;
	time = new Date().getTime();
	setInterval(()=>time++,1);
	started = true;
};
const setCacheHeaders = (headers,seconds=5/*96400*/) =>{
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
	for(let [key,value] of requestHeaders){
		if(/proto|policy/i.test(key))continue;
		if(key === 'referer' && /archive/.test(requestHeaders.get('host')))continue;
		for(const key in hostMap){
			value = value.replaceAll(key,hostMap[key]);
		}
		newHeaders.append(key,value.replace(replacer,targetHost));
	}
	return setCacheHeaders(newHeaders,30);
};
const transformResponseHeaders = (responseHeaders,replacement)=>{
	const newHeaders = new Headers();
	for(let [key,value] of responseHeaders){
		if(/proto|policy/i.test(key))continue;
		for(const key in hostMap){
			value = value.replaceAll(hostMap[key],key);
		}
		newHeaders.append(key,value.replace(targetHostRe,replacement));
	}
	return newHeaders;
};
const isPromise = x => x instanceof Promise || x?.constructor?.name == 'Promise' || typeof x?.then == 'function';
let webScript,webCss;

export async function onRequest(request) {
	init();
	if(!webScript){
	    webScript = fetchText(`${webScriptURL}.js?${time}`,{headers:{"Cache-Control":"no-cache"}});
	}
	if(isPromise(webScript)){
		webScript = await webScript;
	}
	if(!webCss){
	    webCss = fetchText(`${webScriptURL}.css?${time}`,{headers:{"Cache-Control":"no-cache"}});
	}
	if(isPromise(webCss)){
		webCss = await webCss;
	}
	const thisHost = `${request.headers.get('host')}`;
	const thisHostRe = new RegExp(thisHost,'gi');
	const requestInit = {
		method : request.method,
		headers : transformRequestHeaders(request.headers,thisHostRe),
	};
	if(request.body && !/GET|HEAD/.test(request.method)){
		requestInit.body = request.body;
	}
	requestInit.headers.set('user-agent','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6.2 Mobile/15E148 Safari/604.1');
	let url = request.url
	for(const key in hostMap){
		url = url.replaceAll(key,hostMap[key]);
	}
	url = url.replace(thisHostRe,targetHost);
	if(url.includes('archive')){
		requestInit.headers.set('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
	}
	console.log(url,requestInit);
    let response = await fetch(url,requestInit);
	const responseInit = {
		status:response.status,
		statusText:response.statusText,
		headers:transformResponseHeaders(response.headers,thisHost)
	};
    if(/text|html|script|xml|json/i.test(response.headers.get('content-type'))){
		let resBody = await response.text();
		for(const key in hostMap){
			resBody = resBody.replaceAll(hostMap[key],key);
		}
		resBody = resBody.replace(targetHostRe,thisHost);
		if(/html/i.test(response.headers.get('content-type'))){
			resBody = `<script src="${webScriptURL}.js?${time}"></script>
                       <link rel="stylesheet" href="${webScriptURL}.css?${time}"></link>
                       <script>${webScript}</script>
					   <style>${webCss}</style>
					   ${resBody.replaceAll('<img ','<img loading="lazy" ')}
					   <script src="${webScriptURL}.js?${Math.random()}"></script>`;
		}
		if(response.ok)setCacheHeaders(responseInit.headers,3);
		response = new Response(resBody,responseInit);
	}else{
		if(response.ok)setCacheHeaders(responseInit.headers);
		response = new Response(response.body,responseInit);
	}
	for(let [key,value] of requestInit.headers){
		responseInit.headers.set(`request-${key}`,value);
	}
	setTimeout(()=>{
		if(!isPromise(webScript)){
			webScript = null;
		}
	},5000);
    return response;
	
  };
