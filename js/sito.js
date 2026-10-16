// Script del sito: nessuna libreria. Ogni funzione agisce solo sugli elementi che trova;
// senza JavaScript la pagina si legge tutta lo stesso.

const movimentoRidotto = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Le parti delle sezioni entrano quando arrivano sullo schermo, una volta sola.
// Quelle che arrivano insieme si sfalsano tra loro (--n; --i è del flusso del mentoring); il CSS le nasconde solo sotto .js.
function avviaEntrate() {
  // Le parti si nascondono solo da qui in poi: se lo script non arriva, restano visibili.
  document.documentElement.classList.add('entrate');
  const parti = [...document.querySelectorAll('[data-entra]')];
  const entra = (lista) => lista.forEach((el, n) => { el.style.setProperty('--n', n); el.classList.add('is-in'); });
  if (!('IntersectionObserver' in window)) { entra(parti); return; }
  const osservatori = [];
  const arriva = (voci) => {
    const arrivate = voci.filter((v) => v.isIntersecting && !v.target.classList.contains('is-in')).map((v) => v.target);
    arrivate.forEach((el) => osservatori.forEach((o) => o.unobserve(el)));
    entra(arrivate);
  };
  // Entra quando supera il 12% più basso dello schermo; oppure quando si vede tutto, anche lì:
  // in fondo alla pagina quella fascia non si supera più scorrendo.
  osservatori.push(new IntersectionObserver(arriva, { rootMargin: '0px 0px -12% 0px' }));
  osservatori.push(new IntersectionObserver(arriva, { threshold: 1 }));
  parti.forEach((el) => osservatori.forEach((o) => o.observe(el)));
  // Dopo il caricamento entra comunque quello che è già sullo schermo.
  addEventListener('load', () => {
    const ferme = parti.filter((el) => !el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight);
    ferme.forEach((el) => osservatori.forEach((o) => o.unobserve(el)));
    entra(ferme);
  });
}

