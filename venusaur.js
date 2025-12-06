
const hostMap = {
    'm-venu.lenguapedia.com': 'm.bulbapedia.bulbagarden.net',
    'm.venu.lenguapedia.com': 'm.bulbapedia.bulbagarden.net',
    'venu.lenguapedia.com': 'bulbapedia.bulbagarden.net',
    'github.lenguapedia.com': 'github.com',
    'pkg.lenguapedia.com': 'pkg.go.dev',
    '.lenguapedia.com': '.bulbagarden.net'
};
const targetHost = 'bulbapedia.bulbagarden.net';
const targetHostRe = new RegExp(targetHost, 'gi');
const webScriptURL = "https://raw.githubusercontent.com/Patrick-ring-motive/venusaur/refs/heads/main/web";
const fetchText = async function fetchText(...args) {
    const resp = await fetch(...args);
    return resp.text();
};
let time = new Date().getTime();
let started = false;
const init = () => {
    if (started) return;
    time = new Date().getTime();
    setInterval(() => time++, 1);
    started = true;
};
const setCacheHeaders = (headers, seconds = 96400) => {
    for (const header of ["CDN-Cache-Control", "Cache-Control", "Cloudflare-CDN-Cache-Control", "Surrogate-Control", "Vercel-CDN-Cache-Control"]) {
        headers.set(header, `public, max-age=${seconds}, s-max-age=${seconds}, stale-if-error=31535000, stale-while-revalidate=31535000`);
    }
    for (const header of ['vary', 'etag', 'nel', 'pragma', 'cf-ray']) {
        headers.delete(header);
    }
    headers.set('nel', '{}');
    headers.set('expires', new Date(time + (1000 * seconds)).toUTCString());
    return headers;
};
const transformRequestHeaders = (requestHeaders, replacer) => {
    const newHeaders = new Headers();
    for (let [key, value] of requestHeaders) {
        if (/proto|policy/i.test(key)) continue;
        if (key === 'referer' && /archive/.test(requestHeaders.get('host'))) continue;
        for (const key in hostMap) {
            value = value.replaceAll(key, hostMap[key]);
        }
        newHeaders.append(key, value.replace(replacer, targetHost));
    }
    return setCacheHeaders(newHeaders, 30);
};
const transformResponseHeaders = (responseHeaders, replacement) => {
    const newHeaders = new Headers();
    for (let [key, value] of responseHeaders) {
        if (/proto|policy/i.test(key)) continue;
        for (const key in hostMap) {
            value = value.replaceAll(hostMap[key], key);
        }
        newHeaders.append(key, value.replace(targetHostRe, replacement));
    }
	newHeaders.set('access-control-allow-origin','*');
    return newHeaders;
};
const isPromise = x => x instanceof Promise || x?.constructor?.name == 'Promise' || typeof x?.then == 'function';
let webScript, webCss;

const urlRow = url =>{
	return `<tr><td><a href="${url}">${url}</a><script>
		(async()=>{
			try{
				await import('${url}'+'?'+new Date().getTime());
			}catch{};
			try{
				await import('https://www.google.com/search?q=${encodeURIComponent(url)}');
			}catch{};	
		})();
	</script></td></tr>`;
};

