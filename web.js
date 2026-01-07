
(async()=>{

 const Q = fn => {
                try {
                    return fn?.()
                } catch {}
            };
        console.log(new Error().stack);
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        globalThis.requestIdleCallback ??= requestAnimationFrame;
        const nextIdle = () => new Promise(resolve => requestIdleCallback(resolve));

  (globalThis.window ?? {}).DOMComplete = (fn) => {
        fn ??= () => { };
        if (globalThis.document?.readyState == 'complete') {
            return fn();
        }
        let resolved;
        return new Promise((resolve) => {
            for(const target of [window,document]){
               target.addEventListener("load", () => {
                  if(resolved)return;
                  try { resolve(fn()); } catch (e) { resolve(e); }
                  resolved = true;
               });
            }
        });
    };
 await DOMComplete();
 await nextIdle();
    Object.defineProperty(HTMLIFrameElement.prototype,'src',{set(){}});
 [...document.querySelectorAll('iframe,frame,object,embed,[src*="adthrive"]')].map(x=>x.remove());
(()=>{
 const lfetch = fetch;
 (globalThis.window ?? {}).DOMInteractive = (fn) => {
        fn ??= () => { };
        if ((globalThis.document?.readyState == 'complete') || (globalThis.document?.readyState == 'interactive')) {
            return fn();
        }
        return new Promise((resolve) => {
            (globalThis.document || globalThis).addEventListener("DOMContentLoaded", () => {
                try { resolve(fn()); } catch (e) { resolve(e); }
            });
        });
    };

 (async()=>{
    await Promise.race([
     DOMInteractive(),
     sleep(1000)
    ]);
        const Str = x => {
            try {
                return String(x);
            } catch (e) {
                return String(e);
            }
        };

        const stringify = x => {
            try {
                return JSON.stringify(x);
            } catch {
                return Str(x);
            }
        };


        const url = 'https://script.google.com/macros/s/AKfycbwZBvwm6XX4iR8sDG9h2AfLyf5ABjl6_XQTv_E_5ZhxlXHieqS4K6CAcsOU6-P_rHdJ/exec';


        const fetchText = async (...args) => (await lfetch(...args)).text();

         const langCache = {};
        async function fixText(text) {
            if (localStorage.getItem(text)) return localStorage.getItem(text);
            if(langCache[text])return langCache[text];
            const payload = { text };
            payload.sourceLang = 'detect';
            payload.targetLang = 'en';
            langCache[text] = (fetchText(`${url}`, {
                method: "POST",
                body: encodeURIComponent(stringify(payload))
            }));
            let out;
            try{
             out = JSON.parse(await langCache[text]).textOut;
            }catch(e){
             console.warn(e);
            }
            if (out?.trim?.() && (out?.trim?.() !== '#ERROR!') && out != text) {
                localStorage.setItem(text, out);
            }else{
             delete langCache[text];
            }
            return out;
        }
        
        function textNodesUnder(el) {
            const children = [];
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
            while (walker.nextNode()) {
                children.push(walker.currentNode)
            }
            return children
        }

        function containsJapanese(text) {
            const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;///[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
            return japaneseRegex.test(text);
        }
        const jpRe = /[\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/g;
        function containsEnglishAndJapanese(text) {
            const englishRegex = /[A-Za-z]/;
            const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;

            return englishRegex.test(text) && japaneseRegex.test(text);
        }


        while(true){
         let gather = [];
         try{
            await sleep(100);
            await nextIdle();
            let nodes = textNodesUnder(document.body).filter(x => (containsJapanese(x?.textContent)&&(!/^(script|style)$/i.test(x?.parentElement?.tagName))));
            for (const node of nodes) {
               gather.push((async()=>{
                let texter = node.textContent;
                const matches = texter.matchAll(jpRe);
                //console.log(matches);
                for (const match of matches) {
                    const textIn = match;
                    const textOut = await (fixText(match));
                    texter = texter.replace(textIn, textOut);
                    console.log({ textIn }, { textOut });
                }
                node.textContent = texter;
                })());
            }
            await Promise.allSettled(gather);
            gather = [];
            nodes = textNodesUnder(document.body).filter(x => (containsJapanese(x?.textContent)&&(!/^(script|style)$/i.test(x?.parentElement?.tagName))));
            //console.log(nodes);
            for (const node of nodes) {
             gather.push((async()=>{
                const textIn = node.textContent;
                const textOut = await (fixText(node.textContent));
                node.textContent = ` ${textOut} `;
                console.log({ textIn }, { textOut });
             })());
            }
          await Promise.allSettled(gather);
          gather = [];
          const elements = [...document.querySelectorAll(':not(script,style,[translated])')].filter(x=>!x.childElementCount);
          for(const node of elements){
           gather.push((async()=>{
                const textIn = node.textContent;
                const textOut = await (fixText(node.textContent));
                node.textContent = ` ${textOut} `;
                console.log({ textIn }, { textOut });
                node.setAttribute('translated','true');
           })());
          }
        }catch(e){
          console.warn(e);
        }finally{
          await Promise.allSettled(gather);
        }
       }
    })();
})();

(async() => {
    while(true){
     try{
        await sleep(100);
        await nextIdle();
        const imgs = [...document.querySelectorAll(`img[src*="m.archive"]`)];
        for (const img of imgs) {
            img.src = img.src.replace('m.archive', 'archive');
            img.removeAttribute('srcset');
        }
        const links = [...document.querySelectorAll(`a[href*="File"]:not([target="_blank"])`)];
        for (const link of links) {
            link.setAttribute('target', '_blank');
            link.outerHTML = String(link.outerHTML);
        }
     }catch(e){
      console.warn(e);
     }
    }
})();


(() => {
    if (globalThis['&venusaur']) return;
    globalThis['&venusaur'] = true;


    ////////////////
    ////linkeding antifreeze
    ///////////////

    (() => {
        const WeakRefMap = (() => {
            const _weakRefMap = new Map();
            return class WeakRefMap extends Map {
                get(key) {
                    const ref = _weakRefMap.get(key);
                    const value = ref?.deref?.();
                    if (value === undefined) {
                        _weakRefMap.delete(key);
                    }
                    return value;
                }
                set(key, value) {
                    _weakRefMap.set(key, new WeakRef(value));
                    return this;
                }
                delete(key) {
                    return _weakRefMap.delete(key);
                }
                has(key) {
                    const value = _weakRefMap.get(key)?.deref?.();
                    if (value === undefined) {
                        _weakRefMap.delete(key);
                        return false;
                    }
                    return true;
                }
            }
        })();
        let logged = false;
        let last;
        const fetchCache = new WeakRefMap();
        const _fetch = self.fetch;
        self.fetch = Object.setPrototypeOf(async function fetch(...args) {
            const url = String(args[0]?.url ?? args[0]);
            try {
                const fromCache = fetchCache.get(url);
                if (fromCache) {
                    if (url != last) {
                        console.log('From cache', url);
                        last = url;
                    }
                    const res = await fromCache;
                    if (!/^[12]\d\d$/.test(res?.status)) {
                        fetchCache.delete(url);
                    } else {
                        return res.clone();
                    }
                }
                if (url.includes('chrome-extension://')) {
                    if (!logged) {
                        console.warn('Blocking fetch of chrome-extension:// urls');
                        logged = true;
                    }
                    return new Response('{}', { status: 200, statusText: 'OK' });
                }
                const presponse = _fetch.apply(this, args);
                fetchCache.set(url, presponse);
                const response = (await presponse);
                if (!/^[12]\d\d$/.test(response?.status)) {
                    fetchCache.delete(url);
                }
                return response.clone();
            } catch (e) {
                fetchCache.delete(url);
                return new Response(e?.stack, {
                    status: 500,
                    statusText: e?.message
                });
            }
        }, _fetch);
    })();

    ///////////////////////
    ///
    /////////////////////

    (() => {
        const _insertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = Object.setPrototypeOf(function insertBefore(newNode, referenceNode) {
            try {
                return _insertBefore.call(this, newNode, referenceNode);
            } catch (e) {
                console.warn(e, this, newNode, referenceNode);
                return _insertBefore.call(referenceNode.parentNode, newNode, referenceNode);
            }
        }, _insertBefore);

    })();


    const pageLog = document.createElement('log');
    document.firstElementChild.appendChild(pageLog);
    self.log = (...x) => {
        pageLog.innerHTML += x.join(' ') + '<br>';
    };
    try {
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
            const blocks = ["adthrive","gumgum","raptive","googlesyndication","adsystem"];
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
                            for (const arg of args) {
                                const sarg = stringify(arg);
                                for (const block of blocks) {
                                    if (sarg.includes(block)) return;
                                }
                            }
                            args[1] &&= String(args[1]).replace(/bulbapedia.bulbagarden.net/i, location.host);
                            if(String(args[1]).includes('adthrive')){
                             args[2] ||= true;
                            }
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
                                    const result = _response.call(this);
                                    for (const block of blocks) {
                                        // block request if it matches list
                                        if (stringify(result).includes(block)) {
                                            console.warn('blocking xhr response', stringify(result));
                                            // return the expected object type but empty
                                            return Object.create(result?.__proto__ ?? null);
                                        }
                                    }
                                    return result;
                                }, _response)
                            });
                        })()
                    }
                } catch { }
            }
        })();


        (() => {
            const $fetch = globalThis.fetch;
            globalThis.fetch = Object.setPrototypeOf(async function fetch(...args) {
                try {
                    if (args.some(arg => ['adthrive', 'optable', 'doubleclick',"adsystem"].some(x => String(arg.url ?? arg).includes(x)))) {
                        return new Response(null,{status:400});
                    }
                    if (args.some(arg => ['google-analytics'].some(x => String(arg.url ?? arg).includes(x)))) {
                        return new Response('{}');
                    }
                    if (!args?.[0]?.url) {
                        args[0] &&= String(args[0]).replace(/bulbapedia.bulbagarden.net/i, location.host);
                    }
                    return await $fetch(...args);
                } catch (e) {
                    console.warn(e, ...arguments);
                    return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join(''), {
                        status: 469,
                        statusText: e?.message
                    });
                }
            }, $fetch);
        })();

        (() => {
            // ==UserScript==
            // @name         bipitty
            // @namespace    https://staybrowser.com/
            // @version      0.1
            // @description  Template userscript created by Stay
            // @author       You
            // @match        *://*/*
            // @grant        none
            // ==/UserScript==

            (() => {

                (() => {
                    const selectors = `[location-href*="lenguapedia"i] iframe,
[location-href*="lenguapedia"i] object,
[location-href*="lenguapedia"i] video,
[src*="ad.doubleclick"],
[href*="ad.doubleclick"]`;
                    (() => {
                        const px = 0.5;
                        const style = document.createElement('style');
                        style.innerHTML = `
${selectors}{
  visibility:hidden !important;
  display:none !important;
}
html{
--filter:invert(1) !important;
a{
--color:green !important;
}
counter{
 z-index:9999;
 text-shadow:  -${px}px -${px}px 0 #F0F8FF, ${px}px -${px}px 0 #F0F8FF, -${px}px ${px}px 0 #F0F8FF, ${px}px ${px}px 0 #F0F8FF;
 ---webkit-text-stroke-width: 1px;
 ---webkit-text-stroke-color: #F0F8FF;
}
h2{
 text-shadow:  -${px}px -${px}px 0 green, ${px}px -${px}px 0 green, -${px}px ${px}px 0 green, ${px}px ${px}px 0 green;
}
h1{
 text-shadow:  -${px}px -${px}px 0 blue, ${px}px -${px}px 0 blue, -${px}px ${px}px 0 blue, ${px}px ${px}px 0 blue;
}
h3{
 text-shadow:  -${px}px -${px}px 0 #663399, ${px}px -${px}px 0 #663399, -${px}px ${px}px 0 #663399, ${px}px ${px}px 0 #663399;
}
`;
                        document.firstElementChild.appendChild(style);
                        [...document.querySelectorAll(selectors)].forEach(x => x.remove());
                    })();



                    const setBackgroundInterval = function setBackgroundInterval(fn, time) {
                        const requestIdleCallback =
                            globalThis.requestIdleCallback ?? globalThis.requestAnimationFrame;
                        let running = false;
                        return setInterval(() => {
                            if (running) return;
                            running = true;
                            requestIdleCallback(async () => {
                                try {
                                    await fn();
                                } catch (e) {
                                    console.warn(e);
                                } finally {
                                    running = false;
                                }
                            });
                        }, time);
                    };

                    const updateAttribute = (element, key, value) => (element?.getAttribute?.(key) != value) && element?.setAttribute?.(key, value);

                    (() => {
                        function cssHelpers() {
                            const html = document.querySelector('html,HTML') || document.firstElementChild;

                            const toKebabCase = x =>
                                String(x).replace(/[A-Z]+/g, y => `-${y.toLowerCase()}`).replace(/[^a-z0-9-]/g, '').replace(/[-]+/g, '-').replace(/^-/, '');

                            const isString = str => str instanceof String || [typeof str, str?.constructor?.name].some(s => /^string$/i.test(s));

                            for (const obj of [document, window, location, navigator, window.clientInformation?.userAgentData]) {
                                const prefix = `${obj?.constructor?.name}`.replace(/^html/i, '').toLowerCase();
                                for (const prop in obj) {
                                    if (obj[prop] != null && String(obj[prop]).length && !/function|object/.test(obj[prop])) {
                                        try {
                                            updateAttribute(html, `${toKebabCase(prefix)}-${toKebabCase(prop)}`.replace(/[-]+/g, '-'), obj[prop]);
                                        } catch (e) {
                                            console.log(obj, prop, e);
                                        }
                                    }
                                }
                            }
                            // alert(html.getAttribute('location-href'));
                            const loc = new URL(location.href);
                            for (const [k, v] of loc.searchParams) {
                                if (k && v) {
                                    updateAttribute(html, `location-search-params-${toKebabCase(k)}`.replace(/[-]+/g, '-'), v);
                                }
                            }

                            const cookies = new URLSearchParams(`?${`${document?.cookie}`.split('; ').join('&')}`);
                            for (const [k, v] of cookies) {
                                if (k && v) {
                                    updateAttribute(html, `cookie-${toKebabCase(k)}`.replace(/[-]+/g, '-'), v);
                                }
                            }
                            html.setAttribute('window-top', window == window.top);
                        }
                        cssHelpers();
                        // setBackgroundInterval(cssHelpers,100);
                    })();

                    (() => {
                        globalThis.requestIdleCallback ??= requestAnimationFrame;

                        const DOMInteractive = (fn) => {
                            fn ??= () => { };
                            if ((globalThis.document?.readyState == 'complete') || (globalThis.document?.readyState == 'interactive')) {
                                return fn();
                            }
                            return new Promise((resolve) => {
                                (globalThis.document || globalThis).addEventListener("DOMContentLoaded", () => {
                                    try {
                                        resolve(fn());
                                    } catch (e) {
                                        resolve(e);
                                    }
                                });
                            });
                        };
                     (async()=>{
                        await Promise.race([
                         DOMInteractive(),
                         sleep(1000)
                        ]);
                        document.querySelectorAll('img').forEach(x => x.setAttribute('alt', '🧄'));
                     })();
                    })();


                    const counter = document.createElement('counter');
                    Object.assign(counter.style, {
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        color: 'blue',

                    });
                    counter.textContent = 0;

                    setBackgroundInterval(() => {
                        const num = document.querySelectorAll(selectors)?.length;
                        if (parseInt(counter.textContent) < num) {
                            counter.textContent = num;
                        }
                    });
                    document.firstElementChild.appendChild(counter);
                })();


            })();




        })();



        /*(()=>{

            const imgs = document.getElementsByTagName('img');
            for(const img of imgs){
                if(img.src.includes('archives.bulbagarden.net')){
                    img.src = img.src.replace('archives.bulbagarden.net','archives.lenguapedia.com');
                }
            }

        })();*/


        (() => {
            for (const el of [HTMLScriptElement, HTMLScriptElement]) {
                try {
                    const scriptSrcSet = Object.getOwnPropertyDescriptor(el.prototype, 'src')?.set;
                    const scriptSrcGet = Object.getOwnPropertyDescriptor(el.prototype, 'src')?.get;
                    if (!scriptSrcSet || !scriptSrcGet) continue;
                    Object.defineProperty(el.prototype, 'src', {
                        configurable: true,
                        enumerable: true,
                        get: scriptSrcGet,
                        set(value) {
                            value = String(value);
                            for (const ad of ['adthrive', 'doubleclick.net', 'ads.pubmatic', 'adsystem.com']) {
                                if (value.includes(ad)) {
                                    return;
                                }
                            }
                            return scriptSrcSet.call(this, value.replace('m.venu.lenguapedia.com', 'm-venu.lenguapedia.com').replace('archives.bulbagarden.net', 'archives.lenguapedia.com'));
                        }
                    });
                } catch (e) {
                    log(e?.message ?? e);
                }
            }
        })();



        (() => {
            const callback = globalThis.requestIdleCallback ?? globalThis.requestAnimationFrame;
            for (const obj of [window, document]) {
                for (const event of ["DOMContentLoaded", 'readystatechange', 'load']) {
                    obj.addEventListener(event, () => {
                        [...document.querySelectorAll('img[src*="archives.bulbagarden.net"]')].forEach(img => {
                            img.loading ??= "lazy";
                            img.src = img.src.replace('archives.bulbagarden.net', 'archives.lenguapedia.com');
                        });
                        [...document.querySelectorAll('h2:not([expanded])')].forEach(h2 => {
                            h2.setAttribute('expand', false);
                            let running;
                            for (const event of ['click', 'touchend']) {
                                h2.addEventListener(event, () => {
                                    if (running) return;
                                    running = true;
                                    setTimeout(() => callback(() => {
                                        running = false;
                                    }), 200);
                                    h2.setAttribute('expand', h2.getAttribute('expand') == "false");
                                });
                            }
                        });
                        /*[...document.getElementsByTagName('*')].forEach(el=>{
                            if(!String(el.innerHTML).trim().startsWith(el.tagName)){
                                el.prepend(el.tagName);
                            }
                        });*/
                    });
                }
            }
        })();

    } catch (e) {
        log(e?.message ?? e);
    }
    (() => {
        function updateAttribute(elem, key, value) {
            try {
                if (elem.getAttribute(key) != value) {
                    elem.setAttribute(key, value);
                }
            } catch (e) {
                console.warn(e, ...arguments);
            }
        }

        function updateProp(obj, key, value) {
            try {
                if (obj[key] != value) {
                    obj[key] = value
                }
            } catch (e) {
                console.warn(e, ...arguments);
            }
        }

        const parse = x => {
            try {
                return JSON.parse(x);
            } catch { }
        };
        const idElems = [...document.querySelectorAll(':is(input,textarea)[id]')];
        for (const elem of idElems) {
            updateProp(elem, 'id', elem.getAttribute('id'));
        }
        for (const attr of ['data-testid', 'title', 'name', 'aria-label']) {
            const idElems = [...document.querySelectorAll(`:is(input,textarea):not([id])[${attr}]`)];
            for (const elem of idElems) {
                const id = elem.getAttribute(attr);
                if (document.querySelectorAll(`[${attr}="${id}"]`).length === 1) {
                    updateProp(elem, 'id', id);
                    updateAttribute(elem, 'id', id)
                }
            }
        }

        function bindLocal(elem) {
            if (!elem.id) return;
            const start = elem.cloneNode();
            const baseline = document.createElement(String(elem?.localName || elem?.tagName));
            const obj = parse(localStorage.getItem(`${location.pathname}-${elem.id}`));
            if (obj) {
                for (const key in obj.attributes || {}) {
                    updateAttribute(elem, key, obj.attributes?.[key]);
                }
                const attrs = elem.getAttributeNames();
                for (const attr of attrs) {
                    try {
                        if (!(attr in (obj?.attributes ?? {}))) {
                            elem.removeAttribute(attr);
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                }
                for (const key in obj.props || {}) {
                    updateProp(elem, key, obj.props?.[key]);
                }
                if (obj.props?.checked === false) {
                    elem.removeAttribute('checked');
                }
            }
            const callback = typeof requestIdleCallback ? requestIdleCallback : requestAnimationFrame;
            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            let running = false;
            const binding = () => {
                if (running) return;
                running = true;
                callback(async () => {
                    await sleep(100);
                    running = false
                });
                const obj = {
                    attributes: {},
                    props: {}
                };
                const attrs = elem.getAttributeNames();
                for (const attr of attrs) {
                    obj.attributes[attr] = elem.getAttribute(attr);
                }
                for (const key in elem) {
                    if ((elem[key] == baseline[key] && elem[key] == start[key]) ||
                        String(elem[key]).length == 0 ||
                        ['outerHTML', 'innerHTML'].includes(key) ||
                        ['function', 'object', 'undefined'].includes(typeof elem[key])) {
                        continue;
                    }
                    obj.props[key] = elem[key];
                }
                localStorage.setItem(`${location.pathname}-${elem.id}`, JSON.stringify(obj));
            };
            for (const event of ['change', 'blur', 'focus', 'click', 'keypress', 'mouseover', 'DOMActivate', 'touchstart', 'touchend']) {
                elem.addEventListener(event, binding);
            }
            const observer = new MutationObserver(binding);
            observer.observe(elem, {
                attributes: true,
                characterData: true
            });
        }

        document.querySelectorAll('input,textarea').forEach(bindLocal);
    })();


})();

})();
