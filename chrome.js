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
      + '#respira-header .rh-play-btn{margin-left:6px;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:rgba(201,163,106,.92);border:none;color:#241a13;cursor:pointer;transition:transform .15s,background .15s;padding:0;}'
      + '#respira-header .rh-play-btn:hover{background:#dcb87c;transform:scale(1.06);}'
      + '#respira-header .rh-play-btn.is-playing{background:rgba(240,228,207,.16);color:#f0e4cf;box-shadow:0 0 0 2px rgba(201,163,106,.5);animation:rhPulse 2.4s ease-in-out infinite;}'
      + '@keyframes rhPulse{0%,100%{box-shadow:0 0 0 2px rgba(201,163,106,.5);}50%{box-shadow:0 0 0 5px rgba(201,163,106,.25);}}'
      + '#respira-header .rh-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:rgba(255,250,242,.05);border:1px solid rgba(201,163,106,.32);color:rgba(240,228,207,.82);cursor:pointer;padding:0;transition:all .15s;}'
      + '#respira-header .rh-icon-btn svg{display:block;}'
      + '#respira-header .rh-icon-btn:hover{background:rgba(201,163,106,.16);border-color:rgba(201,163,106,.62);color:#f7efdd;}'
      + '#respira-header .rh-nowplaying{position:absolute;right:clamp(58px,10vw,88px);top:calc(100% + 6px);font-family:"IBM Plex Mono",monospace;font-size:8.5px;letter-spacing:.06em;text-transform:lowercase;color:rgba(201,163,106,.72);white-space:nowrap;pointer-events:none;max-width:40vw;overflow:hidden;text-overflow:ellipsis;}'
      + '@media(max-width:640px){#respira-header{justify-content:space-between;padding:0 12px;height:44px;}#respira-header .rh-brand{font-size:1.2rem;}#respira-header .rh-beta{display:none;}#respira-header .rh-right{position:static;transform:none;gap:5px;}#respira-header .rh-pill{font-size:8px;padding:5px 10px;}#respira-header .rh-play-btn,#respira-header .rh-icon-btn{width:26px;height:26px;margin-left:3px;}#respira-header .rh-nowplaying{display:none;}}';
    D.head.appendChild(st);

    var h = D.createElement('header');
    h.id = 'respira-header';
    h.innerHTML =
      '<a href="/" class="rh-brand">res<em>pira</em><sup class="rh-beta">beta v2</sup></a>'
      + '<div class="rh-right">'
      +   '<div id="rh-wrap" style="position:relative;display:inline-flex;">'
      +     '<button id="rhBtn" class="rh-pill rh-gold" onclick="rhToggle()" aria-haspopup="true" aria-expanded="false">visit rooms <span class="rh-caret">&#9662;</span></button>'
      +     '<div id="rhMenu" class="rh-menu" hidden>'
      +       _rhLink('/','breathe') + _rhLink('/#flow','flow') + _rhLink('/radio','radio') + _rhLink('/voices','voices') + _rhLink('/shelf','shelf') + _rhLink('/studio','studio') + _rhLink('/about','about') + _rhLink('/support','give')
      +     '</div>'
      +   '</div>'
      +   '<button class="rh-play-btn" onclick="respiraNavPlay()" aria-label="play respira radio">'+_playIcon()+'</button>'
      +   '<button class="rh-icon-btn" onclick="respiraInstall()" aria-label="install respira" title="install">&#8681;</button>'
      +   '<button class="rh-icon-btn" onclick="respiraChromeShare()" aria-label="share respira" title="share">&#8599;</button>'
      + '</div>'
      + '<span class="rh-nowplaying"></span>';

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

  /* ────────────────────────────────────────────────────────
     universal player — play from nav
     - shuffles drift + groove + whisper as the main pool
     - every 30 min: one dust track as a "pause"
     - every 7 min: signature "breathe in slowly" drops over the transition
     - long crossfade so tracks never gap
     - state persists in localStorage so page-nav resumes near where you left off
     ──────────────────────────────────────────────────────── */
  var NP_KEY = 'respira_navplayer_v1';
  var NP_CROSSFADE = 6;   // seconds
  var NP_SIG_EVERY = 7 * 60 * 1000;
  var NP_DUST_EVERY = 30 * 60 * 1000;
  var NP_TARGET_VOL = 0.6;
  var np = {
    playing: false, a: null, b: null, active: 'a',
    tracks: null, mainQueue: [], dustQueue: [], mainIdx: 0, dustIdx: 0,
    currentTrack: null, lastSigAt: 0, lastDustAt: 0, sessionStartedAt: 0,
    crossfading: false, watchTimer: null, sigAudio: null
  };

  function npLoad(){
    try{
      var raw = localStorage.getItem(NP_KEY); if(!raw) return null;
      var s = JSON.parse(raw); if(!s) return null;
      return s;
    }catch(e){ return null; }
  }
  function npSave(){
    try{
      localStorage.setItem(NP_KEY, JSON.stringify({
        playing: np.playing, lastSigAt: np.lastSigAt, lastDustAt: np.lastDustAt,
        sessionStartedAt: np.sessionStartedAt, ts: Date.now()
      }));
    }catch(e){}
  }

  function npEnsureTracks(cb){
    if(np.tracks){ cb(np.tracks); return; }
    if(window.TRACKS && window.TRACKS.length){ np.tracks = window.TRACKS; cb(np.tracks); return; }
    var s = D.createElement('script'); s.src = '/radio/tracks.js?v=8';
    s.onload = function(){ np.tracks = (window.TRACKS || []); cb(np.tracks); };
    s.onerror = function(){ np.tracks = []; cb([]); };
    D.head.appendChild(s);
  }

  function _shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }

  function npBuildQueues(){
    var main = np.tracks.filter(function(t){ return t.cat==='drift' || t.cat==='groove' || t.cat==='whisper'; });
    var dust = np.tracks.filter(function(t){ return t.cat==='dust'; });
    np.mainQueue = _shuffle(main); np.mainIdx = 0;
    np.dustQueue = _shuffle(dust); np.dustIdx = 0;
  }

  function npNextTrack(){
    var now = Date.now();
    // dust pause every 30 min
    if(now - np.lastDustAt >= NP_DUST_EVERY && np.dustQueue.length){
      var d = np.dustQueue[np.dustIdx % np.dustQueue.length]; np.dustIdx++;
      np.lastDustAt = now;
      return d;
    }
    if(!np.mainQueue.length) return null;
    if(np.mainIdx >= np.mainQueue.length){ np.mainQueue = _shuffle(np.mainQueue); np.mainIdx = 0; }
    var t = np.mainQueue[np.mainIdx]; np.mainIdx++;
    return t;
  }

  function npTrackSrc(t){ return '/'+t.file; }

  function _fade(audio, from, to, ms){
    if(!audio) return;
    try{ audio.volume = from; }catch(e){}
    var steps = 40, i = 0, iv = ms/steps;
    var timer = setInterval(function(){
      i++;
      try{ audio.volume = Math.max(0, Math.min(1, from + (to-from) * (i/steps))); }catch(e){}
      if(i>=steps){ clearInterval(timer); if(to===0){ try{ audio.pause(); }catch(e){} } }
    }, iv);
  }

  function npPlayInitial(track){
    np.currentTrack = track;
    var el = new Audio(npTrackSrc(track));
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.addEventListener('ended', function(){ if(!np.crossfading) npCrossfade(); });
    el.addEventListener('timeupdate', npWatch);
    np.a = el; np.active = 'a';
    _fade(el, 0, NP_TARGET_VOL, 800);
    el.play().catch(function(){ /* autoplay blocked */ np.playing=false; npUpdateBtn(); });
    npUpdateNowPlaying();
  }

  function npWatch(){
    var cur = np[np.active];
    if(!cur || !cur.duration || isNaN(cur.duration)) return;
    var remaining = cur.duration - cur.currentTime;
    // maybe drop signature at 7-min mark (only if enough runway to layer it)
    var now = Date.now();
    if(np.sessionStartedAt && (now - np.lastSigAt) >= NP_SIG_EVERY && remaining < NP_CROSSFADE + 4 && !np.crossfading){
      npPlaySignature();
      np.lastSigAt = now; npSave();
    }
    if(remaining <= NP_CROSSFADE && !np.crossfading){
      npCrossfade();
    }
  }

  function npCrossfade(){
    if(np.crossfading) return;
    var next = npNextTrack();
    if(!next){ return; }
    np.crossfading = true;
    var incoming = new Audio(npTrackSrc(next));
    incoming.preload = 'auto';
    incoming.crossOrigin = 'anonymous';
    incoming.volume = 0;
    incoming.addEventListener('ended', function(){ if(!np.crossfading) npCrossfade(); });
    incoming.play().catch(function(){});
    var outgoing = np[np.active];
    var otherKey = (np.active==='a')?'b':'a';
    np[otherKey] = incoming;
    np.active = otherKey;
    np.currentTrack = next;
    _fade(incoming, 0, NP_TARGET_VOL, NP_CROSSFADE*1000);
    _fade(outgoing, outgoing?outgoing.volume:NP_TARGET_VOL, 0, NP_CROSSFADE*1000);
    setTimeout(function(){
      np.crossfading = false;
      incoming.addEventListener('timeupdate', npWatch);
      if(outgoing){ try{ outgoing.pause(); }catch(e){} outgoing.src=''; }
      var oldKey = (np.active==='a')?'b':'a'; np[oldKey] = null;
      npUpdateNowPlaying();
    }, NP_CROSSFADE*1000 + 200);
  }

  function npPlaySignature(){
    try{
      if(np.sigAudio){ try{ np.sigAudio.pause(); }catch(e){} }
      var s = new Audio('/cue/en/breathe-in-slowly.mp3');
      s.preload = 'auto';
      s.volume = 0.85;
      np.sigAudio = s;
      s.play().catch(function(){});
    }catch(e){}
  }

  window.respiraNavPlay = function(){
    if(np.playing){ respiraNavPause(); return; }
    npEnsureTracks(function(tracks){
      if(!tracks || !tracks.length){ _toast('no tracks available'); return; }
      npBuildQueues();
      np.playing = true;
      var now = Date.now();
      np.sessionStartedAt = now; np.lastSigAt = now; np.lastDustAt = now;
      var first = npNextTrack(); if(!first) return;
      npPlayInitial(first);
      npUpdateBtn();
      npSave();
    });
  };

  window.respiraNavPause = function(){
    np.playing = false;
    if(np.a){ _fade(np.a, np.a.volume||NP_TARGET_VOL, 0, 500); }
    if(np.b){ _fade(np.b, np.b.volume||NP_TARGET_VOL, 0, 500); }
    if(np.sigAudio){ try{ np.sigAudio.pause(); }catch(e){} }
    setTimeout(function(){ if(np.a){try{np.a.pause();}catch(e){} np.a=null;} if(np.b){try{np.b.pause();}catch(e){} np.b=null;} }, 700);
    npUpdateBtn(); npUpdateNowPlaying();
    npSave();
  };

  function npUpdateBtn(){
    var btns = D.querySelectorAll('.rh-play-btn, .door-play-btn');
    for(var i=0;i<btns.length;i++){
      btns[i].innerHTML = np.playing ? _pauseIcon() : _playIcon();
      btns[i].setAttribute('aria-label', np.playing ? 'pause respira radio' : 'play respira radio');
      btns[i].classList.toggle('is-playing', np.playing);
    }
  }
  function npUpdateNowPlaying(){
    var n = np.currentTrack ? np.currentTrack.name : '';
    var els = D.querySelectorAll('.rh-nowplaying');
    for(var i=0;i<els.length;i++){ els[i].textContent = np.playing && n ? n : ''; }
  }
  function _playIcon(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>'; }
  function _pauseIcon(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4.2" height="16" rx="1"/><rect x="13.8" y="4" width="4.2" height="16" rx="1"/></svg>'; }

  /* periodic save of live state (so page-nav can approximate resume timing) */
  setInterval(function(){ if(np.playing) npSave(); }, 3000);

  /* on page load, if we were playing recently, resume automatically (subject to autoplay policy) */
  function npAutoResume(){
    var s = npLoad(); if(!s) return;
    if(!s.playing) return;
    if(Date.now() - (s.ts||0) > 60*1000) return; // stale, don't resume
    // preserve the signature/dust cadence relative to the session
    np.lastSigAt = s.lastSigAt || 0;
    np.lastDustAt = s.lastDustAt || 0;
    np.sessionStartedAt = s.sessionStartedAt || Date.now();
    // try to play; autoplay is often blocked without user gesture, so silently fall back
    window.respiraNavPlay();
  }


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
    npUpdateBtn();
    npAutoResume();
  }
  if(D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