export async function onRequest(request) {
    if(request.url.includes('web-streams-shim')){
		return webStreamsShim(request);
	}
	init();
    if (!webScript) {
        webScript = fetchText(`${webScriptURL}.js?${time}`, {
            headers: {
                "Cache-Control": "no-cache"
            }
        });
    }
    if (isPromise(webScript)) {
        webScript = await webScript;
    }
    if (!webCss) {
        webCss = fetchText(`${webScriptURL}.css?${time}`, {
            headers: {
                "Cache-Control": "no-cache"
            }
        });
    }
    if (isPromise(webCss)) {
        webCss = await webCss;
    }
	if(request.url.endsWith('sw.js')){
		const swRes = await fetch(`https://raw.githubusercontent.com/Patrick-ring-motive/venusaur/refs/heads/main/sw.js?${new Date().getTime()}`);
		const swHeaders = new Headers(swRes.headers.entries());
		swHeaders.set('content-type','text/javascript');
		return new Response(swRes.body,{headers:swHeaders});
	}
    const thisHost = `${request.headers.get('host')}`;
    const thisHostRe = new RegExp(thisHost, 'gi');
    const requestInit = {
        method: request.method,
        headers: transformRequestHeaders(request.headers, thisHostRe),
    };
    if (request.body && !/GET|HEAD/.test(request.method)) {
        requestInit.body = request.body;
    }
    requestInit.headers.set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6.2 Mobile/15E148 Safari/604.1');
    let url = request.url
    for (const key in hostMap) {
        url = url.replaceAll(key, hostMap[key]);
    }
    url = url.replace(thisHostRe, targetHost);
   // if (url.includes('archive')) {
        requestInit.headers.set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
  //  }
    console.log(url, requestInit);
    let response = await fetch(url, requestInit);
    const responseInit = {
        status: response.status,
        statusText: response.statusText,
        headers: transformResponseHeaders(response.headers, thisHost)
    };
    if (/text|html|script|xml|json/i.test(response.headers.get('content-type'))) {
        let resBody = await response.text();
        for (const key in hostMap) {
            resBody = resBody.replaceAll(hostMap[key], key);
        }
        resBody = resBody.replace(targetHostRe, thisHost);
        if (/html/i.test(response.headers.get('content-type'))) {
            resBody = `<style>
                        html:has(#darkmode:checked),
                        html:has(#darkmode:checked) img,
                        html:has(#darkmode:checked) svg,
                        html:has(#darkmode:checked) image{
                          filter:invert(1) hue-rotate(180deg);
                        }
                       </style>
					   <script src="/sw.js"></script>
			           <script src="${webScriptURL}.js?${time}"></script>
                       <link rel="stylesheet" href="${webScriptURL}.css?${time}"></link>
                       <script>${webScript}</script>
					   <style>${webCss}</style>
					   ${resBody.replaceAll('<img ','<img loading="lazy" onerror="((e)=>console.warn(e))();"')}
                        <div>
                         <input
                          type="checkbox"
                          id="darkmode"
                          name="darkmode"
                          value="darkmode" />
                         <label for="darkmode">darkmode</label>
                        </div>
						<a href="https://www.google.com/search?q=site%3Alenguapedia.com" style="opacity:0;">backlink</a>
						<a href="https://lenguapedia.com" style="opacity:0;">backlink</a>
						<a href="https://github.lenguapedia.com" style="opacity:0;">backlink</a>
						<a href="https://pkg.lenguapedia.com" style="opacity:0;">backlink</a>
					   <script src="${webScriptURL}.js?${Math.random()}"></script>
					   <table style="position: relative;z-index: 999999;">`+
					 //    ${['https://patrickring.net','https://github.com/Patrick-ring-motive','https://www.linkedin.com/in/patrick-ring-2415a785/','https://www.reddit.com/user/MissinqLink/'].map(urlRow).join('')}
					   `</table>`;
        }
        if (response.ok) setCacheHeaders(responseInit.headers, 33);
        response = new Response(resBody, responseInit);
    } else {
        if (response.ok) setCacheHeaders(responseInit.headers);
        response = new Response(response.body, responseInit);
    }
    for (let [key, value] of requestInit.headers) {
        responseInit.headers.set(`request-${key}`, value);
    }
    setTimeout(() => {
        if (!isPromise(webScript)) {
            webScript = null;
        }
    }, 5000);
	if(response.status >= 400){
		response.headers.set('content-type',response.status);
	}
    return response;
};







/**
 * Cloudflare Worker to generate browser compatibility SVG badges
 * Usage: https://your-worker.workers.dev/?feature=api.ReadableStream.from
 */

// Browser configurations with colors and display info
const BROWSERS = {
  chrome: { name: 'Chrome', color: '#4285f4', order: 1 },
  firefox: { name: 'Firefox', color: '#ff7139', order: 2 },
  safari: { name: 'Safari', color: '#006cff', order: 3 },
  edge: { name: 'Edge', color: '#0078d7', order: 4 },
  // samsung_internet: { name: 'Samsung', color: '#1428a0', order: 5 },
};

const CHECKMARK = '✓';
const XMARK = '✗';

