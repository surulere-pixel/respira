/* respira — shared chrome: PWA install, share, and a footer for pages that lack one.
   include on every page:  <script src="/chrome.js" defer></script>  */
(function(){
  if(window.__respiraChrome) return; window.__respiraChrome = true;
  var D = document;

  /* ── PWA: manifest + service worker + install ── */
  if(!D.querySelector('link[rel="manifest"]')){
    var lm = D.createElement('link'); lm.rel = 'manifest'; lm.href = '/manifest.json'; D.head.appendChild(lm);
  }
  if(!D.querySelector('meta[name="theme-color"]')){
    var tc = D.createElement('meta'); tc.name = 'theme-color'; tc.content = '#2a1f18'; D.head.appendChild(tc);
  }
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
  }
  var _prompt = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); _prompt = e; D.documentElement.classList.add('can-install'); });
  window.respiraInstall = function(){
    if(_prompt){ _prompt.prompt(); _prompt.userChoice.finally(function(){ _prompt = null; }); return; }
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    _toast(ios ? 'tap share, then “add to home screen”' : 'use your browser menu → install app');
  };

  /* ── share ── */
  window.respiraChromeShare = function(){
    var d = { title:'respira', text:'a breathing room, wherever you are.', url:(location.origin || 'https://openrespira.org') };
    if(navigator.share){ navigator.share(d).catch(function(){}); return; }
    if(navigator.clipboard){ navigator.clipboard.writeText(d.url).then(function(){ _toast('link copied — pass it on'); }).catch(function(){ _toast(d.url); }); return; }
    _toast(d.url);
  };

  function _toast(msg){
    var t = D.getElementById('rc-toast');
    if(!t){ t = D.createElement('div'); t.id = 'rc-toast';
      t.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:#2a1f18;color:rgba(201,163,106,.95);font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.06em;padding:12px 20px;border-radius:999px;z-index:100000;transition:all .3s;';
      D.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)';
    clearTimeout(window.__rcT); window.__rcT = setTimeout(function(){ t.style.opacity = '0'; t.style.transform = 'translate(-50%,20px)'; }, 2600);
  }

  /* ── footer (respira · by happy sunday / birthright) — only if the page has none ── */
  function injectFooter(){
    // skip pages that already have a footer, and app-shell pages (rooms/studio)
    // whose fixed rail + view-switching layout makes an appended footer float awkwardly —
    // those carry their own rail navigation instead.
    if(D.querySelector('#respira-footer, footer, .site-footer, .rail, .st-rail, #door')) return;
    var pill = 'font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:.1em;text-transform:lowercase;color:rgba(240,228,207,.78);background:none;border:1px solid rgba(201,163,106,.3);border-radius:999px;padding:7px 14px;cursor:pointer;text-decoration:none;transition:all .15s;white-space:nowrap;';
    function link(href,label){ return '<a href="'+href+'" style="font-family:\'IBM Plex Mono\',monospace;font-size:10px;letter-spacing:.1em;text-transform:lowercase;color:rgba(240,228,207,.7);text-decoration:none;white-space:nowrap;">'+label+'</a>'; }
    var f = D.createElement('footer'); f.id = 'respira-footer';
    f.style.cssText = 'background:linear-gradient(180deg,#241a13,#150e07);color:rgba(240,228,207,.7);padding:24px clamp(18px,5vw,44px);border-top:1px solid rgba(201,163,106,.16);position:relative;z-index:40;';
    f.innerHTML =
      '<div style="max-width:1140px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:14px 30px;justify-content:space-between;">'
      +  '<a href="/" style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:1.4rem;color:#f0e4cf;text-decoration:none;flex:none;">res<em style="font-style:italic;color:#c9a36a;">pira</em></a>'
      +  '<nav style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 20px;">'
      +    link('/','breathe') + link('/radio','radio') + link('/voices','voices') + link('/shelf','shelf') + link('/studio','studio') + link('/about','about')
      +  '</nav>'
      +  '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">'
      +    '<button onclick="respiraInstall()" style="'+pill+'">&#8681; install</button>'
      +    '<button onclick="respiraChromeShare()" style="'+pill+'">&#8599; share</button>'
      +    '<a href="/support" style="'+pill+'">give</a>'
      +  '</div>'
      + '</div>'
      + '<p style="max-width:1140px;margin:16px auto 0;font-family:\'IBM Plex Mono\',monospace;font-size:8.5px;letter-spacing:.05em;line-height:1.8;color:rgba(240,228,207,.5);text-transform:lowercase;">by <a href="https://www.wearehappysunday.org" target="_blank" rel="noopener" style="color:rgba(201,163,106,.85);text-decoration:none;">happy sunday</a> — the everyday-wellbeing collective of the <a href="https://www.thebirthrightproject.org" target="_blank" rel="noopener" style="color:rgba(201,163,106,.85);text-decoration:none;">birthright project</a>, building economic dignity across culture, care &amp; finance.</p>';
    D.body.appendChild(f);
  }
  if(D.readyState === 'loading') D.addEventListener('DOMContentLoaded', injectFooter); else injectFooter();
})();