// Il percorso del mentoring: una tappa aperta alla volta, e il token sulla tappa aperta.
// Nell'HTML tutti i pezzi sono visibili; li nasconde solo questo script.
// Il passaggio da una tappa all'altra (Michele, 16/10: niente stacco): su computer il pezzo nuovo
// entra scorrendo dal lato della tappa scelta e il vecchio esce dall'altro; sul telefono il nuovo
// si apre morbido sotto la sua tappa mentre il vecchio si chiude, e col dito si passa alla tappa accanto.
function avviaPercorso(ol) {
  const pulsanti = [...ol.querySelectorAll('button[aria-controls]')];
  const pezzi = pulsanti.map((b) => document.getElementById(b.getAttribute('aria-controls')));
  const computer = matchMedia('(min-width: 1100px)'); // come nel CSS
  const curva = 'cubic-bezier(0.32, 0.72, 0, 1)'; // si apre subito e si posa piano
  const scivola = 'cubic-bezier(0.4, 0, 0.2, 1)'; // per attraversare tutta la larghezza: parte morbida, poi rallenta a lungo
  let aperta = -1;
  let inCorso = null; // il passaggio che si sta animando

  // Un passaggio nuovo porta subito alla fine quello di prima.
  const interrompi = () => {
    if (!inCorso) return;
    const { animazioni, fine } = inCorso;
    inCorso = null;
    animazioni.forEach((a) => a.cancel());
    fine();
  };
  const anima = (animazioni, fine) => {
    const questo = { animazioni, fine };
    inCorso = questo;
    Promise.all(animazioni.map((a) => a.finished)).then(() => {
      if (inCorso !== questo) return;
      inCorso = null;
      fine();
    }, () => {});
  };

  // Computer: i due pezzi stanno nella stessa cella e scorrono insieme di tutta la larghezza,
  // mentre l'altezza della lista va da quella del vecchio a quella del nuovo, tagliando il resto.
  const alto = (el) => el.getBoundingClientRect().height; // con i decimali: offsetHeight arrotonda e la lista scatterebbe di mezzo pixel
  const scorri = (vecchio, nuovo, verso) => {
    const da = alto(ol);
    vecchio.hidden = true;
    nuovo.hidden = false;
    const a = alto(ol);
    vecchio.hidden = false;
    ol.style.overflowY = 'clip'; // in orizzontale no: i pezzi escono fino al bordo dello schermo
    const tempi = { duration: 560, easing: scivola };
    anima([
      ol.animate([{ height: `${da}px` }, { height: `${a}px` }], tempi),
      vecchio.animate([{ transform: 'none' }, { transform: `translateX(${-verso * 100}%)` }], tempi),
      nuovo.animate([{ transform: `translateX(${verso * 100}%)` }, { transform: 'none' }], tempi),
    ], () => {
      vecchio.hidden = true;
      ol.style.overflowY = '';
    });
  };

  // Telefono: il vecchio si chiude, il nuovo si apre entrando appena dal lato del verso; a ogni
  // fotogramma la pagina scorre quanto serve per tenere ferma la tappa di riferimento. Lo scorrimento
  // va a pixel interi: il vecchio (l'unico che può stare sopra la tappa ferma) si chiude a pixel
  // interi anche lui, calcolato qui, altrimenti la tappa tremerebbe di mezzo pixel.
  const apriMorbido = (vecchio, nuovo, verso, ferma) => {
    const prima = ferma.getBoundingClientRect().top;
    const segui = () => {
      const scarto = ferma.getBoundingClientRect().top - prima;
      if (scarto) window.scrollBy(0, scarto);
    };
    nuovo.hidden = false;
    const misure = (p) => {
      const s = getComputedStyle(p);
      return { height: alto(p), paddingTop: parseFloat(s.paddingTop), paddingBottom: parseFloat(s.paddingBottom) };
    };
    const [daVecchio, aNuovo] = [misure(vecchio), misure(nuovo)];
    const durata = 420;
    const esce = (t) => 1 - (1 - t) ** 3; // la curva qui sotto, per l'altezza del vecchio
    const tempi = { duration: durata, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };
    vecchio.style.overflowY = nuovo.style.overflowY = 'clip';
    document.documentElement.style.overflowAnchor = 'none'; // la pagina la tiene ferma lo script, non il browser
    const chiude = vecchio.animate([{ opacity: 1 }, { opacity: 0 }], tempi);
    const animazioni = [
      chiude,
      nuovo.animate([
        { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, transform: `translateX(${verso * 24}px)` },
        { height: `${aNuovo.height}px`, paddingTop: `${aNuovo.paddingTop}px`, paddingBottom: `${aNuovo.paddingBottom}px`, opacity: 1, transform: 'none' },
      ], tempi),
    ];
    const resta = () => {
      const r = 1 - esce(Math.min(1, (chiude.currentTime ?? 0) / durata));
      vecchio.style.height = `${Math.round(daVecchio.height * r)}px`;
      vecchio.style.paddingTop = `${Math.round(daVecchio.paddingTop * r)}px`;
      vecchio.style.paddingBottom = `${Math.round(daVecchio.paddingBottom * r)}px`;
    };
    anima(animazioni, () => {
      vecchio.hidden = true;
      for (const p of [vecchio, nuovo]) p.style.overflowY = '';
      for (const k of ['height', 'paddingTop', 'paddingBottom']) vecchio.style[k] = '';
      segui();
      document.documentElement.style.overflowAnchor = '';
    });
    const passo = () => {
      if (inCorso?.animazioni !== animazioni) return;
      resta();
      segui();
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  // ferma: la tappa che resta dov'è sullo schermo (quella toccata, sotto il dito).
  const apri = (i, ferma = pulsanti[i]) => {
    if (i === aperta) return;
    interrompi();
    const [vecchio, nuovo] = [pezzi[aperta], pezzi[i]];
    const verso = i > aperta ? 1 : -1;
    pulsanti.forEach((b, j) => b.setAttribute('aria-expanded', String(j === i)));
    ol.style.setProperty('--tappa-attiva', i);
    aperta = i;
    if (!vecchio) { pezzi.forEach((p) => { p.hidden = p !== nuovo; }); return; }
    if (movimentoRidotto) {
      // Niente movimento: il pezzo cambia sul posto e compare in dissolvenza.
      const prima = ferma.getBoundingClientRect().top;
      vecchio.hidden = true;
      nuovo.hidden = false;
      window.scrollBy(0, ferma.getBoundingClientRect().top - prima);
      nuovo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      return;
    }
    if (computer.matches) scorri(vecchio, nuovo, verso);
    else apriMorbido(vecchio, nuovo, verso, ferma);
  };
  pulsanti.forEach((b, i) => b.addEventListener('click', () => apri(i)));

  // Col dito: un passaggio deciso in orizzontale sul pezzo aperto porta alla tappa accanto
  // (verso sinistra quella dopo, verso destra quella prima). Resta ferma la più in alto delle due.
  let inizio = null;
  ol.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    inizio = e.touches.length === 1 && e.target.closest('.pezzo') ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  ol.addEventListener('touchcancel', () => { inizio = null; }, { passive: true });
  ol.addEventListener('touchend', (e) => {
    if (!inizio) return;
    const t = e.changedTouches[0];
    const [dx, dy] = [t.clientX - inizio.x, t.clientY - inizio.y];
    inizio = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const i = aperta + (dx < 0 ? 1 : -1);
    if (i >= 0 && i < pulsanti.length) apri(i, pulsanti[Math.min(i, aperta)]);
  }, { passive: true });

  apri(0);
}

// Il token che percorre le tappe di PrendiNota: una tappa è raggiunta quando il suo titolo
// supera la metà dello schermo; il pallino va sul simbolo dell'ultima raggiunta e il flusso
// si colora fin lì (--avanzamento, da 0 a 1). Niente ascolto dello scorrimento: un osservatore.
function avviaToken(ol) {
  if (movimentoRidotto || !('IntersectionObserver' in window)) return;
  const tappe = [...ol.children];
  ol.classList.add('token-attivo'); // la tendina dei diagrammi vale solo con il token in funzione
  const token = document.createElement('span');
  token.className = 'token';
  token.setAttribute('aria-hidden', 'true');
  tappe[0].append(token); // dentro una <ol> solo <li>; la prima tappa parte dall'angolo della lista
  const sposta = () => {
    const raggiunte = tappe.filter((li) => li.classList.contains('is-raggiunta'));
    const ultima = raggiunte.at(-1);
    ol.classList.toggle('in-cammino', Boolean(ultima));
    if (!ultima) { ol.style.setProperty('--avanzamento', 0); return; }
    const base = ol.getBoundingClientRect();
    const s = ultima.querySelector('.simbolo').getBoundingClientRect();
    const y = s.top + s.height / 2 - base.top;
    ol.style.setProperty('--token-x', `${s.left + s.width / 2 - base.left}px`);
    ol.style.setProperty('--token-y', `${y}px`);
    ol.style.setProperty('--avanzamento', (y / base.height).toFixed(4));
  };
  // A ogni scatto si ricontano tutte le tappe: uno scorrimento a salti può portare un titolo
  // sopra lo schermo senza che l'osservatore lo veda passare dalla metà.
  const aggiorna = () => {
    for (const li of tappe) {
      li.classList.toggle('is-raggiunta', li.querySelector('.tappa-pn__nome').getBoundingClientRect().top < innerHeight / 2);
    }
    sposta();
  };
  const meta = new IntersectionObserver(aggiorna, { rootMargin: '0px 0px -50% 0px' });
  tappe.forEach((li) => meta.observe(li.querySelector('.tappa-pn__nome')));
  new IntersectionObserver(aggiorna, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.3] }).observe(ol); // la lista è alta più schermi: rapporti piccoli
  addEventListener('resize', sposta);
}

