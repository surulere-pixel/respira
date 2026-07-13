/* respira — shared chrome: PWA install, share, unified header, and footer.
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
    _toast(ios ? 'tap share, then "add to home screen"' : 'use your browser menu → install app');
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

  /* ── unified dark mocha header ── */
  function injectHeader(){
    if(D.getElementById('door')) return;
    if(D.getElementById('respira-header')) return;

    var st = D.createElement('style');
    st.id = 'respira-header-style';
    st.textContent =
      '#respira-header{position:sticky;top:0;z-index:200;background:linear-gradient(180deg,#2a1f18,#221a12);display:flex;align-items:center;justify-content:center;padding:0 clamp(14px,3vw,28px);height:48px;box-shadow:0 4px 16px rgba(30,20,12,.15);}'
      + '#respira-header .rh-brand{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;font-size:1.6rem;color:#f0e4cf;text-decoration:none;letter-spacing:.01em;}'
      + '#respira-header .rh-brand em{font-style:italic;color:#c9a36a;}'
      + '#respira-header .rh-beta{font-family:"IBM Plex Mono",monospace;font-size:6.5px;letter-spacing:.14em;text-transform:uppercase;color:#c9a36a;vertical-align:super;margin-left:4px;opacity:.9;}'
      + '#respira-header .rh-right{position:absolute;right:clamp(14px,3vw,28px);top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:8px;}'
      + '#respira-header .rh-pill{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:.12em;text-transform:lowercase;color:rgba(240,228,207,.82);background:rgba(255,250,242,.05);border:1px solid rgba(201,163,106,.32);border-radius:999px;padding:7px 16px;cursor:pointer;text-decoration:none;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;}'
      + '#respira-header .rh-pill:hover{background:rgba(201,163,106,.16);border-color:rgba(201,163,106,.62);color:#f7efdd;}'
      + '#respira-header .rh-pill.rh-gold{background:rgba(201,163,106,.92);border-color:rgba(201,163,106,.92);color:#241a13;}'
      + '#respira-header .rh-pill.rh-gold:hover{background:#dcb87c;border-color:#dcb87c;color:#241a13;}'
      + '#respira-header .rh-caret{font-size:8px;opacity:.8;}'
      + '#respira-header .rh-menu{position:absolute;top:calc(100% + 8px);right:0;z-index:210;background:linear-gradient(180deg,#302419,#241a12);border:1px solid rgba(201,163,106,.28);border-radius:14px;padding:7px;min-width:172px;box-shadow:0 22px 54px rgba(18,11,5,.55);display:flex;flex-direction:column;gap:2px;}'
      + '#respira-header .rh-menu[hidden]{display:none;}'
      + '#respira-header .rh-menu a{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:lowercase;color:rgba(240,228,207,.82);text-decoration:none;padding:10px 14px;border-radius:9px;transition:background .13s,color .13s;}'
      + '#respira-header .rh-menu a:hover{background:rgba(201,163,106,.15);color:#f7efdd;}'
      + '@media(max-width:640px){#respira-header{justify-content:space-between;padding:0 12px;height:44px;}#respira-header .rh-brand{font-size:1.2rem;}#respira-header .rh-beta{display:none;}#respira-header .rh-right{position:static;transform:none;gap:5px;}#respira-header .rh-pill{font-size:8px;padding:5px 10px;}}';
    D.head.appendChild(st);

    var h = D.createElement('header');
    h.id = 'respira-header';
    h.innerHTML =
      '<a href="/" class="rh-brand">res<em>pira</em><sup class="rh-beta">beta v2</sup></a>'
      + '<div class="rh-right">'
      +   '<div id="rh-wrap" style="position:relative;display:inline-flex;">'
      +     '<button id="rhBtn" class="rh-pill rh-gold" onclick="rhToggle()" aria-haspopup="true" aria-expanded="false">rooms <span class="rh-caret">&#9662;</span></button>'
      +     '<div id="rhMenu" class="rh-menu" hidden>'
      +       _rhLink('/','breathe') + _rhLink('/#flow','flow') + _rhLink('/radio','radio') + _rhLink('/voices','voices') + _rhLink('/shelf','shelf') + _rhLink('/studio','studio') + _rhLink('/about','about') + _rhLink('/support','give')
      +     '</div>'
      +   '</div>'
      +   '<button class="rh-pill" onclick="respiraInstall()" aria-label="install respira">&#8681; install</button>'
      +   '<button class="rh-pill" onclick="respiraChromeShare()" aria-label="share respira">&#8599; share</button>'
      + '</div>';

    var old = D.querySelectorAll('.nav, .topbar');
    for(var i=0;i<old.length;i++) old[i].style.display = 'none';

    var hasRail = D.querySelector('.rail, .st-rail');
    if(hasRail){
      h.style.position = 'fixed';
      h.style.left = '0';
      h.style.right = '0';
      var s = D.createElement('style');
      s.textContent = '#respira-header~.rail,#respira-header~*>.rail,#respira-header~.st-rail,#respira-header~*>.st-rail{top:48px!important;}body{padding-top:48px!important;}@media(max-width:820px){#respira-header~.rail,#respira-header~*>.rail,#respira-header~.st-rail,#respira-header~*>.st-rail{top:auto!important;bottom:0!important;}}';
      D.head.appendChild(s);
    }

    D.body.insertBefore(h, D.body.firstChild);
  }

  function _rhLink(href,label){ return '<a href="'+href+'">'+label+'</a>'; }

  window.rhToggle = function(){
    var m = D.getElementById('rhMenu'), b = D.getElementById('rhBtn');
    if(!m||!b) return;
    if(m.hasAttribute('hidden')){ m.removeAttribute('hidden'); b.setAttribute('aria-expanded','true'); }
    else { m.setAttribute('hidden',''); b.setAttribute('aria-expanded','false'); }
  };
  D.addEventListener('click', function(e){ if(!(e.target.closest && e.target.closest('#rh-wrap'))){ var m=D.getElementById('rhMenu'),b=D.getElementById('rhBtn'); if(m&&!m.hasAttribute('hidden')){m.setAttribute('hidden','');if(b)b.setAttribute('aria-expanded','false');} } });
  D.addEventListener('keydown', function(e){ if(e.key==='Escape'){ var m=D.getElementById('rhMenu'),b=D.getElementById('rhBtn'); if(m&&!m.hasAttribute('hidden')){m.setAttribute('hidden','');if(b)b.setAttribute('aria-expanded','false');} } });

  /* ── footer — only if the page has none ── */
  function injectFooter(){
    if(D.querySelector('#respira-footer, footer, .site-footer, .rail, .st-rail, #door')) return;
    var fpill = 'font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:.1em;text-transform:lowercase;color:rgba(240,228,207,.78);background:none;border:1px solid rgba(201,163,106,.3);border-radius:999px;padding:7px 14px;cursor:pointer;text-decoration:none;transition:all .15s;white-space:nowrap;';
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
      +    '<button onclick="respiraInstall()" style="'+fpill+'">&#8681; install</button>'
      +    '<button onclick="respiraChromeShare()" style="'+fpill+'">&#8599; share</button>'
      +    '<a href="/support" style="'+fpill+'">give</a>'
      +  '</div>'
      + '</div>'
      + '<p style="max-width:1140px;margin:16px auto 0;font-family:\'IBM Plex Mono\',monospace;font-size:8.5px;letter-spacing:.05em;line-height:1.8;color:rgba(240,228,207,.5);text-transform:lowercase;">by <a href="https://www.wearehappysunday.org" target="_blank" rel="noopener" style="color:rgba(201,163,106,.85);text-decoration:none;">happy sunday</a> — the everyday-wellbeing collective of the <a href="https://www.thebirthrightproject.org" target="_blank" rel="noopener" style="color:rgba(201,163,106,.85);text-decoration:none;">birthright project</a>, building economic dignity across culture, care &amp; finance.</p>';
    D.body.appendChild(f);
  }

  function init(){
    injectHeader();
    injectFooter();
  }
  if(D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
