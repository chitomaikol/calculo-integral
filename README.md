# Plataforma Web: Cálculo Integral + Desarrollo de Software
### Universidad Tecnológica de Pereira (UTP)
**Facultad de Ciencias Básicas • Departamento de Matemáticas**  
**Asignatura:** Matemáticas II (CB215) — Grupo 403  
**Autor:** Maikol Andrés Chito
**Evaluación Parcial 1 — Semestre 2026-2**

---

## 📌 Descripción del Proyecto

Esta plataforma web interactiva integra de manera sinérgica el rigor analítico del **Cálculo Integral** con herramientas modernas de **Desarrollo de Software** y visualización computacional. Diseñada para estudiantes y docentes de la Universidad Tecnológica de Pereira, la plataforma ofrece simuladores matemáticos en tiempo real, aproximaciones por métodos de cuadratura numérica, análisis de cotas de error y resolución completa paso a paso de los ejercicios del taller oficial de 70 integrales.

El proyecto está concebido bajo una **arquitectura modular de 14 módulos**, alineados con las tres fases curriculares del semestre:
- **Fase 1 (Parcial 1):** Módulos 1 al 6 completamente funcionales con simuladores en tiempo real (Plotly.js) y renderizado de fórmulas LaTeX (KaTeX).
- **Fase 2 (Parcial 2):** Módulos 7 al 11 (Técnicas de Integración: Exponenciales, Logarítmicas, Trigonométricas e Inversas).
- **Fase 3 (Proyecto Final):** Módulos 12 al 14 (Hiperbólicas Inversas, Trinomios, Integración por Partes y Sólidos de Revolución).

---

## 🏗️ Arquitectura Modular del Repositorio

El código está estructurado de forma limpia y desacoplada, sin requerir compiladores o empaquetadores complejos (`node_modules`, `webpack`, `vite`), permitiendo su ejecución inmediata en cualquier navegador:

```text
.
├── index.html                  # Plataforma principal: Grilla responsive de los 14 módulos
├── README.md                   # Documentación técnica, manual de uso y despliegue
├── css/
│   └── style.css               # Sistema de diseño global (Dark Tech, Glassmorphism, Responsive)
├── js/
│   └── utils.js                # Motores de cálculo numérico, evaluador y tema de Plotly
└── modulos/
    ├── modulo1/                # Sumas de Riemann (Izquierda, Derecha, Punto Medio)
    │   └── index.html
    ├── modulo2/                # Regla del Trapecio (Cuerdas secantes y cota O(1/n²))
    │   └── index.html
    ├── modulo3/                # Regla del Punto Medio (Rectángulos compensados)
    │   └── index.html
    ├── modulo4/                # Regla de Simpson 1/3 (Interpolación parabólica, n par)
    │   └── index.html
    ├── modulo5/                # Integral Definida y Área bajo/entre curvas (TFC)
    │   └── index.html
    ├── modulo6/                # Integración Directa y Familia de Primitivas F(x) + C
    │   └── index.html
    ├── modulo7/                # Sustitución (Potencias) [Placeholder Fase 2]
    │   └── index.html
    ├── modulo8/                # Integrales Exponenciales [Placeholder Fase 2]
    │   └── index.html
    ├── modulo9/                # Integrales Logarítmicas [Placeholder Fase 2]
    │   └── index.html
    ├── modulo10/               # Integrales Trigonométricas [Placeholder Fase 2]
    │   └── index.html
    ├── modulo11/               # Trigonométricas Inversas [Placeholder Fase 2]
    │   └── index.html
    ├── modulo12/               # Hiperbólicas Inversas [Placeholder Fase 3]
    │   └── index.html
    ├── modulo13/               # Trinomios ax² + bx + c [Placeholder Fase 3]
    │   └── index.html
    └── modulo14/               # Integración por Partes [Placeholder Fase 3]
        └── index.html
```

---

## 🚀 Módulos Implementados en Fase 1

### Módulo 1: Sumas de Riemann
- **Fundamento Matemático:** Partición regular $\Delta x = \frac{b-a}{n}$ y sumatorias de aproximación rectangular:
  $$L_n = \sum_{i=0}^{n-1} f(x_i)\Delta x, \quad R_n = \sum_{i=1}^n f(x_i)\Delta x, \quad M_n = \sum_{i=1}^n f(\bar{x}_i)\Delta x$$
