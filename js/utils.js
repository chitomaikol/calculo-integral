/**
 * Plataforma de Cálculo Integral + Software - UTP
 * Archivo de Utilidades Matemáticas, Algoritmos Numéricos y Visualización (Plotly & KaTeX)
 */

window.UTPMath = (function () {
  'use strict';

  // Configuración de Paleta para Gráficos Plotly
  const THEME = {
    paperBg: '#090e1a',
    plotBg: '#090e1a',
    textColor: '#f8fafc',
    gridColor: 'rgba(255, 255, 255, 0.08)',
    accentCyan: '#38bdf8',
    accentBlue: '#3b82f6',
    accentTeal: '#10b981',
    accentAmber: '#f59e0b',
    accentPurple: '#a855f7',
    accentRose: '#f43f5e',
    fillAlpha: 'rgba(56, 189, 248, 0.25)'
  };

  /**
   * Catálogo de Funciones Predefinidas del Taller UTP con Integrales Exactas
   */
  const FUNCTIONS_CATALOG = {
    'x^2': {
      name: 'f(x) = x²',
      tex: 'f(x) = x^2',
      defaultA: 0,
      defaultB: 2,
      fn: (x) => Math.pow(x, 2),
      antiderivative: (x) => Math.pow(x, 3) / 3,
      exactDefinite: (a, b) => (Math.pow(b, 3) - Math.pow(a, 3)) / 3
    },
    '1/x': {
      name: 'f(x) = 1/x',
      tex: 'f(x) = \\frac{1}{x}',
      defaultA: 1,
      defaultB: 3,
      fn: (x) => (x !== 0 ? 1 / x : 0),
      antiderivative: (x) => Math.log(Math.abs(x)),
      exactDefinite: (a, b) => Math.log(b) - Math.log(a)
    },
    'sqrt(x)': {
      name: 'f(x) = √x',
      tex: 'f(x) = \\sqrt{x}',
      defaultA: 0,
      defaultB: 4,
      fn: (x) => (x >= 0 ? Math.sqrt(x) : 0),
      antiderivative: (x) => (2 / 3) * Math.pow(Math.max(0, x), 1.5),
      exactDefinite: (a, b) => (2 / 3) * (Math.pow(b, 1.5) - Math.pow(a, 1.5))
    },
    'exp(x)': {
      name: 'f(x) = e^x',
      tex: 'f(x) = e^x',
      defaultA: 0,
      defaultB: 1,
      fn: (x) => Math.exp(x),
      antiderivative: (x) => Math.exp(x),
      exactDefinite: (a, b) => Math.exp(b) - Math.exp(a)
    },
    'sin(x)': {
      name: 'f(x) = sin(x)',
      tex: 'f(x) = \\sin(x)',
      defaultA: 0,
      defaultB: Math.PI,
      fn: (x) => Math.sin(x),
      antiderivative: (x) => -Math.cos(x),
      exactDefinite: (a, b) => -Math.cos(b) - (-Math.cos(a))
    },
    'cos(x)': {
      name: 'f(x) = cos(x)',
      tex: 'f(x) = \\cos(x)',
      defaultA: 0,
      defaultB: Math.PI / 2,
      fn: (x) => Math.cos(x),
      antiderivative: (x) => Math.sin(x),
      exactDefinite: (a, b) => Math.sin(b) - Math.sin(a)
    },
    '3x^2-2x+1': {
      name: 'f(x) = 3x² - 2x + 1',
      tex: 'f(x) = 3x^2 - 2x + 1',
      defaultA: 0,
      defaultB: 2,
      fn: (x) => 3 * Math.pow(x, 2) - 2 * x + 1,
      antiderivative: (x) => Math.pow(x, 3) - Math.pow(x, 2) + x,
      exactDefinite: (a, b) => {
        const F = (x) => Math.pow(x, 3) - Math.pow(x, 2) + x;
        return F(b) - F(a);
      }
    }
  };

  /**
   * Cálculo de Sumas de Riemann (Izquierda, Derecha, Punto Medio)
   */
  function calcRiemann(fn, a, b, n, type = 'left') {
    const deltaX = (b - a) / n;
    let sum = 0;
    const rectangles = [];

    for (let i = 0; i < n; i++) {
      const xLeft = a + i * deltaX;
      const xRight = a + (i + 1) * deltaX;
      let evalX;

      if (type === 'left') {
        evalX = xLeft;
      } else if (type === 'right') {
        evalX = xRight;
      } else {
        // mid
        evalX = (xLeft + xRight) / 2;
      }

      const height = fn(evalX);
      sum += height * deltaX;

      rectangles.push({
        xLeft,
        xRight,
        evalX,
        height,
        area: height * deltaX
      });
    }

    return {
      type,
      n,
      deltaX,
      sum,
      rectangles
    };
  }

  /**
   * Cálculo de la Regla del Trapecio
   */
  function calcTrapezoid(fn, a, b, n) {
    const deltaX = (b - a) / n;
    let innerSum = 0;
    const intervals = [];

    const y0 = fn(a);
    const yn = fn(b);

    for (let i = 0; i < n; i++) {
      const x0 = a + i * deltaX;
      const x1 = a + (i + 1) * deltaX;
      const yStart = fn(x0);
      const yEnd = fn(x1);
      const trapezoidArea = ((yStart + yEnd) / 2) * deltaX;

      intervals.push({
        i,
        x0,
        x1,
        y0: yStart,
        y1: yEnd,
        area: trapezoidArea
      });

      if (i > 0) {
        innerSum += yStart;
      }
    }

    const sum = (deltaX / 2) * (y0 + 2 * innerSum + yn);

    return {
      n,
      deltaX,
      sum,
      intervals
    };
  }

  /**
   * Cálculo de la Regla de Simpson 1/3 (n DEBE ser par)
   */
  function calcSimpson(fn, a, b, n) {
    if (n % 2 !== 0) {
      n += 1; // Asegurar paridad
    }
    const deltaX = (b - a) / n;
    let sumOdd = 0;
    let sumEven = 0;
    const points = [];

    for (let i = 0; i <= n; i++) {
      const x = a + i * deltaX;
      const y = fn(x);
      points.push({ i, x, y });

      if (i > 0 && i < n) {
        if (i % 2 === 1) {
          sumOdd += y;
        } else {
          sumEven += y;
        }
      }
    }

    const y0 = points[0].y;
    const yn = points[n].y;
    const sum = (deltaX / 3) * (y0 + 4 * sumOdd + 2 * sumEven + yn);

    return {
      n,
      deltaX,
      sum,
      points
    };
  }

  /**
   * Configuración de Layout Oscuro para Plotly
   */
  function getPlotlyLayout(options = {}) {
    return {
      title: {
        text: options.title || '',
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 16, color: THEME.textColor }
      },
      paper_bgcolor: THEME.paperBg,
      plot_bgcolor: THEME.plotBg,
      font: { family: 'Plus Jakarta Sans, sans-serif', color: THEME.textColor },
      margin: { l: 55, r: 25, t: 40, b: 45 },
      autosize: true,
      hovermode: 'closest',
      showlegend: options.showLegend !== undefined ? options.showLegend : true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(10, 15, 29, 0.75)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
        font: { size: 11, color: '#f8fafc' }
      },
      xaxis: {
        title: { text: options.xTitle || 'x', font: { size: 12, color: '#94a3b8' } },
        gridcolor: THEME.gridColor,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        tickfont: { color: '#94a3b8' },
        range: options.xRange || undefined
      },
      yaxis: {
        title: { text: options.yTitle || 'f(x)', font: { size: 12, color: '#94a3b8' } },
        gridcolor: THEME.gridColor,
        zerolinecolor: 'rgba(255, 255, 255, 0.25)',
        tickfont: { color: '#94a3b8' },
        range: options.yRange || undefined
      }
    };
  }

  /**
   * Formateador numérico limpio para visualización de cálculos
   */
  function formatNum(val, decimals = 6) {
    if (val === undefined || val === null || isNaN(val)) return '0.000000';
    return Number(val).toFixed(decimals);
  }

  /**
   * Renderizado de KaTeX automático para todo el DOM o elemento objetivo
   */
  function renderAllMath(element = document.body) {
    if (window.renderMathInElement) {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  }

  return {
    THEME,
    FUNCTIONS_CATALOG,
    calcRiemann,
    calcTrapezoid,
    calcSimpson,
    getPlotlyLayout,
    formatNum,
    renderAllMath
  };
})();
