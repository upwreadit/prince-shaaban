/* Pages de lecture : taille du texte, thème, barre de progression.
   Les choix sont gardés uniquement dans le navigateur du lecteur (localStorage). */
(function () {
  "use strict";
  var racine = document.documentElement;
  var TAILLES = [0.9, 1, 1.1, 1.2, 1.3];
  var THEMES = ["sombre", "sepia", "clair"];
  var POLICES = ["sans", "serif"];

  function lire(cle, defaut) { try { var v = localStorage.getItem(cle); return v === null ? defaut : v; } catch (e) { return defaut; } }
  function ecrire(cle, val) { try { localStorage.setItem(cle, String(val)); } catch (e) { /* stockage indisponible */ } }

  var texte = document.getElementById("lecture");
  var idx = parseInt(lire("ps-taille", "1"), 10);
  if (isNaN(idx) || idx < 0 || idx >= TAILLES.length) { idx = 1; }
  var police = lire("ps-police", "sans");
  if (POLICES.indexOf(police) < 0) { police = "sans"; }
  var theme = lire("ps-theme", "sombre");
  if (THEMES.indexOf(theme) < 0) { theme = "sombre"; }

  function appliquer() {
    if (texte) { texte.style.setProperty("--lt", TAILLES[idx]); }
    racine.setAttribute("data-theme", theme);
    if (texte) { texte.setAttribute("data-police", police); }
    Array.prototype.forEach.call(document.querySelectorAll("[data-police-btn]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-police-btn") === police ? "true" : "false");
    });
    var moins = document.getElementById("taille-moins"), plus = document.getElementById("taille-plus");
    if (moins) { moins.disabled = idx === 0; moins.style.opacity = idx === 0 ? 0.4 : 1; }
    if (plus) { plus.disabled = idx === TAILLES.length - 1; plus.style.opacity = idx === TAILLES.length - 1 ? 0.4 : 1; }
    Array.prototype.forEach.call(document.querySelectorAll("[data-theme-btn]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-theme-btn") === theme ? "true" : "false");
    });
  }

  var moins = document.getElementById("taille-moins"), plus = document.getElementById("taille-plus");
  if (moins) { moins.addEventListener("click", function () { if (idx > 0) { idx--; ecrire("ps-taille", idx); appliquer(); } }); }
  if (plus) { plus.addEventListener("click", function () { if (idx < TAILLES.length - 1) { idx++; ecrire("ps-taille", idx); appliquer(); } }); }
  Array.prototype.forEach.call(document.querySelectorAll("[data-theme-btn]"), function (b) {
    b.addEventListener("click", function () { theme = b.getAttribute("data-theme-btn"); ecrire("ps-theme", theme); appliquer(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-police-btn]"), function (b) {
    b.addEventListener("click", function () { police = b.getAttribute("data-police-btn"); ecrire("ps-police", police); appliquer(); });
  });
  appliquer();

  /* Barre de progression de lecture */
  var barre = document.getElementById("avance-lecture");
  if (barre && texte) {
    var attente = false;
    var maj = function () {
      attente = false;
      var r = texte.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var fait = Math.min(Math.max(-r.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      barre.style.width = (total > 0 ? (fait / total) * 100 : 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", function () { if (!attente) { attente = true; requestAnimationFrame(maj); } }, { passive: true });
    window.addEventListener("resize", maj);
    maj();
  }

  /* Titre compact dans la barre dès que le grand titre du chapitre a défilé */
  var bar = document.getElementById("barre"), grandTitre = document.querySelector(".chap-tete h1");
  if (bar && grandTitre && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entrees) {
      var e = entrees[0];
      bar.classList.toggle("titre-compact", !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: "-70px 0px 0px 0px", threshold: 0 }).observe(grandTitre);
  }

  /* Partage WhatsApp : adresse de la page de présentation calculée à l'ouverture */
  Array.prototype.forEach.call(document.querySelectorAll("[data-partage]"), function (a) {
    if (location.protocol.indexOf("http") !== 0) { return; }
    var base = new URL(a.getAttribute("data-racine") || "../", location.href).href;
    a.href = "https://wa.me/?text=" + encodeURIComponent((a.getAttribute("data-texte") || "") + "\n" + base);
  });
})();
