/** Interfaz de la Calculadora 3D: enlaza el DOM con Calc3D y Plotly. */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const T = UTPMath.THEME;
  const fmt = (v) => (Number.isFinite(v) ? UTPMath.formatNum(v) : 'indefinido');

  const PRESETS = [
    { name: 'Paraboloide sobre región triangular (x²+y², y≤x)', f: 'x^2 + y^2', a: '0', b: '1', yl: '0', yh: 'x', x0: '0.5', y0: '0.25' },
    { name: 'Paraboloide sobre rectángulo [0,2]×[0,2]', f: 'x^2 + y^2', a: '0', b: '2', yl: '0', yh: '2', x0: '1', y0: '1' },
    { name: 'Producto x·y sobre [0,2]×[0,3] (=9)', f: 'x*y', a: '0', b: '2', yl: '0', yh: '3', x0: '1', y0: '1' },
    { name: 'Punto silla: x² − y²', f: 'x^2 - y^2', a: '-2', b: '2', yl: '-2', yh: '2', x0: '0', y0: '0' },
    { name: 'Campana gaussiana', f: 'exp(-(x^2+y^2))', a: '-2', b: '2', yl: '-2', yh: '2', x0: '0', y0: '0' },
    { name: 'Ondas: sin(x)·cos(y)', f: 'sin(x)*cos(y)', a: '0', b: 'pi', yl: '0', yh: 'pi', x0: '1', y0: '1' },
    { name: 'Semiesfera (volumen = 2π/3 ≈ 2.094)', f: 'sqrt(1 - x^2 - y^2)', a: '-1', b: '1', yl: '-sqrt(1-x^2)', yh: 'sqrt(1-x^2)', x0: '0', y0: '0' },
    { name: 'Cono: sqrt(x²+y²)', f: 'sqrt(x^2 + y^2)', a: '-1', b: '1', yl: '-sqrt(1-x^2)', yh: 'sqrt(1-x^2)', x0: '0.5', y0: '0.5' },
    { name: 'Plano inclinado: 4 − x − y', f: '4 - x - y', a: '0', b: '2', yl: '0', yh: '2', x0: '1', y0: '1' }
  ];
  PRESETS.forEach((p, i) => { const o = document.createElement('option'); o.value = i; o.textContent = p.name; $('presetSel').appendChild(o); });

  let view = 'surface';
  let lastPlot = null;

  // Evalúa un límite escalar (puede ser "pi", "sqrt(2)", etc.)
  const scalar = (src, label) => {
    const v = Calc3D.parse(src)(0, 0);
    if (!Number.isFinite(v)) throw new Error(`${label} no es un número válido`);
    return v;
  };

  function compute() {
    $('errorMsg').textContent = '';
    try {
      const f = Calc3D.parse($('fInput').value);
      const a = scalar($('aInput').value, 'a');
      const b = scalar($('bInput').value, 'b');
      if (a === b) throw new Error('a y b no pueden ser iguales');
      if (a > b) throw new Error('Debe cumplirse a < b');
      const yl0 = Calc3D.parse($('ylInput').value);
      const yh0 = Calc3D.parse($('yhInput').value);
      // los límites sólo dependen de x
      const yl = (x) => yl0(x, 0);
      const yh = (x) => yh0(x, 0);
      const x0 = scalar($('x0Input').value, 'x₀');
      const y0 = scalar($('y0Input').value, 'y₀');
      const n = parseInt($('nSlider').value, 10);
      $('nDisplay').textContent = `n = ${n}`;

      // Integrales dobles
      const simp = Calc3D.doubleIntegral(f, a, b, yl, yh, n, 'simp');
      const mid = Calc3D.doubleIntegral(f, a, b, yl, yh, n, 'mid');
      const area = Calc3D.doubleIntegral(() => 1, a, b, yl, yh, n, 'simp');
      $('simpVal').textContent = fmt(simp);
      $('midVal').textContent = fmt(mid);
      $('areaVal').textContent = fmt(area);
      $('diffVal').textContent = fmt(Math.abs(simp - mid));

      // Análisis puntual
      const r = Calc3D.analyzePoint(f, x0, y0);
      $('mF').textContent = fmt(r.z0);
      $('mFx').textContent = fmt(r.gx);
      $('mFy').textContent = fmt(r.gy);
      $('mGrad').textContent = fmt(r.gradMag);
      $('mFxx').textContent = fmt(r.fxx);
      $('mFyy').textContent = fmt(r.fyy);
      $('mFxy').textContent = fmt(r.fxy);
      $('mD').textContent = fmt(r.D);
      $('mNature').textContent = r.nature;
      const s = (v) => (v < 0 ? `− ${Math.abs(v).toFixed(4)}` : `+ ${v.toFixed(4)}`);
      $('mPlane').textContent = Number.isFinite(r.z0)
        ? `z = ${r.z0.toFixed(4)} ${s(r.gx)}(x − ${x0}) ${s(r.gy)}(y − ${y0})`
        : 'indefinido en este punto';

      lastPlot = { f, a, b, yl, yh, x0, y0, r };
      draw();
    } catch (err) {
      $('errorMsg').textContent = '⚠ ' + err.message;
    }
  }

  function draw() {
    if (!lastPlot) return;
    const { f, a, b, yl, yh, x0, y0, r } = lastPlot;
    const res = 50;
    const S = Calc3D.buildSurface(f, a, b, yl, yh, res);
    const traces = [];

    if (view === 'surface') {
      traces.push({
        type: 'surface', x: S.X, y: S.Y, z: S.Z, name: 'f(x,y)',
        colorscale: 'Viridis', showscale: false, opacity: 0.95,
        contours: { z: { show: true, usecolormap: true, project: { z: true } } }
      });
      if ($('tangentChk').checked && Number.isFinite(r.z0)) {
        const d = Math.max(0.3, (b - a) / 6);
        const px = [x0 - d, x0 + d], py = [y0 - d, y0 + d];
        const pz = py.map((yy) => px.map((xx) => r.z0 + r.gx * (xx - x0) + r.gy * (yy - y0)));
        traces.push({ type: 'surface', x: px, y: py, z: pz, showscale: false, opacity: 0.6, colorscale: [[0, '#f59e0b'], [1, '#f59e0b']], name: 'Plano tangente' });
      }
      if (Number.isFinite(r.z0)) {
        traces.push({ type: 'scatter3d', mode: 'markers', x: [x0], y: [y0], z: [r.z0], marker: { size: 5, color: '#f43f5e' }, name: '(x₀, y₀)' });
      }
      const ax = (t) => ({ title: { text: t, font: { color: '#94a3b8' } }, gridcolor: T.gridColor, color: '#94a3b8', backgroundcolor: T.plotBg, showbackground: true });
      Plotly.react('plot3d', traces, {
        paper_bgcolor: T.paperBg, font: { color: T.textColor }, margin: { l: 0, r: 0, t: 10, b: 0 },
        showlegend: false,
        scene: { xaxis: ax('x'), yaxis: ax('y'), zaxis: ax('z'), camera: { eye: { x: 1.6, y: 1.6, z: 1 } } }
      }, { responsive: true, displaylogo: false });
    } else {
      // Curvas de nivel: contour exige malla regular; se grafica sobre el bounding box con null fuera de R
      const nx = 80, ny = 80;
      let yMin = Infinity, yMax = -Infinity;
      for (let i = 0; i <= 100; i++) {
        const x = a + ((b - a) * i) / 100;
        yMin = Math.min(yMin, yl(x), yh(x)); yMax = Math.max(yMax, yl(x), yh(x));
      }
      const xs = [], ys = [], zs = [];
      for (let i = 0; i <= nx; i++) xs.push(a + ((b - a) * i) / nx);
      for (let j = 0; j <= ny; j++) ys.push(yMin + ((yMax - yMin) * j) / ny);
      ys.forEach((y) => zs.push(xs.map((x) => {
        if (y < yl(x) - 1e-12 || y > yh(x) + 1e-12) return null;
        const z = f(x, y); return Number.isFinite(z) ? z : null;
      })));
      traces.push({ type: 'contour', x: xs, y: ys, z: zs, colorscale: 'Viridis', contours: { showlabels: true }, colorbar: { tickfont: { color: '#94a3b8' } } });
      if (Number.isFinite(r.z0)) traces.push({ type: 'scatter', mode: 'markers', x: [x0], y: [y0], marker: { color: '#f43f5e', size: 9 }, name: '(x₀, y₀)' });
      Plotly.react('plot3d', traces, UTPMath.getPlotlyLayout({ title: 'Curvas de nivel de f(x,y) sobre R', xTitle: 'x', yTitle: 'y', showLegend: false }), { responsive: true, displaylogo: false });
    }
  }

  function setTab(v) {
    view = v;
    $('tabSurface').className = 'btn ' + (v === 'surface' ? 'btn-primary' : 'btn-secondary');
    $('tabContour').className = 'btn ' + (v === 'contour' ? 'btn-primary' : 'btn-secondary');
    draw();
  }

  function loadPreset(i) {
    const p = PRESETS[i];
    $('fInput').value = p.f; $('aInput').value = p.a; $('bInput').value = p.b;
    $('ylInput').value = p.yl; $('yhInput').value = p.yh;
    $('x0Input').value = p.x0; $('y0Input').value = p.y0;
    compute();
  }

  $('presetSel').addEventListener('change', (e) => loadPreset(+e.target.value));
  $('calcBtn').addEventListener('click', compute);
  $('nSlider').addEventListener('input', compute);
  $('tangentChk').addEventListener('change', draw);
  $('tabSurface').addEventListener('click', () => setTab('surface'));
  $('tabContour').addEventListener('click', () => setTab('contour'));
  document.querySelectorAll('.form-input').forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') compute(); }));

  loadPreset(0);
  UTPMath.renderAllMath();
});
