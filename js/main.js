/* Amélioration progressive : le site reste entièrement lisible sans JavaScript. */
(function () {
  "use strict";

  var EN = document.documentElement.lang === "en";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Année du pied de page */
  var an = document.getElementById("annee");
  if (an) { an.textContent = String(new Date().getFullYear()); }

  /* Menu hamburger */
  var barre = document.getElementById("barre");
  var bouton = document.getElementById("menu-btn");
  var menu = document.getElementById("menu");
  function fermer(rendreFocus) {
    if (!barre) { return; }
    barre.classList.remove("ouvert");
    if (bouton) {
      bouton.setAttribute("aria-expanded", "false");
      bouton.setAttribute("aria-label", EN ? "Open the menu" : "Ouvrir le menu");
      if (rendreFocus) { bouton.focus(); }
    }
  }
  if (barre && bouton && menu) {
    bouton.addEventListener("click", function () {
      var ouvert = barre.classList.toggle("ouvert");
      bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
      bouton.setAttribute("aria-label", ouvert ? (EN ? "Close the menu" : "Fermer le menu") : (EN ? "Open the menu" : "Ouvrir le menu"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) { fermer(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && barre.classList.contains("ouvert")) { fermer(true); }
    });
    document.addEventListener("click", function (e) {
      if (barre.classList.contains("ouvert") && !barre.contains(e.target)) { fermer(false); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180) { fermer(false); } });
  }

  /* Personnages : cartes ouvertes sur ordinateur, liste dépliable sur mobile */
  var fiches = Array.prototype.slice.call(document.querySelectorAll("details.perso"));
  if (fiches.length && window.matchMedia) {
    var mobile = window.matchMedia("(max-width: 640px)");
    var synchroniser = function () {
      fiches.forEach(function (d) {
        if (mobile.matches) { d.removeAttribute("open"); } else { d.setAttribute("open", ""); }
      });
    };
    synchroniser();
    if (mobile.addEventListener) { mobile.addEventListener("change", synchroniser); }
    fiches.forEach(function (d) {
      var s = d.querySelector("summary");
      if (s) {
        s.addEventListener("click", function (e) { if (!mobile.matches) { e.preventDefault(); } });
      }
      d.addEventListener("toggle", function () {
        if (mobile.matches && d.open) {
          fiches.forEach(function (autre) { if (autre !== d) { autre.removeAttribute("open"); } });
        }
      });
    });
  }

  /* Partage WhatsApp : l'adresse de la page de présentation est calculée à l'ouverture */
  var partages = document.querySelectorAll("[data-partage]");
  if (partages.length && location.protocol.indexOf("http") === 0) {
    Array.prototype.forEach.call(partages, function (a) {
      var racine = new URL(a.getAttribute("data-racine") || "./", location.href).href;
      var texte = a.getAttribute("data-texte") || "";
      a.href = "https://wa.me/?text=" + encodeURIComponent(texte + "\n" + racine);
    });
  }

  /* Boutons « Copier » (numéros de soutien) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-copie]"), function (b) {
    b.addEventListener("click", function () {
      var valeur = b.getAttribute("data-copie"), libelle = b.textContent;
      var fini = function () { b.classList.add("ok"); b.textContent = EN ? "Copied ✓" : "Copié ✓"; setTimeout(function () { b.classList.remove("ok"); b.textContent = libelle; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(valeur).then(fini, function () {}); }
      else {
        var t = document.createElement("textarea"); t.value = valeur; t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select(); try { document.execCommand("copy"); fini(); } catch (e) { /* copie impossible */ } document.body.removeChild(t);
      }
    });
  });

  /* Apparition douce au défilement */
  var cibles = document.querySelectorAll(".reveler");
  if ("IntersectionObserver" in window && !reduit) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    Array.prototype.forEach.call(cibles, function (c) { obs.observe(c); });
  } else {
    Array.prototype.forEach.call(cibles, function (c) { c.classList.add("visible"); });
  }

  /* Lien actif dans la navigation */
  var liens = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = liens.map(function (l) { return document.querySelector(l.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var suivi = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) {
          liens.forEach(function (l) { l.classList.toggle("actif", l.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { suivi.observe(s); });
  }
})();
