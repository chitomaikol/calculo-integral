/**
 * Motor de la Calculadora Tridimensional - UTP Cálculo Integral
 *  - Parser seguro de expresiones f(x, y) (sin eval ni new Function)
 *  - Derivadas parciales numéricas, gradiente, plano tangente, Hessiano
 *  - Integral doble por Simpson 2D y Punto Medio 2D (regiones tipo I)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc3D = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONSTS = { pi: Math.PI, e: Math.E };
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, arctan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, ln: Math.log, log: Math.log10,
    sqrt: (v) => (v < 0 && v > -1e-9 ? 0 : Math.sqrt(v)),
    abs: Math.abs, floor: Math.floor, ceil: Math.ceil, sign: Math.sign,
    sec: (v) => 1 / Math.cos(v), csc: (v) => 1 / Math.sin(v), cot: (v) => 1 / Math.tan(v)
  };
  const VARS = ['x', 'y'];

  // ---------- Tokenizador ----------
  function tokenize(src) {
    const s = src.toLowerCase().replace(/\s+/g, '').replace(/π/g, 'pi').replace(/\*\*/g, '^').replace(/√/g, 'sqrt');
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        if (s[j] === 'e' && /[0-9+-]/.test(s[j + 1] || '') && /[0-9]/.test(s[j + 1] === '+' || s[j + 1] === '-' ? (s[j + 2] || '') : s[j + 1])) {
          j += 2;
          while (j < s.length && /[0-9]/.test(s[j])) j++;
        }
        const val = parseFloat(s.slice(i, j));
        if (isNaN(val)) throw new Error(`Número inválido: "${s.slice(i, j)}"`);
        tokens.push({ t: 'num', v: val });
        i = j;
      } else if (/[a-z]/.test(c)) {
        let j = i;
        while (j < s.length && /[a-z]/.test(s[j])) j++;
        const word = s.slice(i, j);
        if (FUNCS[word]) { tokens.push({ t: 'fn', v: word }); i = j; }
        else if (CONSTS[word] !== undefined) { tokens.push({ t: 'num', v: CONSTS[word] }); i = j; }
        else if (VARS.includes(word)) { tokens.push({ t: 'var', v: word }); i = j; }
        else if (/^[a-z]+$/.test(word) && word.split('').every((ch) => VARS.includes(ch))) {
          // "xy" => x*y
          word.split('').forEach((ch, k) => { if (k) tokens.push({ t: 'op', v: '*' }); tokens.push({ t: 'var', v: ch }); });
          i = j;
        } else throw new Error(`Símbolo desconocido: "${word}"`);
      } else if ('+-*/^(),'.includes(c)) {
        tokens.push({ t: c === '(' || c === ')' ? c : 'op', v: c });
        i++;
      } else throw new Error(`Carácter no permitido: "${c}"`);
    }
    // multiplicación implícita: 2x, 2(x+1), )(, x(, 3sin(x)
    const out = [];
    tokens.forEach((tk, k) => {
      const prev = out[out.length - 1];
      if (prev && (prev.t === 'num' || prev.t === 'var' || prev.t === ')') &&
          (tk.t === 'num' || tk.t === 'var' || tk.t === 'fn' || tk.t === '(')) {
        out.push({ t: 'op', v: '*' });
      }
      out.push(tk);
    });
    return out;
  }

  // ---------- Parser (descenso recursivo) -> closure ----------
  function parse(src) {
    if (!src || !src.trim()) throw new Error('Expresión vacía');
    const tk = tokenize(src);
    let p = 0;
    const peek = () => tk[p];
    const eatOp = (v) => (peek() && peek().t === 'op' && peek().v === v ? tk[p++] : null);

    function expr() {
      let l = term();
      for (;;) {
        if (eatOp('+')) { const a = l, b = term(); l = (x, y) => a(x, y) + b(x, y); }
        else if (eatOp('-')) { const a = l, b = term(); l = (x, y) => a(x, y) - b(x, y); }
        else return l;
      }
    }
    function term() {
      let l = unary();
      for (;;) {
        if (eatOp('*')) { const a = l, b = unary(); l = (x, y) => a(x, y) * b(x, y); }
        else if (eatOp('/')) { const a = l, b = unary(); l = (x, y) => a(x, y) / b(x, y); }
        else return l;
      }
    }
    function unary() {
      if (eatOp('-')) { const a = unary(); return (x, y) => -a(x, y); }
      if (eatOp('+')) return unary();
      return power();
    }
    function power() {
      const base = atom();
      if (eatOp('^')) { const ex = unary(); return (x, y) => Math.pow(base(x, y), ex(x, y)); }
      return base;
    }
    function atom() {
      const t = peek();
      if (!t) throw new Error('La expresión termina inesperadamente');
      if (t.t === 'num') { p++; const v = t.v; return () => v; }
      if (t.t === 'var') { p++; return t.v === 'x' ? (x) => x : (x, y) => y; }
      if (t.t === 'fn') {
        p++;
        if (!peek() || peek().t !== '(') throw new Error(`Falta "(" después de ${t.v}`);
        p++;
        const arg = expr();
        if (!peek() || peek().t !== ')') throw new Error('Falta ")"');
        p++;
        const f = FUNCS[t.v];
        return (x, y) => f(arg(x, y));
      }
      if (t.t === '(') {
        p++;
        const e = expr();
        if (!peek() || peek().t !== ')') throw new Error('Falta ")"');
        p++;
        return e;
      }
      throw new Error(`Token inesperado: "${t.v}"`);
    }

    const fn = expr();
    if (p < tk.length) throw new Error(`Token inesperado: "${tk[p].v}"`);
    return fn;
  }

  // ---------- Cálculo diferencial multivariable ----------
  const H = 1e-4;
  const fx = (f, x, y) => (f(x + H, y) - f(x - H, y)) / (2 * H);
  const fy = (f, x, y) => (f(x, y + H) - f(x, y - H)) / (2 * H);
  const fxx = (f, x, y) => (f(x + H, y) - 2 * f(x, y) + f(x - H, y)) / (H * H);
  const fyy = (f, x, y) => (f(x, y + H) - 2 * f(x, y) + f(x, y - H)) / (H * H);
  const fxy = (f, x, y) => (f(x + H, y + H) - f(x + H, y - H) - f(x - H, y + H) + f(x - H, y - H)) / (4 * H * H);

  function analyzePoint(f, x0, y0) {
    const z0 = f(x0, y0), gx = fx(f, x0, y0), gy = fy(f, x0, y0);
    const a = fxx(f, x0, y0), b = fxy(f, x0, y0), c = fyy(f, x0, y0);
    const D = a * c - b * b;
    const gradMag = Math.hypot(gx, gy);
    const tol = 1e-3;
    let nature;
    if (gradMag > tol) nature = 'No es punto crítico (∇f ≠ 0)';
    else if (D > tol) nature = a > 0 ? 'Mínimo local' : 'Máximo local';
    else if (D < -tol) nature = 'Punto silla';
    else nature = 'Criterio no concluyente (D ≈ 0)';
    return { z0, gx, gy, fxx: a, fxy: b, fyy: c, D, gradMag, nature };
  }

  // ---------- Integración doble ----------
  // Región tipo I: a ≤ x ≤ b,  yl(x) ≤ y ≤ yh(x)
  function simpson1D(g, lo, hi, n) {
    if (n % 2) n++;
    const h = (hi - lo) / n;
    let s = g(lo) + g(hi);
    for (let i = 1; i < n; i++) s += g(lo + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  }
  function midpoint1D(g, lo, hi, n) {
    const h = (hi - lo) / n;
    let s = 0;
    for (let i = 0; i < n; i++) s += g(lo + (i + 0.5) * h);
    return s * h;
  }
  function doubleIntegral(f, a, b, yl, yh, n, method) {
    const rule = method === 'mid' ? midpoint1D : simpson1D;
    return rule((x) => rule((y) => f(x, y), yl(x), yh(x), n), a, b, n);
  }

  // Malla paramétrica (x, y(t), z) para dibujar la superficie sobre la región
  function buildSurface(f, a, b, yl, yh, res) {
    const X = [], Y = [], Z = [];
    for (let j = 0; j <= res; j++) {
      const rx = [], ry = [], rz = [];
      const tt = j / res;
      for (let i = 0; i <= res; i++) {
        const x = a + ((b - a) * i) / res;
        const y = yl(x) + tt * (yh(x) - yl(x));
        const z = f(x, y);
        rx.push(x); ry.push(y); rz.push(isFinite(z) ? z : null);
      }
      X.push(rx); Y.push(ry); Z.push(rz);
    }
    return { X, Y, Z };
  }

  return { parse, analyzePoint, fx, fy, fxx, fyy, fxy, doubleIntegral, simpson1D, midpoint1D, buildSurface };
});
