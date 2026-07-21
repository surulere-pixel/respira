/* respira — i18n: english ↔ español ↔ kiswahili
   include BEFORE chrome.js:  <script src="/i18n.js" defer></script>
   stores preference in localStorage key 'respira_lang'

   Two mechanisms:
   1. data-i18n="key" attributes (for chrome.js injected content)
   2. Automatic DOM walker that matches element text against the dictionary
*/
(function(){
  if(window.__respiraI18n) return; window.__respiraI18n = true;

  var LANG_KEY = 'respira_lang';
  var LANGS = ['en','es','sw'];
  var LANG_LABEL = {en:'english', es:'español', sw:'kiswahili'};
  var currentLang = 'en';
  try{ currentLang = localStorage.getItem(LANG_KEY) || 'en'; }catch(e){}
  if(LANGS.indexOf(currentLang) < 0) currentLang = 'en';

  // ── translation dictionaries ──
  // Keys are lowercase English. Values are the target language.
  // For elements with inline HTML (<strong>, <em>, <a>), the value can contain HTML.
  var ES = {
    // ── nav / chrome ──
    'visit rooms': 'visitar salas',
    'breathe': 'respirar',
    'flow': 'fluir',
    'radio': 'radio',
    'voices': 'voces',
    'shelf': 'estante',
    'studio': 'estudio',
    'about': 'acerca de',
    'give': 'dar',
    'install': 'instalar',
    'share': 'compartir',
    'room': 'sala',
    'help': 'ayuda',
    'poster': 'póster',

    // ── toasts ──
    'tap share, then "add to home screen"': 'toca compartir, luego "añadir a pantalla de inicio"',
    'use your browser menu → install app': 'usa el menú del navegador → instalar app',
    'link copied — pass it on': 'enlace copiado — compártelo',
    'no tracks available': 'no hay pistas disponibles',
    'taking you to checkout…': 'llevándote al pago…',
    'donations aren\'t switched on yet — thank you, though.': 'las donaciones aún no están activadas — gracias de todos modos.',
    'couldn\'t start checkout — please try again.': 'no se pudo iniciar el pago — intenta de nuevo.',
    'network error — please try again.': 'error de red — intenta de nuevo.',
    'thank you — truly. your gift keeps the room open.': 'gracias — de verdad. tu regalo mantiene la sala abierta.',
    'sent — thank you.': 'enviado — gracias.',
    'sending…': 'enviando…',

    // ── homepage door panels ──
    'the breathing room': 'la sala de respiración',
    'breathe.': 'respira.',
    'stillness = sustenance': 'quietud = sustento',
    'respira flow': 'respira fluir',
    'move.': 'muévete.',
    'movement = medicine': 'movimiento = medicina',
    'respira radio': 'respira radio',
    'listen.': 'escucha.',
    'soundscapes + whispers': 'paisajes sonoros + susurros',
    'respira studio': 'respira estudio',
    'teach.': 'enseña.',
    'plan, teach + run your practice': 'planifica, enseña y dirige tu práctica',

    // ── homepage breathing room ──
    'a breathing room.': 'un espacio para respirar.',
    'put down what you\'re carrying. choose a few minutes for yourself.': 'deja lo que cargas. elige unos minutos para ti.',

    // ── about page ──
    'about respira': 'acerca de respira',
    'a breathing room, wherever you are.': 'un espacio para respirar, estés donde estés.',
    'what respira is': 'qué es respira',
    'who makes it': 'quién lo hace',
    'where respira sits': 'dónde se ubica respira',
    'the access model': 'el modelo de acceso',
    'questions': 'preguntas',
    'eight mother tongues': 'ocho lenguas maternas',
    'free where stated': 'gratuito donde se indica',
    'economic dignity, built.': 'dignidad económica, construida.',
    'you are here': 'estás aquí',
    'built across connected communities': 'construido a través de comunidades conectadas',
    'africa': 'áfrica',
    'latin america': 'latinoamérica',
    'caribbean': 'caribe',
    'diaspora': 'diáspora',
    'enter the room →': 'entrar a la sala →',
    'support the project': 'apoyar el proyecto',
    'is respira really free?': '¿respira es realmente gratuito?',
    'do i need an account?': '¿necesito una cuenta?',
    'what languages does respira speak?': '¿qué idiomas habla respira?',
    'i run a studio or teach — is this for me?': '¿tengo un estudio o enseño — es para mí?',
    'how can i support the work?': '¿cómo puedo apoyar el trabajo?',
    'visit the birthright project ↗': 'visitar the birthright project ↗',
    'move': 'mover',
    'listen': 'escuchar',

    // ── support page ──
    'support respira': 'apoyar respira',
    'make a contribution': 'haz una contribución',
    'bigger ways to give': 'formas más grandes de dar',
    'fund a mat': 'financia un mat',
    'fund a room': 'financia una sala',
    'sustaining gift': 'regalo de sostenimiento',
    'institutional & sponsorship': 'institucional y patrocinio',
    'continue to secure checkout →': 'continuar al pago seguro →',
    'other amount': 'otro monto',

    // ── help page ──
    'help & contact': 'ayuda y contacto',
    'help & support': 'ayuda y soporte',
    'need a hand?': '¿necesitas ayuda?',
    'get in touch': 'contáctanos',
    'we read every message.': 'leemos cada mensaje.',
    'name': 'nombre',
    'email': 'correo electrónico',
    'message': 'mensaje',
    'send': 'enviar',
    'send message →': 'enviar mensaje →',
    'how to use respira': 'cómo usar respira',
    'playback & sound': 'reproducción y sonido',
    'no sound is playing': 'no se reproduce sonido',
    'audio stops when i lock my screen': 'el audio se detiene al bloquear mi pantalla',
    'two things are playing at once': 'dos cosas se reproducen a la vez',
    'do i need an account to build a class?': '¿necesito una cuenta para crear una clase?',
    'where did my saved class go?': '¿dónde se fue mi clase guardada?',
    'accessibility': 'accesibilidad',
    'i use reduced motion': 'uso movimiento reducido',
    'keyboard & screen readers': 'teclado y lectores de pantalla',
    'orders & poster downloads': 'pedidos y descargas de pósters',
    'are poster downloads free?': '¿las descargas de pósters son gratuitas?',
    'a question about an order': 'una pregunta sobre un pedido',
    'still stuck? write to us': '¿aún necesitas ayuda? escríbenos',
    'your email (so we can reply)': 'tu correo (para poder responderte)',
    'topic': 'tema',
    'playback / sound': 'reproducción / sonido',
    'an order': 'un pedido',
    'something else': 'otra cosa',
    'what\'s going on?': '¿qué sucede?',

    // ── voices page ──
    'book a guide — or lend your own tongue.': 'reserva un guía — o presta tu propia voz.',
    'lend your voice': 'presta tu voz',
    'press to record': 'presiona para grabar',
    'press to stop': 'presiona para parar',
    'press to re-record': 'presiona para regrabar',
    'be featured': 'ser destacado',
    'stay in the loop': 'mantente al tanto',
    'submit': 'enviar',
    'your name': 'tu nombre',
    'your location': 'tu ubicación',
    'upload a portrait': 'sube un retrato',
    'book': 'reservar',
    'the guides': 'los guías',
    'respira voices': 'voces de respira',
    'teach the room to speak your mother tongue.': 'enséñale a la sala a hablar tu lengua materna.',
    'the mic': 'el micrófono',
    'respira should speak your language.': 'respira debería hablar tu idioma.',
    'record': 'grabar',
    're-record': 'regrabar',
    'stop': 'parar',
    'send my voice →': 'enviar mi voz →',
    'book a session →': 'reservar sesión →',
    'booking soon': 'reservas próximamente',
    '1 · choose your language': '1 · elige tu idioma',
    '3 · record': '3 · grabar',
    '4 · send it': '4 · envíalo',

    // ── find page ──
    'find a practice': 'encuentra una práctica',
    'search': 'buscar',
    'respira 100 · the directory': 'respira 100 · el directorio',
    'find a room near you.': 'encuentra una sala cerca de ti.',
    'all cities': 'todas las ciudades',
    'woman-owned': 'dirigido por mujeres',
    'black-owned': 'dirigido por personas negras',
    'virtual / online': 'virtual / en línea',
    'spaces': 'espacios',
    'space': 'espacio',
    'website': 'sitio web',
    'run a space? add your practice.': '¿diriges un espacio? agrega tu práctica.',
    'submit my practice →': 'enviar mi práctica →',
    'submitting…': 'enviando…',
    'thank you — it\'s in.': 'gracias — ya está.',
    'practice / studio name': 'nombre de la práctica / estudio',
    'type of practice': 'tipo de práctica',
    'choose…': 'elige…',
    'yoga studio': 'estudio de yoga',
    'fitness / movement studio': 'estudio de fitness / movimiento',
    'independent instructor': 'instructor independiente',
    'wellness practitioner': 'practicante de bienestar',
    'community organization': 'organización comunitaria',
    'retreat / hospitality': 'retiro / hospitalidad',
    'booking link': 'enlace de reserva',
    'a one-line vibe': 'una frase que defina tu espacio',
    'we offer virtual / online sessions': 'ofrecemos sesiones virtuales / en línea',

    // ── open floor ──
    'open floor': 'piso abierto',
    'bring your sound to the community.': 'trae tu sonido a la comunidad.',
    'original sound': 'sonido original',
    'spoken word': 'palabra hablada',
    'guided voice': 'voz guiada',
    'remix': 'remix',
    'collection': 'colección',
    'other': 'otro',
    'artist / project name': 'nombre de artista / proyecto',
    'phone / whatsapp': 'teléfono / whatsapp',
    'city': 'ciudad',
    'country': 'país',
    'what are you sharing?': '¿qué estás compartiendo?',
    'choose one…': 'elige uno…',
    'tell us about it': 'cuéntanos sobre ello',
    'how should we credit you?': '¿cómo debemos acreditarte?',
    'send my submission →': 'enviar mi propuesta →',
    'your submission is in.': 'tu propuesta fue recibida.',

    // ── goods / shop ──
    'goods': 'productos',
    'add to cart': 'agregar al carrito',
    'add to cart →': 'agregar al carrito →',
    'cart': 'carrito',
    'checkout': 'pagar',
    'checkout →': 'pagar →',
    'view cart': 'ver carrito',
    'your cart is empty': 'tu carrito está vacío',
    'your cart is empty.': 'tu carrito está vacío.',
    'remove': 'eliminar',
    'your cart': 'tu carrito',
    'subtotal': 'subtotal',
    'respira goods': 'productos respira',
    'made for the room.': 'hecho para la sala.',
    'the reunion mat': 'el mat de reunión',
    'a room you can carry.': 'una sala que puedes llevar.',
    'the respira hoodie': 'la sudadera respira',
    'the ethos, in every tongue.': 'la esencia, en cada lengua.',
    'framed prints': 'impresiones enmarcadas',
    'a phrase, held at eye level.': 'una frase, a la altura de los ojos.',
    'make a print →': 'crear una impresión →',
    'to the shop →': 'a la tienda →',

    // ── poster page ──
    'poster maker': 'creador de pósters',
    'poster maker · 18″ × 24″': 'creador de pósters · 18″ × 24″',
    '← back to shelf': '← volver al estante',
    'make it yours': 'hazlo tuyo',
    'the phrase': 'la frase',
    'the tongues': 'las lenguas',
    'tap to include · type to edit': 'toca para incluir · escribe para editar',
    'the color': 'el color',
    'the setting': 'el ajuste',
    'type size': 'tamaño de texto',
    'breathing room': 'espacio de respiración',
    'ambient glow': 'brillo ambiental',
    'hairline rule': 'línea fina',
    'eyebrow': 'cejilla',
    'footer': 'pie de página',
    'take it with you': 'llévalo contigo',
    'print · save as pdf': 'imprimir · guardar como pdf',
    'download png': 'descargar png',
    'download svg': 'descargar svg',
    'copy a link to this poster': 'copiar enlace a este póster',
    'the original pdf': 'el pdf original',
    'start over': 'empezar de nuevo',
    'breathe in slowly': 'respira lentamente',
    'prosperity is a human right': 'la prosperidad es un derecho humano',
    'deep cocoa': 'cacao profundo',
    'burnt clay': 'arcilla quemada',
    'olive night': 'noche de olivo',
    'onyx': 'ónix',
    'oat': 'avena',
    'sage': 'salvia',
    'mineral': 'mineral',
    'coral chalk': 'tiza coral',
    'flip paper & ink': 'invertir papel y tinta',

    // ── shelf page ──
    'the shelf': 'el estante',
    'on the shelf': 'en el estante',
    'the print': 'la impresión',
    'make your own poster': 'haz tu propio póster',
    'open poster maker →': 'abrir creador de pósters →',

    // ── homepage settings / breathing room ──
    'before you begin · adjust to taste': 'antes de empezar · ajusta a tu gusto',
    'voice & language': 'voz e idioma',
    'guidance': 'guía',
    'none': 'ninguna',
    'minimal': 'mínima',
    'moderate': 'moderada',
    'frequent': 'frecuente',
    'ambience': 'ambiente',
    'silence': 'silencio',
    'rhythm': 'ritmo',
    'box': 'cuadrado',
    'inhale': 'inhalar',
    'choose a length to begin ↓': 'elige una duración para empezar ↓',
    '5 min': '5 min',
    '10 min': '10 min',
    '20 min': '20 min',
    'settle in': 'acomódate',
    'breathe in': 'inhala',
    'breathe out': 'exhala',
    'breaths to begin': 'respiraciones para comenzar',
    'breath to begin': 'respiración para comenzar',
    'controls': 'controles',
    'ambient sound': 'sonido ambiental',
    'chime': 'campana',
    'chime on': 'campana sí',
    'chime off': 'campana no',
    'voice guide': 'guía de voz',
    'voice': 'voz',
    'no voice': 'sin voz',
    'blend': 'mezcla',
    'end session': 'terminar sesión',
    'leave room': 'salir de la sala',
    'active flow': 'flujo activo',
    'end sequence': 'terminar secuencia',
    'pause': 'pausa',
    'resume': 'continuar',
    'prev': 'anterior',
    'next': 'siguiente',
    'loop': 'repetir',
    'shuffle': 'aleatorio',
    'timer': 'temporizador',

    // ── completion ──
    'thank you for breathing.': 'gracias por respirar.',
    'thank you for moving.': 'gracias por moverte.',
    'thank you for staying a few minutes.': 'gracias por quedarte unos minutos.',
    'you made a little time for yourself today.': 'hoy te diste un poco de tiempo para ti.',
    'a note from respira': 'una nota de respira',
    'minutes today': 'minutos hoy',
    'total minutes': 'minutos totales',
    'breathe again': 'respirar de nuevo',
    'continue listening': 'seguir escuchando',
    'share respira': 'compartir respira',

    // ── radio section ──
    'soulful soundscapes for studios & spaces.': 'paisajes sonoros para estudios y espacios.',
    'install the free player': 'instalar el reproductor gratuito',
    'stations': 'estaciones',
    'drift': 'drift',
    'groove': 'groove',
    'whisper': 'whisper',
    'dust': 'dust',
    'diasporadique': 'diasporadique',
    'wind-down & slow movement': 'relajación y movimiento lento',
    'focus & easy energy': 'enfoque y energía suave',
    'meditation & deep rest': 'meditación y descanso profundo',
    'sounds of the diaspora': 'sonidos de la diáspora',
    'new': 'nuevo',
    'soon': 'pronto',
    'tap a station to begin.': 'toca una estación para comenzar.',
    'collections · in the soundlab': 'colecciones · en el soundlab',
    'spotlight': 'destacado',
    'now playing': 'reproduciendo',

    // ── flow section ──
    'soften + reset': 'suavizar + resetear',
    'easy slow flow': 'flujo lento y suave',
    'full gentle sequence': 'secuencia suave completa',
    '5 min · 8 poses': '5 min · 8 posturas',
    '10 min · 14 poses': '10 min · 14 posturas',
    '20 min · 20 poses': '20 min · 20 posturas',

    // ── feedback ──
    'how much did respira help you pause today?': '¿cuánto te ayudó respira a pausar hoy?',
    'a little': 'un poco',
    'a lot': 'mucho',
    'say more →': 'cuéntanos más →',
    'send feedback': 'enviar comentarios',

    // ── donate modal ──
    'respira is free. keep it that way.': 'respira es gratuito. mantenlo así.',
    'continue →': 'continuar →',

    // ── install ──
    'add respira to your home screen': 'añadir respira a tu pantalla de inicio',
    'got it': 'entendido',

    // ── cart ──
    'added to cart': 'agregado al carrito',
    'thank you — your order\'s in.': 'gracias — tu pedido fue recibido.',
    'checkout isn\'t switched on yet': 'el pago aún no está activado',
    'couldn\'t start checkout — try again': 'no se pudo iniciar el pago — intenta de nuevo',
    'network error — try again': 'error de red — intenta de nuevo',

    // ── share dialog ──
    'copy link': 'copiar enlace',
    'whatsapp': 'whatsapp',
    'text message': 'mensaje de texto',
    'a breathing room': 'un espacio para respirar',

    // ── misc ──
    'by happy sunday, a birthright venture': 'por happy sunday, una empresa birthright',
    'home': 'inicio',
    'enter →': 'entrar →',
    'roll across · tap to enter': 'desliza · toca para entrar',

    // ── footer ──
    '↓ install': '↓ instalar',
    '↗ share': '↗ compartir'
  };

  var SW = {
    // ── nav / chrome ──
    'visit rooms': 'tembelea vyumba',
    'breathe': 'pumua',
    'flow': 'mtiririko',
    'radio': 'redio',
    'voices': 'sauti',
    'shelf': 'rafu',
    'studio': 'studio',
    'about': 'kuhusu',
    'give': 'changia',
    'install': 'sakinisha',
    'share': 'shiriki',
    'room': 'chumba',
    'help': 'msaada',
    'poster': 'bango',

    // ── toasts ──
    'tap share, then "add to home screen"': 'gusa shiriki, kisha "ongeza kwenye skrini ya nyumbani"',
    'use your browser menu → install app': 'tumia menyu ya kivinjari chako → sakinisha programu',
    'link copied — pass it on': 'kiungo kimenakiliwa — kipe mtu mwingine',
    'no tracks available': 'hakuna nyimbo zinazopatikana',
    'taking you to checkout…': 'tunakupeleka kwenye malipo…',
    'donations aren\'t switched on yet — thank you, though.': 'michango bado haijawashwa — asante hata hivyo.',
    'couldn\'t start checkout — please try again.': 'imeshindikana kuanzisha malipo — tafadhali jaribu tena.',
    'network error — please try again.': 'hitilafu ya mtandao — tafadhali jaribu tena.',
    'thank you — truly. your gift keeps the room open.': 'asante — kwa dhati. zawadi yako inaweka chumba wazi.',
    'sent — thank you.': 'imetumwa — asante.',
    'sending…': 'inatuma…',

    // ── homepage door panels ──
    'the breathing room': 'chumba cha kupumua',
    'breathe.': 'pumua.',
    'stillness = sustenance': 'utulivu = riziki',
    'respira flow': 'respira mtiririko',
    'move.': 'sogea.',
    'movement = medicine': 'mwendo = dawa',
    'respira radio': 'respira redio',
    'listen.': 'sikiliza.',
    'soundscapes + whispers': 'sauti za mazingira + minong\'ono',
    'respira studio': 'respira studio',
    'teach.': 'fundisha.',
    'plan, teach + run your practice': 'panga, fundisha na endesha mazoezi yako',

    // ── homepage breathing room ──
    'a breathing room.': 'chumba cha kupumua.',
    'put down what you\'re carrying. choose a few minutes for yourself.': 'weka chini unachobeba. chagua dakika chache kwa ajili yako.',

    // ── about page ──
    'about respira': 'kuhusu respira',
    'a breathing room, wherever you are.': 'chumba cha kupumua, popote ulipo.',
    'what respira is': 'respira ni nini',
    'who makes it': 'nani anaifanya',
    'where respira sits': 'respira iko wapi',
    'the access model': 'mfumo wa upatikanaji',
    'questions': 'maswali',
    'eight mother tongues': 'lugha nane za asili',
    'free where stated': 'bure pale inapoelezwa',
    'economic dignity, built.': 'heshima ya kiuchumi, iliyojengwa.',
    'you are here': 'uko hapa',
    'built across connected communities': 'imejengwa katika jamii zilizounganishwa',
    'africa': 'afrika',
    'latin america': 'amerika ya kusini',
    'caribbean': 'karibiani',
    'diaspora': 'diaspora',
    'enter the room →': 'ingia chumbani →',
    'support the project': 'saidia mradi',
    'is respira really free?': 'je, respira ni bure kweli?',
    'do i need an account?': 'je, ninahitaji akaunti?',
    'what languages does respira speak?': 'respira inaongea lugha zipi?',
    'i run a studio or teach — is this for me?': 'ninaendesha studio au ninafundisha — hii ni kwa ajili yangu?',
    'how can i support the work?': 'ninawezaje kusaidia kazi hii?',
    'visit the birthright project ↗': 'tembelea the birthright project ↗',
    'move': 'sogea',
    'listen': 'sikiliza',

    // ── support page ──
    'support respira': 'saidia respira',
    'make a contribution': 'toa mchango',
    'bigger ways to give': 'njia kubwa zaidi za kuchangia',
    'fund a mat': 'fadhili mkeka',
    'fund a room': 'fadhili chumba',
    'sustaining gift': 'zawadi endelevu',
    'institutional & sponsorship': 'taasisi na ufadhili',
    'continue to secure checkout →': 'endelea kwenye malipo salama →',
    'other amount': 'kiasi kingine',

    // ── help page ──
    'help & contact': 'msaada na mawasiliano',
    'help & support': 'msaada na uungwaji mkono',
    'need a hand?': 'unahitaji msaada?',
    'get in touch': 'wasiliana nasi',
    'we read every message.': 'tunasoma kila ujumbe.',
    'name': 'jina',
    'email': 'barua pepe',
    'message': 'ujumbe',
    'send': 'tuma',
    'send message →': 'tuma ujumbe →',
    'how to use respira': 'jinsi ya kutumia respira',
    'playback & sound': 'uchezaji na sauti',
    'no sound is playing': 'hakuna sauti inayochezwa',
    'audio stops when i lock my screen': 'sauti inasimama ninapofunga skrini yangu',
    'two things are playing at once': 'vitu viwili vinachezwa kwa wakati mmoja',
    'do i need an account to build a class?': 'je, ninahitaji akaunti kuunda somo?',
    'where did my saved class go?': 'somo langu lililohifadhiwa limeenda wapi?',
    'accessibility': 'ufikivu',
    'i use reduced motion': 'ninatumia mwendo uliopunguzwa',
    'keyboard & screen readers': 'kibodi na visomaji vya skrini',
    'orders & poster downloads': 'maagizo na upakuaji wa mabango',
    'are poster downloads free?': 'je, upakuaji wa mabango ni bure?',
    'a question about an order': 'swali kuhusu agizo',
    'still stuck? write to us': 'bado umekwama? tuandikie',
    'your email (so we can reply)': 'barua pepe yako (ili tuweze kujibu)',
    'topic': 'mada',
    'playback / sound': 'uchezaji / sauti',
    'an order': 'agizo',
    'something else': 'kitu kingine',
    'what\'s going on?': 'kuna nini?',

    // ── voices page ──
    'book a guide — or lend your own tongue.': 'weka nafasi na mwongozaji — au toa sauti yako mwenyewe.',
    'lend your voice': 'toa sauti yako',
    'press to record': 'bonyeza kurekodi',
    'press to stop': 'bonyeza kusimamisha',
    'press to re-record': 'bonyeza kurekodi tena',
    'be featured': 'onyeshwa',
    'stay in the loop': 'baki na taarifa',
    'submit': 'wasilisha',
    'your name': 'jina lako',
    'your location': 'mahali ulipo',
    'upload a portrait': 'pakia picha yako',
    'book': 'weka nafasi',
    'the guides': 'waongozaji',
    'respira voices': 'sauti za respira',
    'teach the room to speak your mother tongue.': 'fundisha chumba kuongea lugha yako ya asili.',
    'the mic': 'kipaza sauti',
    'respira should speak your language.': 'respira inapaswa kuongea lugha yako.',
    'record': 'rekodi',
    're-record': 'rekodi tena',
    'stop': 'simamisha',
    'send my voice →': 'tuma sauti yangu →',
    'book a session →': 'weka nafasi ya kikao →',
    'booking soon': 'kuweka nafasi hivi karibuni',
    '1 · choose your language': '1 · chagua lugha yako',
    '3 · record': '3 · rekodi',
    '4 · send it': '4 · tuma',

    // ── find page ──
    'find a practice': 'tafuta mazoezi',
    'search': 'tafuta',
    'respira 100 · the directory': 'respira 100 · saraka',
    'find a room near you.': 'tafuta chumba karibu nawe.',
    'all cities': 'miji yote',
    'woman-owned': 'inamilikiwa na wanawake',
    'black-owned': 'inamilikiwa na watu weusi',
    'virtual / online': 'mtandaoni',
    'spaces': 'nafasi',
    'space': 'nafasi',
    'website': 'tovuti',
    'run a space? add your practice.': 'unaendesha nafasi? ongeza mazoezi yako.',
    'submit my practice →': 'wasilisha mazoezi yangu →',
    'submitting…': 'inawasilisha…',
    'thank you — it\'s in.': 'asante — limepokelewa.',
    'practice / studio name': 'jina la mazoezi / studio',
    'type of practice': 'aina ya mazoezi',
    'choose…': 'chagua…',
    'yoga studio': 'studio ya yoga',
    'fitness / movement studio': 'studio ya mazoezi ya mwili / mwendo',
    'independent instructor': 'mkufunzi huru',
    'wellness practitioner': 'mtaalamu wa ustawi',
    'community organization': 'shirika la kijamii',
    'retreat / hospitality': 'mafungo / ukarimu',
    'booking link': 'kiungo cha kuweka nafasi',
    'a one-line vibe': 'maelezo mafupi ya nafasi yako',
    'we offer virtual / online sessions': 'tunatoa vipindi vya mtandaoni',

    // ── open floor ──
    'open floor': 'jukwaa huru',
    'bring your sound to the community.': 'leta sauti yako kwa jamii.',
    'original sound': 'sauti asili',
    'spoken word': 'neno linalozungumzwa',
    'guided voice': 'sauti inayoongoza',
    'remix': 'remix',
    'collection': 'mkusanyiko',
    'other': 'nyingine',
    'artist / project name': 'jina la msanii / mradi',
    'phone / whatsapp': 'simu / whatsapp',
    'city': 'jiji',
    'country': 'nchi',
    'what are you sharing?': 'unashiriki nini?',
    'choose one…': 'chagua moja…',
    'tell us about it': 'tuambie kuhusu hilo',
    'how should we credit you?': 'tukutambue vipi?',
    'send my submission →': 'tuma wasilisho langu →',
    'your submission is in.': 'wasilisho lako limepokelewa.',

    // ── goods / shop ──
    'goods': 'bidhaa',
    'add to cart': 'ongeza kwenye kikapu',
    'add to cart →': 'ongeza kwenye kikapu →',
    'cart': 'kikapu',
    'checkout': 'lipa',
    'checkout →': 'lipa →',
    'view cart': 'ona kikapu',
    'your cart is empty': 'kikapu chako ni tupu',
    'your cart is empty.': 'kikapu chako ni tupu.',
    'remove': 'ondoa',
    'your cart': 'kikapu chako',
    'subtotal': 'jumla ndogo',
    'respira goods': 'bidhaa za respira',
    'made for the room.': 'imetengenezwa kwa ajili ya chumba.',
    'the reunion mat': 'mkeka wa muungano',
    'a room you can carry.': 'chumba unachoweza kubeba.',
    'the respira hoodie': 'hoodie ya respira',
    'the ethos, in every tongue.': 'itikadi, katika kila lugha.',
    'framed prints': 'picha zilizowekwa fremu',
    'a phrase, held at eye level.': 'kauli, ikiwa katika kiwango cha macho.',
    'make a print →': 'tengeneza chapisho →',
    'to the shop →': 'kwenda dukani →',

    // ── poster page ──
    'poster maker': 'mtengenezaji wa bango',
    'poster maker · 18″ × 24″': 'mtengenezaji wa bango · 18″ × 24″',
    '← back to shelf': '← rudi kwenye rafu',
    'make it yours': 'lifanye lako',
    'the phrase': 'kauli',
    'the tongues': 'lugha',
    'tap to include · type to edit': 'gusa kujumuisha · andika kuhariri',
    'the color': 'rangi',
    'the setting': 'mpangilio',
    'type size': 'ukubwa wa maandishi',
    'breathing room': 'chumba cha kupumua',
    'ambient glow': 'mng\'ao wa mazingira',
    'hairline rule': 'mstari mwembamba',
    'eyebrow': 'kichwa kidogo',
    'footer': 'sehemu ya chini',
    'take it with you': 'chukua nawe',
    'print · save as pdf': 'chapisha · hifadhi kama pdf',
    'download png': 'pakua png',
    'download svg': 'pakua svg',
    'copy a link to this poster': 'nakili kiungo cha bango hili',
    'the original pdf': 'pdf asili',
    'start over': 'anza upya',
    'breathe in slowly': 'vuta pumzi polepole',
    'prosperity is a human right': 'ustawi ni haki ya binadamu',
    'deep cocoa': 'kakao nzito',
    'burnt clay': 'udongo uliochomwa',
    'olive night': 'usiku wa mzeituni',
    'onyx': 'onyx',
    'oat': 'shayiri',
    'sage': 'sage',
    'mineral': 'madini',
    'coral chalk': 'chaki ya matumbawe',
    'flip paper & ink': 'geuza karatasi na wino',

    // ── shelf page ──
    'the shelf': 'rafu',
    'on the shelf': 'kwenye rafu',
    'the print': 'chapisho',
    'make your own poster': 'tengeneza bango lako mwenyewe',
    'open poster maker →': 'fungua mtengenezaji wa bango →',

    // ── homepage settings / breathing room ──
    'before you begin · adjust to taste': 'kabla ya kuanza · rekebisha kama unavyopenda',
    'voice & language': 'sauti na lugha',
    'guidance': 'muongozo',
    'none': 'hakuna',
    'minimal': 'kidogo',
    'moderate': 'wastani',
    'frequent': 'mara kwa mara',
    'ambience': 'mazingira',
    'silence': 'ukimya',
    'rhythm': 'mdundo',
    'box': 'boksi',
    'inhale': 'vuta pumzi',
    'choose a length to begin ↓': 'chagua muda ili kuanza ↓',
    '5 min': 'dakika 5',
    '10 min': 'dakika 10',
    '20 min': 'dakika 20',
    'settle in': 'tulia',
    'breathe in': 'vuta pumzi',
    'breathe out': 'toa pumzi',
    'breaths to begin': 'pumzi za kuanza',
    'breath to begin': 'pumzi ya kuanza',
    'controls': 'vidhibiti',
    'ambient sound': 'sauti ya mazingira',
    'chime': 'kengele',
    'chime on': 'kengele imewashwa',
    'chime off': 'kengele imezimwa',
    'voice guide': 'mwongozo wa sauti',
    'voice': 'sauti',
    'no voice': 'hakuna sauti',
    'blend': 'changanya',
    'end session': 'maliza kikao',
    'leave room': 'ondoka chumbani',
    'active flow': 'mtiririko unaoendelea',
    'end sequence': 'maliza mfuatano',
    'pause': 'simamisha kidogo',
    'resume': 'endelea',
    'prev': 'iliyotangulia',
    'next': 'inayofuata',
    'loop': 'rudia',
    'shuffle': 'changanya bila mpangilio',
    'timer': 'kipima muda',

    // ── completion ──
    'thank you for breathing.': 'asante kwa kupumua.',
    'thank you for moving.': 'asante kwa kusogea.',
    'thank you for staying a few minutes.': 'asante kwa kukaa dakika chache.',
    'you made a little time for yourself today.': 'umejipatia muda kidogo leo.',
    'a note from respira': 'ujumbe kutoka respira',
    'minutes today': 'dakika leo',
    'total minutes': 'jumla ya dakika',
    'breathe again': 'pumua tena',
    'continue listening': 'endelea kusikiliza',
    'share respira': 'shiriki respira',

    // ── radio section ──
    'soulful soundscapes for studios & spaces.': 'sauti za mazingira zenye roho kwa ajili ya studio na nafasi.',
    'install the free player': 'sakinisha kicheza sauti cha bure',
    'stations': 'vituo',
    'drift': 'drift',
    'groove': 'groove',
    'whisper': 'whisper',
    'dust': 'dust',
    'diasporadique': 'diasporadique',
    'wind-down & slow movement': 'kupumzika na mwendo wa taratibu',
    'focus & easy energy': 'umakini na nguvu nyepesi',
    'meditation & deep rest': 'kutafakari na mapumziko marefu',
    'sounds of the diaspora': 'sauti za diaspora',
    'new': 'mpya',
    'soon': 'hivi karibuni',
    'tap a station to begin.': 'gusa kituo ili kuanza.',
    'collections · in the soundlab': 'makusanyo · katika soundlab',
    'spotlight': 'mwangaza',
    'now playing': 'inachezwa sasa',

    // ── flow section ──
    'soften + reset': 'legeza + anza upya',
    'easy slow flow': 'mtiririko rahisi wa taratibu',
    'full gentle sequence': 'mfuatano kamili na laini',
    '5 min · 8 poses': 'dakika 5 · mikao 8',
    '10 min · 14 poses': 'dakika 10 · mikao 14',
    '20 min · 20 poses': 'dakika 20 · mikao 20',

    // ── feedback ──
    'how much did respira help you pause today?': 'respira ilikusaidia kiasi gani kusimama kidogo leo?',
    'a little': 'kidogo',
    'a lot': 'sana',
    'say more →': 'sema zaidi →',
    'send feedback': 'tuma maoni',

    // ── donate modal ──
    'respira is free. keep it that way.': 'respira ni bure. iendelee hivyo.',
    'continue →': 'endelea →',

    // ── install ──
    'add respira to your home screen': 'ongeza respira kwenye skrini yako ya nyumbani',
    'got it': 'nimeelewa',

    // ── cart ──
    'added to cart': 'imeongezwa kwenye kikapu',
    'thank you — your order\'s in.': 'asante — agizo lako limepokelewa.',
    'checkout isn\'t switched on yet': 'malipo bado hayajawashwa',
    'couldn\'t start checkout — try again': 'imeshindikana kuanzisha malipo — jaribu tena',
    'network error — try again': 'hitilafu ya mtandao — jaribu tena',

    // ── share dialog ──
    'copy link': 'nakili kiungo',
    'whatsapp': 'whatsapp',
    'text message': 'ujumbe wa maandishi',
    'a breathing room': 'chumba cha kupumua',

    // ── misc ──
    'by happy sunday, a birthright venture': 'na happy sunday, mradi wa birthright',
    'home': 'nyumbani',
    'enter →': 'ingia →',
    'roll across · tap to enter': 'sogeza · gusa kuingia',

    // ── footer ──
    '↓ install': '↓ sakinisha',
    '↗ share': '↗ shiriki'
  };

  // ── longer paragraph-level translations ──
  // keyed by a normalized snippet of the English text (first ~60 chars)
  var ES_LONG = {
    'respira is a free digital space for breathing, gentle movem': 'respira es un espacio digital gratuito para la respiración, el movimiento suave y el sonido del alma — creado para ampliar el acceso práctico al tipo de cuidado que demasiado a menudo está limitado por precio, lugar o membresía.',
    'respira brings three simple things into one calm place': 'respira reúne tres cosas simples en un lugar tranquilo: <strong>respirar</strong> — respiración guiada con ritmo, voz y sonido ambiental; <strong>mover</strong> — flujos suaves y secuencias de movilidad; y <strong>escuchar</strong> — respira radio, paisajes sonoros y guía hablada de artistas de toda la diáspora.',
    'it is not a course to complete or a streak to maintain': 'no es un curso para completar ni una racha que mantener. es un espacio al que puedes entrar unos minutos, en tu propio idioma, y salir un poco más ligero.',
    'respira is offered by happy sunday, an initiative of the bi': 'respira es ofrecido por <strong>happy sunday</strong>, una iniciativa del <strong>birthright project</strong>. el trabajo se sustenta en una creencia simple: la quietud es sustento, el movimiento es medicina, y la prosperidad — incluyendo la prosperidad cotidiana de un sistema nervioso en calma — es un derecho humano.',
    'happy sunday is the everyday-wellbeing collective of the bi': 'happy sunday es el colectivo de bienestar cotidiano del birthright project — que construye dignidad económica a través de cultura, cuidado y finanzas. respira es una de sus salas, creada junto a empresas hermanas en emprendimiento creativo y autonomía financiera, a través de comunidades conectadas en cuatro continentes.',
    'creative talent → digital enterprise': 'talento creativo → empresa digital',
    'everyday wellbeing → community infrastructure': 'bienestar cotidiano → infraestructura comunitaria',
    'skills + support → financial autonomy': 'habilidades + apoyo → autonomía financiera',
    'the core experience is free where stated': 'la experiencia principal es <strong>gratuita</strong> donde se indica — respiración, movimiento, radio y las descargas digitales del creador de pósters. respira también ofrece herramientas para quienes imparten práctica (ver <a href="/studio" style="color:var(--sage-dark);">respira estudio</a>) y una pequeña línea de productos físicos, que ayudan a sostener las herramientas gratuitas. nada esencial está detrás de un muro de pago.',
    'the breathing room, movement flows, respira radio and digi': 'la sala de respiración, los flujos de movimiento, respira radio y las descargas digitales de pósters son gratuitos. las impresiones enmarcadas y los productos físicos son de pago, y ayudan a mantener las herramientas gratuitas.',
    'no. you can breathe, move, listen and download': 'no. puedes respirar, moverte, escuchar y descargar un póster sin iniciar sesión. una cuenta solo es útil cuando quieres guardar clases en respira estudio o solicitar una sala personalizada — funciones diseñadas para instructores y espacios.',
    'guidance and poster phrases are offered across eight': 'las guías y frases de pósters se ofrecen en ocho lenguas maternas, con más en desarrollo. los idiomas aún en construcción se etiquetan con honestidad en lugar de mostrarse como listos.',
    'yes. respira studio is a free workspace': 'sí. <a href="/studio" style="color:var(--sage-dark);">respira estudio</a> es un espacio de trabajo gratuito para crear clases, enseñar con voz y sonido, y lanzar tu propia sala impulsada por respira.',
    'you can support respira with a one-time': 'puedes <a href="/support" style="color:var(--sage-dark);">apoyar respira</a> con una contribución única, o compartirlo con alguien que necesite unos minutos de calma.',
    'one room in a global house.': 'una sala en una casa <em>global</em>.',
    'respira\'s breathing room, movement flows and radio': 'la sala de respiración, los flujos de movimiento y la radio de respira son de uso gratuito. las contribuciones mantienen los servidores en marcha, las voces grabando y las herramientas abiertas para todos.',
    'a one-time gift, in any amount': 'un regalo único, en cualquier monto. los pagos son procesados de forma segura por <strong>stripe</strong> — respira nunca ve los datos de tu tarjeta.',
    'suggested contributions toward specific parts': 'contribuciones sugeridas para partes específicas del trabajo. cada regalo es una contribución general a respira — son marcos de referencia, no cuentas asignadas.',
    'the cost of a reunion mat, given so a community': 'el costo de un mat de reunión, dado para que un espacio comunitario pueda practicar sobre suelo real.',
    'help stand up a respira-powered room': 'ayuda a crear una sala impulsada por respira para un estudio o comunidad que de otro modo no podría costearlo.',
    'underwrite a season of free breathing': 'financiar una temporada de respiración, movimiento y sonido gratuito para todos los que entren.',
    'foundations, workplaces and cultural institutions': 'fundaciones, empresas e instituciones culturales pueden patrocinar salas, mats y programas de acceso a escala. escribe a <a href="mailto:hello@openrespira.org?subject=respira%20partnership">hello@openrespira.org</a> y te enviaremos un resumen de asociación. para cualquier otra cosa, la <a href="/help">página de ayuda</a> tiene un formulario de contacto.',
    'contributions keep the servers running': 'las contribuciones mantienen los servidores en marcha, las voces grabando y las herramientas abiertas para todos.',
    'keep the room free': 'mantén la sala <em>gratuita.</em>',
    'secured by stripe': 'protegido por stripe · único · sin cuenta necesaria',
    // ── shelf ──
    'from the room, into your hands': 'de la sala, a tus manos.',
    'print-ready posters in eight mother tongues': 'pósters listos para imprimir en ocho lenguas maternas, y algunas cosas buenas hechas a medida. cada compra mantiene la sala gratuita.',
    'choose a phrase, eight mother tongues, your co': 'elige una frase, ocho lenguas maternas, tus colores. descarga gratis — o enmarcada y entregada.',
    'a grounding mat for the practice': 'un mat para la práctica — hecho a medida, construido para durar una década de mañanas.',
    'heavyweight, quiet, soft as a sunday': 'pesada, tranquila, suave como un domingo — del mat al mercado.',
    // ── goods ──
    'a small, considered line': 'una línea pequeña y considerada — objetos que llevan la práctica fuera de la pantalla y al espacio que te rodea. cada compra ayuda a mantener la sala de respiración gratuita.',
    'tri-fold vegan suede mat': 'mat tríptico de gamuza vegana · cojín a juego · bolsa de transporte',
    'heavyweight hoodie': 'sudadera de algodón pesado · movimiento = medicina, quietud = sustento, traducido en el frente y la espalda',
    'your phrase, in eight mother tongues': 'tu frase, en ocho lenguas maternas · tus colores · papel mate de alto gramaje, passepartout sin ácido, marco de madera maciza',
    // ── voices ──
    'the voice is a companion. lend yours.': 'la voz es una compañera. presta la tuya.',
    'these are the voices that companion the room': 'estas son las voces que acompañan la sala, de toda la diáspora. ¿hablas un idioma que aún no tienen? agrega el tuyo abajo.',
    'you don\'t have to be a guide': 'no tienes que ser un guía. elige un idioma, lee algunas líneas en voz alta — unos treinta segundos — y le enseñaremos a la sala a hablarlo. siempre tuyo, siempre acreditado.',
    // ── find ──
    'studios, instructors and community spaces selec': 'estudios, instructores y espacios comunitarios seleccionados de toda la red respira — muchos dirigidos por mujeres, por personas negras y por comunidades, a través de áfrica, latinoamérica, el caribe y la diáspora.',
    'tell us about your studio, collective or indepe': 'cuéntanos sobre tu estudio, colectivo o práctica independiente. revisamos cada propuesta y nos comunicamos antes de publicar — recibirás una referencia para dar seguimiento.',
    // ── open floor ──
    'respira\'s sound world is built by artists acros': 'el mundo sonoro de respira es construido por artistas de toda la diáspora. si haces música, tienes una voz, o llevas una práctica que vale la pena compartir — esta es tu puerta de entrada.',
    'send us your work and a little about you': 'envíanos tu trabajo y un poco sobre ti. escuchamos todo, y nos comunicaremos antes de que algo salga en vivo. conservas tus derechos y siempre eres acreditado.',
    // ── help ──
    'answers to the most common questions': 'respuestas a las preguntas más comunes — y una forma de contactar a una persona real si aún necesitas ayuda.',
    'check your device isn\'t on silent': 'verifica que tu dispositivo no esté en silencio, y que el volumen en la página no esté apagado. en iphone, el interruptor físico de silencio puede silenciar el audio web — desactívalo. toca reproducir directamente (los navegadores bloquean el audio hasta que interactúas con la página).',
    'use the install option': 'usa la opción de instalar (agregar respira a tu pantalla de inicio) para la reproducción en segundo plano más confiable. algunos navegadores móviles pausan el audio web cuando la pestaña está en segundo plano.',
    'starting a new sound should stop the previous': 'al iniciar un nuevo sonido debería detenerse el anterior. si escuchas superposición, actualiza la página — y cuéntanos abajo cuáles dos fuentes se superpusieron, para que podamos corregirlo.',
    'no — you can build and save a class on your dev': 'no — puedes crear y guardar una clase en tu dispositivo sin iniciar sesión. una cuenta te permite mantener una biblioteca de clases entre dispositivos y solicitar una sala personalizada.',
    'guest classes are saved in your browser': 'las clases de invitado se guardan en tu navegador en este dispositivo. borrar los datos del sitio o cambiar de navegador las eliminará. el inicio de sesión (próximamente en estudio) las mantiene sincronizadas.',
    'respira respects your system\'s reduced-motion': 'respira respeta la configuración de movimiento reducido de tu sistema — las animaciones se minimizan automáticamente cuando está activada.',
    'controls are keyboard-navigable with visible fo': 'los controles son navegables con teclado con enfoque visible, y los botones de solo ícono llevan etiquetas de texto. si encuentras una barrera, cuéntanos abajo — las correcciones de accesibilidad van al frente de la cola.',
    'yes — every digital poster format is free': 'sí — cada formato de póster digital es gratuito y se descarga inmediatamente, sin pago. solo las impresiones enmarcadas (impresas y enviadas) son de pago.',
    'order receipts come from stripe': 'los recibos de pedido vienen de stripe. para cualquier cosa sobre una sudadera, mat o impresión enmarcada, escríbenos abajo con tu correo y lo encontraremos.',
    'we read every message. we\'ll reply to the emai': 'leemos cada mensaje. responderemos al correo que dejes — usualmente dentro de un par de días.'
  };

  var SW_LONG = {
    'respira is a free digital space for breathing, gentle movem': 'respira ni nafasi ya kidijitali ya bure kwa ajili ya kupumua, mwendo laini na sauti yenye roho — iliyoundwa kupanua upatikanaji wa aina ya utunzaji ambao mara nyingi hufungwa nyuma ya bei, mahali au uanachama.',
    'respira brings three simple things into one calm place': 'respira inaleta mambo matatu rahisi katika sehemu moja tulivu: <strong>pumua</strong> — mwongozo wa kupumua wenye mdundo, sauti na mazingira; <strong>sogea</strong> — mitiririko laini na mfuatano wa uhamaji; na <strong>sikiliza</strong> — respira redio, sauti za mazingira na mwongozo wa maneno kutoka kwa wasanii wa diaspora yote.',
    'it is not a course to complete or a streak to maintain': 'sio kozi ya kukamilisha wala mfuatano wa kudumisha. ni chumba unachoweza kuingia kwa dakika chache, katika lugha yako mwenyewe, na kutoka ukiwa mwepesi kidogo.',
    'respira is offered by happy sunday, an initiative of the bi': 'respira inatolewa na <strong>happy sunday</strong>, mradi wa <strong>birthright project</strong>. kazi hii inasimama juu ya imani rahisi: utulivu ni riziki, mwendo ni dawa, na ustawi — ikiwa ni pamoja na ustawi wa kila siku wa mfumo wa neva ulio tulivu — ni haki ya binadamu.',
    'happy sunday is the everyday-wellbeing collective of the bi': 'happy sunday ni umoja wa ustawi wa kila siku wa birthright project — unaojenga heshima ya kiuchumi katika utamaduni, utunzaji na fedha. respira ni mojawapo ya vyumba vyake, kilichoundwa pamoja na miradi dada katika ujasiriamali wa ubunifu na uhuru wa kifedha, katika jamii zilizounganishwa katika mabara manne.',
    'creative talent → digital enterprise': 'kipaji cha ubunifu → biashara ya kidijitali',
    'everyday wellbeing → community infrastructure': 'ustawi wa kila siku → miundombinu ya jamii',
    'skills + support → financial autonomy': 'ujuzi + msaada → uhuru wa kifedha',
    'the core experience is free where stated': 'uzoefu wa msingi ni <strong>bure</strong> pale inapoelezwa — kupumua, mwendo, redio na upakuaji wa kidijitali wa mtengenezaji wa mabango. respira pia inatoa zana kwa watu wanaotoa mazoezi (angalia <a href="/studio" style="color:var(--sage-dark);">respira studio</a>) na mstari mdogo wa bidhaa halisi, zinazosaidia kudumisha zana za bure. hakuna kitu muhimu kilichowekwa nyuma ya ukuta wa malipo.',
    'the breathing room, movement flows, respira radio and digi': 'chumba cha kupumua, mitiririko ya mwendo, respira redio na upakuaji wa kidijitali wa mabango ni bure. picha zilizowekwa fremu na bidhaa halisi ni za malipo, na zinasaidia kudumisha zana za bure.',
    'no. you can breathe, move, listen and download': 'hapana. unaweza kupumua, kusogea, kusikiliza na kupakua bango bila kuingia. akaunti inakuwa na manufaa tu unapotaka kuhifadhi masomo katika respira studio au kuomba chumba chenye chapa — vipengele vilivyoundwa kwa wakufunzi na nafasi.',
    'guidance and poster phrases are offered across eight': 'mwongozo na kauli za mabango zinatolewa katika lugha nane za asili, na zaidi zikiendelea kutengenezwa. lugha ambazo bado zinajengwa zinaonyeshwa kwa uwazi badala ya kuonyeshwa kama tayari.',
    'yes. respira studio is a free workspace': 'ndiyo. <a href="/studio" style="color:var(--sage-dark);">respira studio</a> ni nafasi ya kazi ya bure ya kuunda masomo, kufundisha kwa sauti na mlio, na kuanzisha chumba chako mwenyewe kinachotumia respira.',
    'you can support respira with a one-time': 'unaweza <a href="/support" style="color:var(--sage-dark);">kusaidia respira</a> kwa mchango wa mara moja, au kuushiriki na mtu anayehitaji dakika chache za utulivu.',
    'one room in a global house.': 'chumba kimoja katika nyumba <em>ya dunia</em>.',
    'respira\'s breathing room, movement flows and radio': 'chumba cha kupumua, mitiririko ya mwendo na redio ya respira ni ya bure kutumia. michango inaendesha seva, kurekodi sauti na kuweka zana wazi kwa kila mtu.',
    'a one-time gift, in any amount': 'zawadi ya mara moja, kwa kiasi chochote. malipo yanashughulikiwa kwa usalama na <strong>stripe</strong> — respira haioni kadi yako.',
    'suggested contributions toward specific parts': 'michango iliyopendekezwa kwa sehemu maalum za kazi. kila zawadi ni mchango wa jumla kwa respira — haya ni maelezo tu, sio akaunti maalum.',
    'the cost of a reunion mat, given so a community': 'gharama ya mkeka wa muungano, unaotolewa ili nafasi ya jamii iweze kufanya mazoezi juu ya ardhi halisi.',
    'help stand up a respira-powered room': 'saidia kusimamisha chumba kinachotumia respira kwa ajili ya studio au jamii ambayo isingeweza kumudu kimoja.',
    'underwrite a season of free breathing': 'fadhili msimu wa kupumua, mwendo na sauti bure kwa kila mtu anayeingia.',
    'foundations, workplaces and cultural institutions': 'taasisi, mahali pa kazi na taasisi za kiutamaduni zinaweza kufadhili vyumba, mikeka na programu za upatikanaji kwa kiwango kikubwa. andika kwa <a href="mailto:hello@openrespira.org?subject=respira%20partnership">hello@openrespira.org</a> na tutakutumia muhtasari wa ushirikiano. kwa kitu kingine chochote, <a href="/help">ukurasa wa msaada</a> una fomu ya mawasiliano.',
    'contributions keep the servers running': 'michango inaendesha seva, kurekodi sauti na kuweka zana wazi kwa kila mtu.',
    'keep the room free': 'weka chumba <em>bure.</em>',
    'secured by stripe': 'imelindwa na stripe · mara moja · hauhitaji akaunti',
    // ── shelf ──
    'from the room, into your hands': 'kutoka chumbani, mikononi mwako.',
    'print-ready posters in eight mother tongues': 'mabango tayari kuchapishwa katika lugha nane za asili, na vitu vizuri vilivyotengenezwa kwa uangalifu. kila ununuzi unaweka chumba bure.',
    'choose a phrase, eight mother tongues, your co': 'chagua kauli, lugha nane za asili, rangi zako. pakua bure — au chenye fremu na kutumwa.',
    'a grounding mat for the practice': 'mkeka wa mazoezi — uliotengenezwa kwa uangalifu, ujengwe kudumu miaka kumi ya asubuhi.',
    'heavyweight, quiet, soft as a sunday': 'mzito, tulivu, laini kama jumapili — kutoka mkekani hadi sokoni.',
    // ── goods ──
    'a small, considered line': 'mstari mdogo, ulioandaliwa kwa makini — vitu vinavyobeba mazoezi kutoka skrini hadi nafasi inayokuzunguka. kila ununuzi husaidia kuweka chumba cha kupumua bure.',
    'tri-fold vegan suede mat': 'mkeka wa ngozi bandia unaokunjwa mara tatu · mto unaolingana · begi la kubebea',
    'heavyweight hoodie': 'hoodie ya pamba nzito · mwendo = dawa, utulivu = riziki, iliyotafsiriwa mbele na nyuma',
    'your phrase, in eight mother tongues': 'kauli yako, katika lugha nane za asili · rangi zako · karatasi nzito isiyong\'aa, kitambaa kisicho na asidi, fremu ya mbao thabiti',
    // ── voices ──
    'the voice is a companion. lend yours.': 'sauti ni mwenzi. toa yako.',
    'these are the voices that companion the room': 'hizi ni sauti zinazoandamana na chumba, kutoka diaspora yote. je, unaongea lugha ambayo bado hawana? ongeza yako hapa chini.',
    'you don\'t have to be a guide': 'sio lazima uwe mwongozaji. chagua lugha, soma mistari michache kwa sauti — sekunde thelathini hivi — na tutafundisha chumba kuiongea. daima yako, daima unatambuliwa.',
    // ── find ──
    'studios, instructors and community spaces selec': 'studio, wakufunzi na nafasi za jamii zilizochaguliwa kutoka mtandao mzima wa respira — nyingi zikiongozwa na wanawake, watu weusi na jamii, katika afrika, amerika ya kusini, karibiani na diaspora.',
    'tell us about your studio, collective or indepe': 'tuambie kuhusu studio yako, kikundi au mazoezi huru. tunapitia kila wasilisho na kuwasiliana kabla ya kuchapisha — utapata rejeleo la kufuatilia.',
    // ── open floor ──
    'respira\'s sound world is built by artists acros': 'ulimwengu wa sauti wa respira umejengwa na wasanii kutoka diaspora yote. ikiwa unatengeneza muziki, una sauti, au unaendesha mazoezi yanayostahili kushirikiwa — hii ni mlango wako.',
    'send us your work and a little about you': 'tutumie kazi yako na maelezo kidogo kukuhusu. tunasikiliza kila kitu, na tutawasiliana kabla ya kitu chochote kuwa hewani. unabaki na haki zako na daima unatambuliwa.',
    // ── help ──
    'answers to the most common questions': 'majibu ya maswali yanayoulizwa mara kwa mara — na njia ya kuwasiliana na mtu halisi ikiwa bado unahitaji msaada.',
    'check your device isn\'t on silent': 'hakikisha kifaa chako hakiko kimya, na sauti kwenye ukurasa haijazimwa. kwenye iphone, kitufe cha kimwili cha kimya kinaweza kuzima sauti ya wavuti — kizima. gusa kucheza moja kwa moja (vivinjari huzuia sauti hadi utakapoingiliana na ukurasa).',
    'use the install option': 'tumia chaguo la kusakinisha (kuongeza respira kwenye skrini yako ya nyumbani) kwa uchezaji wa nyuma unaotegemewa zaidi. baadhi ya vivinjari vya simu husimamisha sauti ya wavuti wakati kichupo kiko nyuma.',
    'starting a new sound should stop the previous': 'kuanza sauti mpya kunapaswa kusimamisha ile ya awali. ikiwa unasikia mwingiliano, boresha ukurasa — na tuambie hapa chini vyanzo vipi viwili vilivyoingiliana, ili tuweze kukirekebisha.',
    'no — you can build and save a class on your dev': 'hapana — unaweza kuunda na kuhifadhi somo kwenye kifaa chako bila kuingia. akaunti inakuruhusu kudumisha maktaba ya masomo katika vifaa vingi na kuomba chumba chenye chapa.',
    'guest classes are saved in your browser': 'masomo ya wageni yanahifadhiwa kwenye kivinjari chako kwenye kifaa hiki. kufuta data ya tovuti au kubadilisha kivinjari kutayaondoa. kuingia (hivi karibuni katika studio) kutayaweka yakisawazishwa.',
    'respira respects your system\'s reduced-motion': 'respira inaheshimu mpangilio wa mwendo uliopunguzwa wa mfumo wako — michoro inapunguzwa kiotomatiki inapowezeshwa.',
    'controls are keyboard-navigable with visible fo': 'vidhibiti vinaweza kutumika kwa kibodi vikiwa na mwelekeo unaoonekana, na vitufe vya ikoni tu vina lebo za maandishi. ukikuta kizuizi, tuambie hapa chini — marekebisho ya ufikivu yanapewa kipaumbele.',
    'yes — every digital poster format is free': 'ndiyo — kila muundo wa bango la kidijitali ni bure na hupakuliwa mara moja, bila malipo. ni picha zilizowekwa fremu tu (zilizochapishwa na kutumwa) ndizo za malipo.',
    'order receipts come from stripe': 'risiti za maagizo zinatoka kwa stripe. kwa kitu chochote kuhusu hoodie, mkeka au picha yenye fremu, tuandikie hapa chini na barua pepe yako na tutalipata.',
    'we read every message. we\'ll reply to the emai': 'tunasoma kila ujumbe. tutajibu kwenye barua pepe unayoacha — kwa kawaida ndani ya siku chache.'
  };

  var TRANSLATIONS = { es: ES, sw: SW };
  var LONG = { es: ES_LONG, sw: SW_LONG };

  // build a lookup: normalized key (first 60 lowercase chars of textContent) → translated html
  var SKIP_TAGS = {SCRIPT:1, STYLE:1, NOSCRIPT:1, SVG:1, PATH:1, CIRCLE:1, LINE:1, RECT:1, META:1, LINK:1, IFRAME:1, CANVAS:1, IMG:1, BR:1, HR:1, INPUT:1, TEXTAREA:1, SELECT:1, OPTION:1};

  function norm(s){ return (s||'').replace(/\s+/g,' ').trim().toLowerCase(); }
  function normKey(s){ return norm(s).substring(0,60); }

  // ── saved originals for restore ──
  var originals = [];

  function translateElement(el){
    var txt = norm(el.textContent);
    if(!txt || txt.length < 2) return;
    var dict = TRANSLATIONS[currentLang];
    var longDict = LONG[currentLang];
    if(!dict) return;
    // try exact match in short dictionary first
    if(dict[txt]){
      originals.push({el:el, html:el.innerHTML});
      el.textContent = dict[txt];
      return;
    }
    // try long dictionary by prefix
    var prefix = normKey(el.textContent);
    if(longDict[prefix]){
      originals.push({el:el, html:el.innerHTML});
      el.innerHTML = longDict[prefix];
      return;
    }
    // try partial prefix matches (first 50 chars)
    var p50 = prefix.substring(0,50);
    for(var k in longDict){
      if(k.substring(0,50) === p50){
        originals.push({el:el, html:el.innerHTML});
        el.innerHTML = longDict[k];
        return;
      }
    }
  }

  function walkAndTranslate(root){
    if(!root) return;
    var els = root.querySelectorAll('h1, h2, h3, h4, p, summary, span, b, em, a, button, div, label, td, th, li');
    // process leaf-ish elements: those whose textContent is mostly their own
    for(var i=0;i<els.length;i++){
      var el = els[i];
      if(SKIP_TAGS[el.tagName]) continue;
      if(el.closest('script, style, svg, noscript')) continue;
      if(el.hasAttribute('data-i18n') || el.closest('[data-i18n]')) continue;
      // skip elements that are mostly containers of other block elements
      var blockChild = el.querySelector('h1, h2, h3, h4, p, main, section, article, header, footer, nav, details, form');
      if(blockChild && el.tagName !== 'DETAILS') continue;
      translateElement(el);
    }
  }

  function translateDataI18n(){
    var dict = TRANSLATIONS[currentLang];
    if(!dict) return;
    var els = document.querySelectorAll('[data-i18n]');
    for(var i=0;i<els.length;i++){
      var el = els[i];
      var key = norm(el.getAttribute('data-i18n'));
      if(dict[key]){
        if(!el.getAttribute('data-i18n-original')) el.setAttribute('data-i18n-original', el.innerHTML);
        el.textContent = dict[key];
      }
    }
  }

  function restoreDataI18n(){
    var els = document.querySelectorAll('[data-i18n-original]');
    for(var i=0;i<els.length;i++){
      els[i].innerHTML = els[i].getAttribute('data-i18n-original');
      els[i].removeAttribute('data-i18n-original');
    }
  }

  function translatePlaceholders(){
    var dict = TRANSLATIONS[currentLang];
    if(!dict) return;
    var inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    for(var i=0;i<inputs.length;i++){
      var inp = inputs[i];
      var ph = norm(inp.placeholder);
      if(dict[ph]){
        if(!inp.getAttribute('data-ph-orig')) inp.setAttribute('data-ph-orig', inp.placeholder);
        inp.placeholder = dict[ph];
      }
    }
  }

  function restorePlaceholders(){
    var inputs = document.querySelectorAll('[data-ph-orig]');
    for(var i=0;i<inputs.length;i++){
      inputs[i].placeholder = inputs[i].getAttribute('data-ph-orig');
      inputs[i].removeAttribute('data-ph-orig');
    }
  }

  function restoreAll(){
    for(var i=originals.length-1;i>=0;i--){
      originals[i].el.innerHTML = originals[i].html;
    }
    originals = [];
    restoreDataI18n();
    restorePlaceholders();
  }

  function applyTranslations(){
    // always restore to english baseline first, so switching between
    // two non-english languages re-matches the dictionary correctly
    restoreAll();
    if(currentLang !== 'en'){
      walkAndTranslate(document.body);
      translateDataI18n();
      translatePlaceholders();
    }
  }

  function updateSwitcher(){
    var curSpans = document.querySelectorAll('.rh-lang-cur, .door-lang-cur');
    for(var i=0;i<curSpans.length;i++){
      curSpans[i].textContent = currentLang.toUpperCase();
    }
    var opts = document.querySelectorAll('#rhLangMenu a, #doorLangMenu a, #navLangMenu a');
    for(var j=0;j<opts.length;j++){
      var sel = opts[j].getAttribute('data-lang') === currentLang;
      opts[j].style.background = sel ? 'rgba(201,163,106,.18)' : '';
      opts[j].style.color = sel ? '#f7efdd' : '';
    }
  }

  function setLang(lang){
    if(LANGS.indexOf(lang) < 0) lang = 'en';
    currentLang = lang;
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
    document.documentElement.lang = (lang === 'sw') ? 'sw' : lang;
    applyTranslations();
    updateSwitcher();
  }

  function getLang(){ return currentLang; }

  function t(key){
    if(currentLang === 'en') return key;
    var dict = TRANSLATIONS[currentLang];
    if(!dict) return key;
    var k = norm(key);
    if(dict[k]) return dict[k];
    return key;
  }

  window.respiraToggleLang = function(){
    var idx = LANGS.indexOf(currentLang);
    setLang(LANGS[(idx+1) % LANGS.length]);
  };
  window.respiraT = t;
  window.respiraLang = getLang;
  window.respiraSetLang = setLang;
  window.respiraLangLabel = function(lang){ return LANG_LABEL[lang] || lang; };

  function init(){
    if(currentLang !== 'en'){
      document.documentElement.lang = currentLang;
      // delay slightly so chrome.js has time to inject
      setTimeout(function(){ applyTranslations(); updateSwitcher(); }, 80);
    }
    updateSwitcher();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
