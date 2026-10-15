// Script del sito: nessuna libreria. Ogni funzione agisce solo sugli elementi che trova;
// senza JavaScript la pagina si legge tutta lo stesso.

// Le parti delle sezioni entrano quando arrivano sullo schermo (Task 11).
function avviaEntrate() {}

// Il percorso del mentoring: una tappa aperta alla volta (Task 5).
function avviaPercorso(ol) {}

// Il token che percorre le tappe di PrendiNota (Task 12).
function avviaToken(ol) {}

// I video partono quando si vedono e si fermano quando escono (Task 11).
function avviaVideo() {}

avviaEntrate();
document.querySelectorAll('ol[data-percorso]').forEach(avviaPercorso);
document.querySelectorAll('ol[data-token]').forEach(avviaToken);
avviaVideo();
