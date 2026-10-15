// Script del sito: nessuna libreria. Ogni funzione agisce solo sugli elementi che trova;
// senza JavaScript la pagina si legge tutta lo stesso.

// Le parti delle sezioni entrano quando arrivano sullo schermo (Task 11).
function avviaEntrate() {}

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

// I video partono quando si vedono e si fermano quando escono (Task 11).
function avviaVideo() {}

avviaEntrate();
document.querySelectorAll('ol[data-percorso]').forEach(avviaPercorso);
document.querySelectorAll('ol[data-token]').forEach(avviaToken);
avviaVideo();