- **Simulador Plotly:** Permite variar dinámicamente $n \in [2, 60]$, seleccionar entre suma izquierda, derecha y punto medio, y visualizar en tiempo real los rectángulos superpuestos sobre la función con cálculo de error analítico.
- **Ejercicios del Taller:** $f(x) = x^2$ en $[0, 2]$ con $n=4$ y $f(x) = 1/x$ en $[1, 3]$ con $n=5$.

### Módulo 2: Regla del Trapecio
- **Fundamento Matemático:** Interpolación lineal a trozos mediante cuerdas secantes:
  $$T_n = \frac{\Delta x}{2} \left[ f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n) \right], \quad |E_T| \le \frac{K(b-a)^3}{12n^2}$$
- **Simulador Plotly:** Genera polígonos trapeciales continuos bajo la curva con nodos evaluados y cálculo de error frente a la integral definida exacta.
- **Ejercicios del Taller:** $\int_0^2 x^2 dx$ con $n=4$ ($T_4 = 2.75$) y $\int_1^3 \frac{1}{x} dx$ con $n=5$ ($T_5 \approx 1.110266$).

### Módulo 3: Regla del Punto Medio
- **Fundamento Matemático:** Rectángulos centrados en $\bar{x}_i = \frac{x_{i-1} + x_i}{2}$ con cota de error:
  $$M_n = \Delta x \sum_{i=1}^n f(\bar{x}_i), \quad |E_M| \le \frac{K(b-a)^3}{24n^2}$$
- **Simulador Plotly:** Visualización de rectángulos centrados con líneas de compensación de curvatura. Demostración de que el error es exactamente la mitad que en el trapecio ($|E_M| = \frac{1}{2}|E_T|$).
- **Ejercicios del Taller:** $\int_0^2 x^2 dx$ con $n=4$ ($M_4 = 2.625$) y $\int_1^3 \frac{1}{x} dx$ con $n=5$ ($M_5 \approx 1.092857$).

### Módulo 4: Regla de Simpson (1/3)
- **Fundamento Matemático:** Cuadratura parabólica con **condición obligatoria de $n$ par**:
  $$S_n = \frac{\Delta x}{3} \left[ f(x_0) + 4\sum_{i \text{ impar}} f(x_i) + 2\sum_{i \text{ par}} f(x_i) + f(x_n) \right], \quad |E_S| \le \frac{M(b-a)^5}{180n^4}$$
- **Simulador Plotly:** Interpolación cuadrática continua de arcos parabólicos con nodos coloreados según su peso $(1, 4, 2)$. Demostración experimental del error analítico $0.000000$ para polinomios de segundo grado.
- **Ejercicios del Taller:** $\int_0^2 x^2 dx$ con $n=4$ ($S_4 = 8/3 \approx 2.666667$) y $\int_1^3 \frac{1}{x} dx$ con $n=4$ ($S_4 = 1.100000$, error de solo $0.12\%$).

### Módulo 5: Integral Definida y Área bajo la Curva
- **Fundamento Matemático:** Teorema Fundamental del Cálculo (Partes 1 y 2 / Regla de Barrow):
  $$\int_a^b f(x)\,dx = F(b) - F(a), \quad \text{Área entre curvas } A = \int_a^b |f(x) - g(x)|\,dx$$
- **Simulador Plotly:** Dos modalidades interactivas:
  1. Área bajo una función con límites $a$ y $b$ ajustables mediante sliders.
  2. Área acotada entre dos curvas ($f(x) = 2x$ y $g(x) = x^2$) con detección de puntos de intersección y sombreado del polígono encerrado.
- **Ejercicios del Taller:** $\int_0^2 (3x^2 - 2x + 1)dx = 6.000000$ y área entre $y=2x$ y $y=x^2$ en $[0, 2]$ ($A = 4/3 \approx 1.333333$).