// I video partono quando se ne vede almeno metà e si fermano quando escono.
// Con il movimento ridotto non partono mai: resta la copertina con i comandi.
function avviaVideo() {
  const video = document.querySelectorAll('video[data-auto]');
  if (movimentoRidotto || !video.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((voci) => {
    for (const { target: v, isIntersecting } of voci) {
      if (isIntersecting) { if (!v.dataset.fermato) v.play().catch(() => {}); }
      else if (!v.paused) { v.dataset.nostra = '1'; v.pause(); }
    }
  }, { threshold: 0.5 });
  video.forEach((v) => {
    // Una pausa che non è nostra è di chi guarda: il video riparte solo se lo riavvia lui.
    v.addEventListener('pause', () => { if (v.dataset.nostra) delete v.dataset.nostra; else v.dataset.fermato = '1'; });
    v.addEventListener('play', () => { delete v.dataset.fermato; });
    io.observe(v);
  });
}

// Pulsanti: al passaggio la scritta esce in alto e una copia identica entra dal basso.
// La copia è nascosta ai lettori di schermo; senza script il pulsante resta com'è.
function avviaPulsanti() {
  document.querySelectorAll('.pulsante').forEach((p) => {
    const nodi = [...p.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!nodi.length) return;
    const scritta = document.createElement('span');
    scritta.className = 'scritta';
    const vera = document.createElement('span');
    vera.textContent = nodi.map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    const copia = vera.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    scritta.append(vera, copia);
    nodi.forEach((n) => n.remove());
    p.prepend(scritta);
  });
}

avviaPulsanti();
avviaEntrate();
document.querySelectorAll('ol[data-percorso]').forEach(avviaPercorso);
document.querySelectorAll('ol[data-token]').forEach(avviaToken);
avviaVideo();