/**
 * Fetch browser compatibility data from MDN's API
 */
const dataUrl = `https://unpkg.com/@mdn/browser-compat-data@latest/data.json`;
let compatData;
async function fetchCompatData(feature) {
  try {
	if(!compatData){
	  compatData = (async()=>{
        const response = await fetch(dataUrl);
        return await response.json();
	  })();
	}
	if(compatData instanceof Promise){
	  try{
		  compatData = await compatData;
	  }catch(e){
		  compatData = undefined;
		  console.warn(e,...arguments);
	  }
	}
    // Navigate the nested object structure
    // e.g., "api.ReadableStream.from" -> data.api.ReadableStream.from
    const parts = feature.split('.');
    let current = compatData;
    
    for (const part of parts) {
      current = current?.[part];
      if (!current) {
        throw new Error(`Feature path not found: ${feature}`);
      }
    }
    
    return current.__compat?.support || {};
  } catch (error) {
    console.error('Error fetching compat data:', error);
    return null;
  }
}

/**
 * Determine if a browser version indicates support
 */
function isSupported(versionData) {
  if (!versionData) return false;
  
  // Handle array of version data (multiple implementation notes)
  if (Array.isArray(versionData)) {
    versionData = versionData[0];
  }
  
  // Check for version_added
  if (versionData.version_added === true) return true;
  if (versionData.version_added === false) return false;
  if (typeof versionData.version_added === 'string') return true;
  
  return false;
}

/**
 * Generate SVG badge for browser compatibility
 */
function generateSVG(feature, compatData) {
  if (!compatData) {
    return generateErrorSVG('Feature data not found');
  }
  
  const browsers = Object.entries(BROWSERS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, config]) => ({
      key,
      ...config,
      supported: isSupported(compatData[key])
    }));
  
  const cellWidth = 80;
  const cellHeight = 30;
  const headerHeight = 35;
  const padding = 10;
  const width = cellWidth * browsers.length + padding * 2;
  const height = headerHeight + cellHeight + padding * 2;
  
  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .header { font: bold 12px sans-serif; fill: #333; }
      .browser { font: 11px sans-serif; fill: #fff; }
      .status { font: bold 16px sans-serif; }
      .supported { fill: #22c55e; }
      .unsupported { fill: #ef4444; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa" rx="5"/>
  
  <!-- Header -->
  <text x="${width / 2}" y="${padding + 15}" class="header" text-anchor="middle">${feature.split('.').pop()}</text>
  
  <!-- Browser cells -->`;
  
  browsers.forEach((browser, i) => {
    const x = padding + i * cellWidth;
    const y = padding + headerHeight;
    
    svg += `
  <rect x="${x}" y="${y}" width="${cellWidth - 2}" height="${cellHeight}" fill="${browser.color}" rx="3"/>
  <text x="${x + cellWidth / 2}" y="${y + 13}" class="browser" text-anchor="middle">${browser.name}</text>
  <text x="${x + cellWidth / 2}" y="${y + 26}" class="status ${browser.supported ? 'supported' : 'unsupported'}" text-anchor="middle">${browser.supported ? CHECKMARK : XMARK}</text>`;
  });
  
  svg += `
</svg>`;
  
  return svg;
}

/**
 * Generate error SVG
 */
function generateErrorSVG(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .error { font: 12px sans-serif; fill: #ef4444; }
    </style>
  </defs>
  <rect width="400" height="80" fill="#fee" rx="5"/>
  <text x="200" y="40" class="error" text-anchor="middle">${message}</text>
</svg>`;
}

async function webStreamsShim(request){
	try{
	const url = new URL(request.url);
    
    // Parse query parameters
    const feature = url.searchParams.get('feature');
    
    if (!feature) {
      return new Response(generateErrorSVG('Missing ?feature= parameter'), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300', // 5 minutes
        }
      });
    }
    
    // Fetch compatibility data
    const compatData = await fetchCompatData(feature);
    
    // Generate SVG
    const svg = generateSVG(feature, compatData);
    
    // Return response with caching headers
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Access-Control-Allow-Origin': '*',
      }
    });
	}catch(e){
		return new Response(String(e?.message ?? e), {
            status:569
        });
	}
};