### Módulo 6: Integración Directa
- **Fundamento Matemático:** Reglas inmediatas (potencias, exponenciales, logarítmicas), linealidad y constante de integración $C$.
- **Simulador Plotly:** Permite manipular un slider para la constante $C \in [-8, 8]$, visualizando la curva activa $F(x) + C$, la derivada $f(x)$ y curvas fantasma para ilustrar la familia uniparamétrica de primitivas.
- **3 Ejercicios del Taller:** 
  1. $\int (ax+by)^2 dx = \frac{a^2 x^3}{3} + abx^2 y + b^2 x y^2 + C$.
  2. $\int (\frac{3}{x^2} - \frac{9}{\sqrt{x}}) dx = -\frac{3}{x} - 18\sqrt{x} + C$.
  3. $\int (x-1)(x+1) dx = \frac{x^3}{3} - x + C$.  
  *Todos verificados rigurosamente por derivación.*

---

## 🛠️ Tecnologías Empleadas

- **HTML5 Semántico:** Estructura accesible (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`).
- **CSS3 Moderno:** Variables CSS nativas, glassmorphism (`backdrop-filter`), tema Dark Tech, tipografía *Plus Jakarta Sans* y *JetBrains Mono*, totalmente responsive (móvil, tablet y escritorio).
- **Vanilla JavaScript (ES6+):** Código modular organizado en el namespace global `UTPMath` (`js/utils.js`), algoritmos de cuadratura numérica puros sin librerías externas de cálculo.
- **Plotly.js (v2.35.2 vía CDN):** Renderizado vectorial interactivo acelerado por hardware para curvas matemáticas, trapecios, rectángulos y parábolas.
- **KaTeX (v0.16.11 vía CDN):** Motor matemático tipográfico de alto rendimiento con auto-render de delimitadores `$...$` y `$$...$$`.

---

## 💻 Instrucciones para Ejecución Local

No se requiere instalar Node.js ni paquetes npm. Puede ejecutarse con cualquiera de los siguientes métodos:

### Opción 1: Con Python (Recomendada)
Si tiene Python instalado, abra una terminal en la carpeta del proyecto y ejecute:
```bash
python -m http.server 8000
```
Luego abra su navegador web en: `http://localhost:8000`

### Opción 2: Con VS Code (Extensión Live Server)
1. Abra la carpeta del proyecto en Visual Studio Code.
2. Instale la extensión **Live Server** (de Ritwick Dey).
3. Haga clic derecho sobre `index.html` y seleccione **"Open with Live Server"**.

### Opción 3: Apertura Directa en el Navegador
Haga doble clic en el archivo `index.html` para abrirlo directamente en Google Chrome, Microsoft Edge, Mozilla Firefox o Safari. (Nota: Para una experiencia óptima con gráficos Plotly y KaTeX, se recomienda usar una conexión a internet activa para descargar los recursos CDN).

---

## 🌐 Pasos para Desplegar en GitHub Pages

Para publicar la plataforma en internet y compartir el enlace en Google Classroom:

1. **Inicializar el repositorio Git (si no está inicializado):**
   ```bash
   git init
   git add .
   git commit -m "feat: plataforma de calculo integral UTP fase 1 completa"
   ```

2. **Vincular con su repositorio remoto en GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/chitomaikol/calculo-integral.git
   ```

3. **Activar GitHub Pages:**
   - Ingrese a su repositorio en [GitHub](https://github.com/chitomaikol/calculo-integral.git).
   - Diríjase a **Settings** (Configuración) > pestaña **Pages** (menú lateral izquierdo).
   - En la sección **Build and deployment > Source**, seleccione **Deploy from a branch**.
   - En **Branch**, seleccione `main` y la carpeta `/ (root)`.
   - Haga clic en **Save**.
   - En 1-2 minutos, su plataforma estará disponible en:
     ```text
     https://github.com/chitomaikol/calculo-integral.git
     ```

---

## 🎓 Información Académica & Créditos

- **Institución:** Universidad Tecnológica de Pereira (UTP)
- **Facultad:** Facultad de Ciencias Básicas
- **Departamento:** Departamento de Matemáticas
- **Asignatura:** Matemáticas II (CB215)
- **Grupo:** 403
- **Periodo Académico:** 2026-2
- **Modalidad:** Virtual asistida por tecnologías de visualización matemática y programación interactiva.
