/* deck.js — shared toolbox + slideshow controller (dlt / Python Brasil 2026).
   Per-slide markup and choreography live in compositions/NN-*.html; each slide
   registers via HW.scene(id, {prep, fire}). prep runs at registration (the
   runtime mounts the slide content before running its script), fire runs when
   the controller activates the slide. */
window.HW = window.HW || {};

/* shared toolbox — global on purpose: slide scripts call these by name */
function hwHash(n, seed) {
  var x = Math.sin(n * 127.1 + (seed || 1) * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function hwWobbleRect(w, h, r, seed, amp) {
  amp = amp === undefined ? 4 : amp;
  function wob(n) { return hwHash(n, seed) * amp; }
  var d = "M " + (r + wob(1)) + " " + wob(2);
  d += " L " + (w / 2 + wob(3)) + " " + wob(4);
  d += " L " + (w - r + wob(5)) + " " + wob(6);
  d += " Q " + (w + wob(7)) + " " + wob(8) + " " + (w + wob(9)) + " " + (r + wob(10));
  d += " L " + (w + wob(11)) + " " + (h / 2 + wob(12));
  d += " L " + (w + wob(13)) + " " + (h - r + wob(14));
  d += " Q " + (w + wob(15)) + " " + (h + wob(16)) + " " + (w - r + wob(17)) + " " + (h + wob(18));
  d += " L " + (w / 2 + wob(19)) + " " + (h + wob(20));
  d += " L " + (r + wob(21)) + " " + (h + wob(22));
  d += " Q " + wob(23) + " " + (h + wob(24)) + " " + wob(25) + " " + (h - r + wob(26));
  d += " L " + wob(27) + " " + (h / 2 + wob(28));
  d += " L " + wob(29) + " " + (r + wob(30));
  d += " Q " + wob(31) + " " + wob(32) + " " + (r + wob(33)) + " " + wob(34);
  return d;
}

function hwWobblePoly(points, seed, amp) {
  amp = amp === undefined ? 3 : amp;
  function wob(i) { return hwHash(i, seed) * amp; }
  var d = "";
  for (var i = 0; i < points.length; i++) {
    var x = points[i][0] + wob(i * 2 + 1);
    var y = points[i][1] + wob(i * 2 + 2);
    d += (i === 0 ? "M " : " L ") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}

function hwWobbleBoxPath(x, y, w, h, seed, amp) {
  var pts = [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2],
             [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]];
  return hwWobblePoly(pts, seed, amp) + " Z";
}

function hwWobbleEllipse(cx, cy, rx, ry, seed, amp, steps, a0, a1) {
  steps = steps === undefined ? 16 : steps;
  a0 = a0 === undefined ? 0 : a0;
  a1 = a1 === undefined ? Math.PI * 2 : a1;
  amp = amp === undefined ? 3 : amp;
  function wob(i) { return hwHash(i, seed) * amp; }
  var d = "";
  for (var i = 0; i <= steps; i++) {
    var t = a0 + (a1 - a0) * (i / steps);
    var x = cx + Math.cos(t) * rx + wob(i * 2 + 1);
    var y = cy + Math.sin(t) * ry + wob(i * 2 + 2);
    d += (i === 0 ? "M " : " L ") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}

function hwWobbleCircle(cx, cy, r, seed, amp, steps) {
  return hwWobbleEllipse(cx, cy, r, r, seed, amp, steps, 0, Math.PI * 2) + " Z";
}

/* Ponta canônica do deck: 17px de profundidade, ±10 de largura, stroke 4.
   É a geometria das setas diretas do slide 22, e vale para todo arrowhead.
   Os três helpers abaixo (e as pontas desenhadas à mão em 19 e 21) se encaixam
   nela; a exceção é a ponta preenchida da timeline do whoami (slide 2), que é
   terminador de barra, não seta de fluxo. */
var HW_HEAD_DEPTH = 17, HW_HEAD_HALF = 10;
/* folga entre a ponta de uma seta e a caixa que ela encosta — a do slide
   dlt.pipeline (flow-arr: margin 4px + inset 2px do traço). todo par
   caixa↔seta do deck usa este valor. */
var HW_ARROW_GAP = 6;

function hwConnector(x1, y, x2, seed) {
  var amp = 2;
  function wob(i) { return hwHash(i, seed) * amp; }
  var mid = (x1 + x2) / 2;
  var d = "M " + x1 + " " + (y + wob(1))
        + " Q " + (mid + wob(2)) + " " + (y + wob(3)) + " " + (x2 - HW_HEAD_DEPTH + wob(4)) + " " + (y + wob(5))
        + " M " + x2 + " " + (y + wob(6))
        + " L " + (x2 - HW_HEAD_DEPTH + wob(7)) + " " + (y - HW_HEAD_HALF + wob(8))
        + " M " + x2 + " " + (y + wob(9))
        + " L " + (x2 - HW_HEAD_DEPTH + wob(10)) + " " + (y + HW_HEAD_HALF + wob(11));
  return d;
}

function hwArrowDown(x, y1, y2, seed, gap) {
  var amp = 1.5;
  function wob(i) { return hwHash(i, seed) * amp; }
  var head = y2 - HW_HEAD_DEPTH;
  var d = "M " + (x + wob(1)) + " " + (y1 + wob(2));
  d += " L " + (x + wob(3)) + " " + ((gap ? gap[0] : head) + wob(4));
  if (gap && gap[1] < head - 1) {
    d += " M " + (x + wob(5)) + " " + (gap[1] + wob(6));
    d += " L " + (x + wob(7)) + " " + (head + wob(8));
  }
  d += " M " + (x + wob(9)) + " " + (y2 + wob(10));
  d += " L " + (x - HW_HEAD_HALF + wob(11)) + " " + (head + wob(12));
  d += " M " + (x + wob(13)) + " " + (y2 + wob(14));
  d += " L " + (x + HW_HEAD_HALF + wob(15)) + " " + (head + wob(16));
  return d;
}

function hwLink(x1, y1, x2, y2, seed) {
  var amp = 2;
  function wob(i) { return hwHash(i, seed) * amp; }
  var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return "M " + x1 + " " + (y1 + wob(1))
    + " Q " + (mx + wob(2)) + " " + (my + wob(3)) + " " + (x2 + wob(4)) + " " + (y2 + wob(5));
}

/* Seta de fluxo horizontal: corpo tracejado que marcha + ponta sólida canônica.
   O "8 12" tem período de 20px, então o tween de -20 fecha o loop sem emenda.
   Devolve {body, head}; quem chama anima com hwFlowMarch(body). */
function hwFlowArrow(svg, x1, y, x2, seed, color) {
  var amp = 2;
  function wob(i) { return hwHash(i, seed) * amp; }
  var mid = (x1 + x2) / 2;
  var body = makeStrokedPath(svg,
    "M " + x1 + " " + (y + wob(1))
    + " Q " + (mid + wob(2)) + " " + (y + wob(3)) + " " + (x2 - HW_HEAD_DEPTH + wob(4)) + " " + (y + wob(5)),
    4, color);
  body.setAttribute("class", "flow-dash");
  body.style.strokeDasharray = "8 12";
  body.style.strokeDashoffset = "0";
  var head = makeStrokedPath(svg,
    "M " + x2 + " " + (y + wob(6))
    + " L " + (x2 - HW_HEAD_DEPTH + wob(7)) + " " + (y - HW_HEAD_HALF + wob(8))
    + " M " + x2 + " " + (y + wob(9))
    + " L " + (x2 - HW_HEAD_DEPTH + wob(10)) + " " + (y + HW_HEAD_HALF + wob(11)),
    4, color);
  head.setAttribute("class", "flow-head");
  head.style.strokeDasharray = "none";
  head.style.strokeDashoffset = "0";
  return { body: body, head: head };
}

function hwFlowMarch(bodies) {
  if (!bodies || !bodies.length) return;
  gsap.to(bodies, { strokeDashoffset: "-=20", duration: 1.1, repeat: -1, ease: "none" });
}

function hwArrowDownRight(seed) {
  var amp = 1.5;
  function wob(i) { return hwHash(i, seed) * amp; }
  var tipX = 33, tipY = 27, armX = tipX - HW_HEAD_DEPTH;
  var d = "M " + (9 + wob(1)) + " " + (7 + wob(2));
  d += " L " + (9 + wob(3)) + " " + (tipY + wob(4));
  d += " L " + (armX + wob(5)) + " " + (tipY + wob(6));
  d += " M " + (tipX + wob(7)) + " " + (tipY + wob(8));
  d += " L " + (armX + wob(9)) + " " + (tipY - HW_HEAD_HALF + wob(10));
  d += " M " + (tipX + wob(11)) + " " + (tipY + wob(12));
  d += " L " + (armX + wob(13)) + " " + (tipY + HW_HEAD_HALF + wob(14));
  return d;
}

function setDrawHidden(el, sw) {
  var len = el.getTotalLength();
  var w = sw == null ? 7 : sw;
  var hide = len + w;
  el.setAttribute("data-hideoff", hide.toFixed(2));
  el.style.strokeDasharray = len.toFixed(2) + " " + (len + 2 * w).toFixed(2);
  el.style.strokeDashoffset = hide.toFixed(2);
}

/* Um traço "8 12" não se desenha girando o offset (só marcha os tracejinhos):
   o dasharray repete. Para a seta ser DESenhada, um traço branco do mesmo
   caminho se desenha dentro de um mask e vai liberando o tracejado por baixo.
   É o par natural do hwFlowArrow, que sobrescreve o dasharray para "8 12" e
   apaga o draw-in do makeStrokedPath. Devolve o id do mask. */
function revelaTracejado(svg, d, w, cls) {
  var SVGN = "http://www.w3.org/2000/svg";
  var id = "rv" + Math.random().toString(36).slice(2, 8);
  var defs = document.createElementNS(SVGN, "defs");
  var mask = document.createElementNS(SVGN, "mask");
  mask.setAttribute("id", id);
  /* maskUnits em userSpaceOnUse, com região explícita. no padrão
     (objectBoundingBox) a região é -10%..120% do bbox do objeto, e para uma
     linha horizontal o bbox tem altura 0: a máscara recortava o stroke pela
     metade (2px onde o traço tem 4). */
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("x", "-200");
  mask.setAttribute("y", "-200");
  mask.setAttribute("width", "6000");
  mask.setAttribute("height", "3000");
  var rv = document.createElementNS(SVGN, "path");
  rv.setAttribute("class", cls || "flow-reveal");
  rv.setAttribute("d", d);
  rv.setAttribute("stroke", "#fff");
  rv.setAttribute("stroke-width", w);
  rv.setAttribute("fill", "none");
  rv.setAttribute("stroke-linecap", "round");
  rv.setAttribute("stroke-linejoin", "round");
  setDrawHidden(rv, w);
  mask.appendChild(rv);
  defs.appendChild(mask);
  svg.insertBefore(defs, svg.firstChild);
  return id;
}

function pmapIconPaths(type, seed) {
  var A = 1;
  var shapes = [];
  if (type === "api") {
    shapes.push({ d: hwWobbleCircle(60, 60, 44, seed, A, 20) });
    shapes.push({ d: hwWobbleEllipse(60, 60, 18, 44, seed + 1, A, 18, 0, Math.PI * 2) + " Z" });
    shapes.push({ d: hwWobblePoly([[16, 60], [104, 60]], seed + 2, A) });
  } else if (type === "sheet") {
    shapes.push({ d: hwWobbleBoxPath(18, 26, 84, 68, seed, A) });
    shapes.push({ d: hwWobblePoly([[18,47],[60,46],[102,47]], seed + 1, A) });
    shapes.push({ d: hwWobblePoly([[46,47],[46,94]], seed + 2, A) });
    shapes.push({ d: hwWobblePoly([[74,47],[74,94]], seed + 3, A) });
  } else if (type === "db") {
    shapes.push({ d: hwWobbleEllipse(60, 22, 44, 10, seed, A, 16, 0, Math.PI * 2) + " Z" });
    shapes.push({ d: hwWobblePoly([[16,22],[16,92]], seed + 1, A) });
    shapes.push({ d: hwWobblePoly([[104,22],[104,92]], seed + 2, A) });
    shapes.push({ d: hwWobblePoly([[16,45],[60,52],[104,45]], seed + 3, A) });
    shapes.push({ d: hwWobblePoly([[16,68],[60,75],[104,68]], seed + 4, A) });
    shapes.push({ d: hwWobbleEllipse(60, 92, 44, 12, seed + 5, A, 16, 0, Math.PI) });
  } else if (type === "gear") {
    var teeth = 8, rOut = 46, rIn = 34;
    var pitch = (Math.PI * 2) / teeth;
    var sHalf = pitch * 0.16, tHalf = pitch * 0.30;
    var pts = [];
    for (var k = 0; k < teeth; k++) {
      var c = k * pitch;
      pts.push([60 + Math.cos(c - tHalf) * rIn, 60 + Math.sin(c - tHalf) * rIn]);
      pts.push([60 + Math.cos(c - sHalf) * rOut, 60 + Math.sin(c - sHalf) * rOut]);
      pts.push([60 + Math.cos(c + sHalf) * rOut, 60 + Math.sin(c + sHalf) * rOut]);
      pts.push([60 + Math.cos(c + tHalf) * rIn, 60 + Math.sin(c + tHalf) * rIn]);
      var v = c + pitch / 2;
      pts.push([60 + Math.cos(v) * rIn, 60 + Math.sin(v) * rIn]);
    }
    shapes.push({ d: hwWobblePoly(pts, seed, A) + " Z" });
    shapes.push({ d: hwWobbleCircle(60, 60, 13, seed + 1, A, 16), sw: 4 });
  } else if (type === "dash") {
    shapes.push({ d: hwWobblePoly([[30,96],[100,95]], seed, A) });
    shapes.push({ d: hwWobbleBoxPath(36, 66, 14, 30, seed + 1, A) });
    shapes.push({ d: hwWobbleBoxPath(60, 46, 14, 50, seed + 2, A) });
    shapes.push({ d: hwWobbleBoxPath(84, 56, 14, 40, seed + 3, A) });
  } else if (type === "app") {
    shapes.push({ d: hwWobbleBoxPath(20, 24, 80, 72, seed, A) });
    shapes.push({ d: hwWobblePoly([[20,46],[60,44],[100,46]], seed + 1, A) });
    shapes.push({ d: hwWobblePoly([[32,66],[60,64],[88,66]], seed + 2, A) });
    shapes.push({ d: hwWobblePoly([[32,82],[54,80],[74,82]], seed + 3, A) });
    shapes.push({ d: hwWobbleCircle(34, 35, 4, seed + 4, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(48, 35, 4, seed + 5, A, 12), sw: 4 });
  } else if (type === "ml") {
    shapes.push({ d: hwWobblePoly([[60, 20], [60, 28]], seed, A) });
    shapes.push({ d: hwWobbleCircle(60, 17, 3, seed + 4, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleBoxPath(36, 28, 48, 28, seed + 1, A) });
    shapes.push({ d: hwWobbleCircle(48, 44, 4, seed + 5, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(72, 44, 4, seed + 6, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleBoxPath(40, 64, 40, 28, seed + 2, A) });
    shapes.push({ d: hwWobblePoly([[46, 78], [74, 78]], seed + 3, A) });
  } else if (type === "rack") {
    shapes.push({ d: hwWobbleBoxPath(30, 22, 60, 24, seed, A) });
    shapes.push({ d: hwWobbleBoxPath(30, 48, 60, 24, seed + 1, A) });
    shapes.push({ d: hwWobbleBoxPath(30, 74, 60, 24, seed + 2, A) });
    shapes.push({ d: hwWobbleCircle(42, 34, 3, seed + 3, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(54, 34, 3, seed + 4, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(42, 60, 3, seed + 5, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(54, 60, 3, seed + 6, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(42, 86, 3, seed + 7, A, 12), sw: 4 });
    shapes.push({ d: hwWobbleCircle(54, 86, 3, seed + 8, A, 12), sw: 4 });
  }
  return shapes;
}

function makeStrokedPath(svg, d, sw, stroke) {
  var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", stroke);
  p.setAttribute("stroke-width", sw);
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  setDrawHidden(p, sw);
  svg.appendChild(p);
  return p;
}

function hwSmoothPath(points, seed, amp) {
  amp = amp === undefined ? 2.5 : amp;
  function wob(i) { return hwHash(i, seed) * amp; }
  var d = "";
  for (var i = 0; i < points.length - 1; i++) {
    var p0 = points[i === 0 ? 0 : i - 1];
    var p1 = points[i];
    var p2 = points[i + 1];
    var p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];
    var c1x = p1[0] + (p2[0] - p0[0]) / 6 + wob(i * 2 + 1);
    var c1y = p1[1] + (p2[1] - p0[1]) / 6 + wob(i * 2 + 2);
    var c2x = p2[0] - (p3[0] - p1[0]) / 6 + wob(i * 2 + 3);
    var c2y = p2[1] - (p3[1] - p1[1]) / 6 + wob(i * 2 + 4);
    d += (i === 0 ? "M " + p1[0] + " " + p1[1] : "") + " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + ", " + c2x.toFixed(1) + " " + c2y.toFixed(1) + ", " + p2[0] + " " + p2[1];
  }
  return d;
}

function hwStar(cx, cy, ro, ri, seed, amp) {
  var pts = [];
  for (var k = 0; k < 10; k++) {
    var ang = -Math.PI / 2 + k * Math.PI / 5;
    var r = (k % 2 === 0) ? ro : ri;
    pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
  }
  return hwWobblePoly(pts, seed, amp) + " Z";
}

function makeFilledPath(svg, d, fill) {
  var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", fill);
  svg.appendChild(p);
  return p;
}

function addPlotText(svg, x, y, str, anchor) {
  var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("class", "dlt-tick");
  t.setAttribute("x", x);
  t.setAttribute("y", y);
  t.setAttribute("text-anchor", anchor);
  t.textContent = str;
  svg.appendChild(t);
  return t;
}

function fmtK(v) {
  if (v === 0) return "0";
  return (v / 1000) + "k";
}

function fireEntrance(el) {
  var animEls = el.querySelectorAll("[data-anim]");
  if (!animEls.length) return;
  /* fromTo, não from: o from grava o valor final lendo o atual. Se fireEntrance
     rodar duas vezes antes do primeiro tick, o segundo from grava y=28 como fim
     e o elemento fica permanentemente 28px baixo — e as .res-note (que não são
     [data-anim]) ficam desalinhadas do <pre>. */
  gsap.fromTo(animEls,
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", overwrite: true });
}

(function () {
  var SLIDE_DURATION = 10;
  var SCENE_IDS = [
    "cover", "speaker", "pessoal", "pipeline-map",
    "problem-sources", "connector-costs", "parallel-dialects", "what-is-dlt",
    "dlthub", "anatomy", "phases", "rawg-architecture",
    "source", "resource", "resource-games", "transformer",
    "schema-contracts", "pipeline-destination", "pipeline", "real-example",
    "dlt-state", "closing", "questions"
  ];
  var TOTAL = SLIDE_DURATION * SCENE_IDS.length;

  var scenes = [];
  for (var i = 0; i < SCENE_IDS.length; i++) {
    scenes.push({ id: SCENE_IDS[i], start: i * SLIDE_DURATION, end: i * SLIDE_DURATION + SLIDE_DURATION });
  }

  HW.prepResNotes = function (scope) {
    var wraps = scope.querySelectorAll(".res-code");
    if (!wraps.length) return;

    for (var c = 0; c < wraps.length; c++) {
      var wrap = wraps[c];
      var pre = wrap.querySelector(".code-box pre");
      var notes = wrap.querySelectorAll(".res-note");
      if (!pre || !notes.length) continue;

      var preRect = pre.getBoundingClientRect();
      var wrapRect = wrap.getBoundingClientRect();
      var lineH = parseFloat(getComputedStyle(pre).lineHeight) || 26;
      var preTop = preRect.top - wrapRect.top;

      for (var n = 0; n < notes.length; n++) {
        var line = parseInt(notes[n].getAttribute("data-line"), 10);
        var ty = preTop + (line + 0.5) * lineH;
        var nh = notes[n].getBoundingClientRect().height;
        var nlh = parseFloat(getComputedStyle(notes[n]).lineHeight) || 24;
        notes[n].style.top = notes[n].getAttribute("data-align") === "hang"
          ? (ty - nlh / 2) + "px"
          : (ty - nh / 2) + "px";
      }
    }

    var jsons = scope.querySelectorAll(".res-json");
    for (var j = 0; j < jsons.length; j++) {
      var jwrap = jsons[j];
      var jpre = jwrap.querySelector(".code-box pre");
      var jnotes = jwrap.querySelectorAll(".res-note-r");
      if (!jpre || !jnotes.length) continue;

      var jpreRect = jpre.getBoundingClientRect();
      var jwrapRect = jwrap.getBoundingClientRect();
      var jlineH = parseFloat(getComputedStyle(jpre).lineHeight) || 16;
      var jpreTop = jpreRect.top - jwrapRect.top;

      for (var m = 0; m < jnotes.length; m++) {
        var jline = parseInt(jnotes[m].getAttribute("data-line"), 10);
        var jty = jpreTop + (jline + 0.5) * jlineH;
        var jnh = jnotes[m].getBoundingClientRect().height;
        var jnlh = parseFloat(getComputedStyle(jnotes[m]).lineHeight) || 16;
        jnotes[m].style.top = jnotes[m].getAttribute("data-align") === "hang"
          ? (jty - jnlh / 2) + "px"
          : (jty - jnh / 2) + "px";
      }
    }
  };

  /* ---- per-slide registry: prep at mount, fire at activation ---- */
  var hooks = {};
  var lastActiveId = null;
  var sweep = function () {};
  HW.scene = function (id, h) {
    hooks[id] = h || {};
    if (hooks[id].prep && !hooks[id]._prepped) { hooks[id].prep(); hooks[id]._prepped = true; }
    if (lastActiveId === id) lastActiveId = null; /* content just landed: allow re-fire */
    sweep();
  };

  function fireEntrance(el) {
    var animEls = el.querySelectorAll("[data-anim]");
    if (!animEls.length) return;
    /* fromTo, não from — ver o comentário do fireEntrance global acima. */
    gsap.fromTo(animEls,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", overwrite: true });
  }

  function updateVisibility(t) {
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var el = document.getElementById('scene-' + s.id);
      if (!el) continue;
      var h = hooks[s.id];
      if (!h) continue; /* not mounted/registered yet — HW.scene re-sweeps on registration */
      var active = t >= s.start && t < s.end;
      el.style.opacity = active ? '1' : '0';
      el.style.visibility = active ? 'visible' : 'hidden';
      el.style.pointerEvents = active ? 'auto' : 'none';
      if (active && lastActiveId !== s.id) {
        lastActiveId = s.id;
        fireEntrance(el);
        if (h.fire) h.fire();
      }
    }
  }
  sweep = function () { updateVisibility(tl.time()); };

  window.__hfSetTime = updateVisibility;
  var tl = gsap.timeline({ paused: true });
  tl.to({}, { duration: TOTAL });
  tl.eventCallback('onUpdate', function () { updateVisibility(tl.time()); });
  window.__timelines = window.__timelines || {};
  window.__timelines["deck"] = tl;

  (function () {
    var FPS = 30;
    var manifest = [];
    for (var i = 0; i < scenes.length; i++) {
      manifest.push({ id: scenes[i].id, start: scenes[i].start, duration: SLIDE_DURATION });
    }
    function postTimeline() {
      parent.postMessage({
        source: "hf-preview",
        type: "timeline",
        durationInFrames: TOTAL * FPS,
        scenes: manifest
      }, "*");
    }
    function scheduleTimelinePosts() {
      postTimeline();
      setTimeout(postTimeline, 300);
      setTimeout(postTimeline, 1000);
      setTimeout(postTimeline, 2500);
    }
    if (document.readyState === "complete") {
      scheduleTimelinePosts();
    } else {
      window.addEventListener("load", scheduleTimelinePosts);
    }
  })();
})();
