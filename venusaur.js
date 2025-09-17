const hostMap = {
	'm-venu.lenguapedia.com' :'m.bulbapedia.bulbagarden.net',
	'm.venu.lenguapedia.com' :'m.bulbapedia.bulbagarden.net',
	'venu.lenguapedia.com' :'bulbapedia.bulbagarden.net',
	'.lenguapedia.com' : '.bulbagarden.net'
};
const targetHost = 'bulbapedia.bulbagarden.net';
const targetHostRe = new RegExp(targetHost,'gi');
const webScriptURL = "https://raw.githubusercontent.com/Patrick-ring-motive/venusaur/refs/heads/main/web.js";
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
let webScript;

export async function onRequest(request) {
	init();
	if(!webScript){
	    webScript = fetchText(`${webScriptURL}?${new Date().getTime()}`);
	}
	if(isPromise(webScript)){
		webScript = await webScript;
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
	//requestInit.headers.set('user-agent','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6.2 Mobile/15E148 Safari/604.1');
	let url = request.url
	for(const key in hostMap){
		url = url.replaceAll(key,hostMap[key]);
	}
	url = url.replace(thisHostRe,targetHost);
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
			resBody = `<script src="${webScriptURL}?${new Date().getTime()}"></script>
                       <script>${webScript}</script>
					   ${resBody}
					   <script src="${webScriptURL}?${Math.random()}"></script>`;
		}
		setCacheHeaders(responseInit.headers,3);
		response = new Response(resBody,responseInit);
	}else{
		setCacheHeaders(responseInit.headers);
		response = new Response(response.body,responseInit);
	}
    return response;
  };
