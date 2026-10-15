// Script del sito: nessuna libreria. Ogni funzione agisce solo sugli elementi che trova;
// senza JavaScript la pagina si legge tutta lo stesso.

const movimentoRidotto = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Le parti delle sezioni entrano quando arrivano sullo schermo, una volta sola.
// Quelle che arrivano insieme si sfalsano tra loro (--n; --i è del flusso del mentoring); il CSS le nasconde solo sotto .js.
function avviaEntrate() {
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
function avviaPercorso(ol) {
  const pulsanti = [...ol.querySelectorAll('button[aria-controls]')];
  const apri = (scelto) => {
    pulsanti.forEach((b, i) => {
      const aperto = b === scelto;
      b.setAttribute('aria-expanded', String(aperto));
      document.getElementById(b.getAttribute('aria-controls')).hidden = !aperto;
      if (aperto) ol.style.setProperty('--tappa-attiva', i);
    });
  };
  pulsanti.forEach((b) => b.addEventListener('click', () => {
    // Sul telefono il pezzo aperto sopra si chiude: la tappa scelta resta sotto il dito.
    const prima = b.getBoundingClientRect().top;
    apri(b);
    window.scrollBy(0, b.getBoundingClientRect().top - prima);
  }));
  apri(pulsanti[0]);
}

// Il token che percorre le tappe di PrendiNota (Task 12).
function avviaToken(ol) {}

// I video partono quando se ne vede almeno metà e si fermano quando escono.
// Con il movimento ridotto non partono mai: resta la copertina con i comandi.
function avviaVideo() {
  const video = document.querySelectorAll('video[data-auto]');
  if (movimentoRidotto || !video.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (v.isIntersecting) v.target.play().catch(() => {});
      else v.target.pause();
    }
  }, { threshold: 0.5 });
  video.forEach((v) => io.observe(v));
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
