// ======================
// DATA + STORAGE
// ======================
const LS = {
  users: "lms_users",
  courses: "lms_courses",
  enrollments: "lms_enrollments",
  grades: "lms_grades",
  session: "lms_session"
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedIfNeeded() {
  const users = load(LS.users, null);
  const courses = load(LS.courses, null);

  if (!users) {
    save(LS.users, [
      { id: 1, email: "admin@intseg.com",   name: "Administrador", role: "admin",   password: "Admin12345" },
      { id: 2, email: "maestro@intseg.com", name: "Juan Pérez",    role: "maestro", password: "Maestro12345" },
      { id: 3, email: "alumno@intseg.com",  name: "Guardia Demo",  role: "alumno",  password: "Alumno12345" }
    ]);
  }

  if (!courses) {
    save(LS.courses, [
      {
        id: 101,
        title: "Normatividad en Seguridad Privada",
        description: "Curso sobre las normas y regulaciones en seguridad privada necesarias para desempeñar funciones de vigilancia.",
        category: "Certificación DC3",
        durationHours: 3,
        instructor: "Juan Pérez",
        modules: ["Marco legal", "Procedimientos operativos", "Manejo de incidentes"],
        quiz: [
          {
            q: "¿Cuál es el objetivo principal de la seguridad patrimonial?",
            options: { A: "Proteger activos", B: "Vigilar accesos", C: "Controlar inventarios", D: "Todas las anteriores" },
            correct: "D"
          },
          {
            q: "¿Qué documento suele usarse para control de accesos de visitantes?",
            options: { A: "Factura", B: "Bitácora", C: "Nómina", D: "Plano" },
            correct: "B"
          },
          {
            q: "¿Cuál es una práctica correcta ante un incidente?",
            options: { A: "Ignorarlo", B: "Reportarlo por el canal definido", C: "Publicarlo en redes", D: "Salir sin avisar" },
            correct: "B"
          },
          {
            q: "En seguridad, la autorización se refiere a:",
            options: { A: "Verificar identidad", B: "Permitir acciones según rol", C: "Crear contraseñas", D: "Cerrar sesión" },
            correct: "B"
          },
          {
            q: "Una contraseña segura debe:",
            options: { A: "Ser corta", B: "Ser común", C: "Tener longitud y complejidad", D: "Compartirse" },
            correct: "C"
          }
        ]
      },
      {
        id: 102,
        title: "ISO 28001: Seguridad en la Cadena",
        description: "Introducción a prácticas de seguridad en la cadena de suministro.",
        category: "Certificación Internacional",
        durationHours: 3,
        instructor: "Juan Pérez",
        modules: ["Conceptos base", "Riesgos en la cadena", "Controles y mejora"],
        quiz: []
      },
      {
        id: 103,
        title: "Antilavado de Dinero y Seguridad Patrimonial",
        description: "Conceptos básicos para prevención, detección y reporteo.",
        category: "Certificación OEA",
        durationHours: 2,
        instructor: "Juan Pérez",
        modules: ["Conceptos", "Señales de alerta", "Proceso de reporte"],
        quiz: []
      }
    ]);
  }

  // Maestro inscribe alumnos (simulado)
  const enrollments = load(LS.enrollments, null);
  if (!enrollments) {
    save(LS.enrollments, [
      { courseId: 101, studentId: 3, enrolledBy: 2 }
    ]);
  }

  const grades = load(LS.grades, null);
  if (!grades) save(LS.grades, []);
}

// ======================
// AUTH
// ======================
function getSession() {
  return load(LS.session, null);
}
function setSession(session) {
  save(LS.session, session);
}
function clearSession() {
  localStorage.removeItem(LS.session);
}

function login(email, password) {
  const users = load(LS.users, []);
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) return null;
  const session = { userId: u.id, role: u.role, name: u.name, email: u.email };
  setSession(session);
  return session;
}

// ======================
// UI HELPERS
// ======================
const $ = (id) => document.getElementById(id);

const views = {
  login: $("viewLogin"),
  catalogo: $("viewCatalogo"),
  detalle: $("viewDetalle"),
  admin: $("viewAdmin")
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
}

function setLogoutVisible(isVisible) {
  const btn = $("btnLogout");
  btn.classList.toggle("hidden", !isVisible);
}

// ======================
// RENDER: CATALOGO
// ======================
let currentTab = "todos";
let selectedCourseId = null;

function isEnrolled(courseId, studentId) {
  const enrollments = load(LS.enrollments, []);
  return enrollments.some(e => e.courseId === courseId && e.studentId === studentId);
}

function renderCatalog(filterText = "") {
  const session = getSession();
  const courses = load(LS.courses, []);
  const list = $("coursesList");

  const normalized = filterText.trim().toLowerCase();

  const filtered = courses.filter(c => {
    const matchText =
      c.title.toLowerCase().includes(normalized) ||
      c.description.toLowerCase().includes(normalized) ||
      (c.category || "").toLowerCase().includes(normalized);

    if (!matchText && normalized) return false;

    if (currentTab === "mis" && session.role === "alumno") return isEnrolled(c.id, session.userId);
    if (currentTab === "encurso" && session.role === "alumno") return isEnrolled(c.id, session.userId);
    return true;
  });

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `<div class="muted">No se encontraron cursos.</div>`;
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-thumb">🎓</div>
      <div class="course-main">
        <div class="course-title">${escapeHtml(c.title)}</div>
        <div class="course-desc">${escapeHtml(c.description)}</div>
        <div class="course-meta">
          <span class="pill">${escapeHtml(c.category || "Curso")}</span>
          <span class="pill">⏱ ${c.durationHours} h</span>
          <span class="pill">👤 ${escapeHtml(c.instructor)}</span>
        </div>
      </div>
      <div>
        <button class="btn primary" data-open="${c.id}">Ver detalle</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("button[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openDetalle(Number(btn.dataset.open)));
  });
}

// ======================
// RENDER: DETALLE
// ======================
function openDetalle(courseId) {
  const session = getSession();
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === courseId);
  if (!c) return;

  selectedCourseId = courseId;

  $("detalleTitle").textContent = "Detalle del Curso";
  $("detalleNombre").textContent = c.title;
  $("detalleInstructor").textContent = `Instructor: ${c.instructor}`;
  $("detalleDuracion").textContent = `⏱ ${c.durationHours} horas`;
  $("detalleDesc").textContent = c.description;
  $("detalleBadge").textContent = c.category || "Curso";
  $("detalleMeta").textContent = session ? `${session.name} • ${session.role}` : "";

  const modules = $("modulesList");
  modules.innerHTML = "";
  c.modules.forEach((m, idx) => {
    const row = document.createElement("div");
    row.className = "module";
    row.innerHTML = `
      <div class="left">
        <div class="dot">✓</div>
        <div><b>Módulo ${idx + 1}</b> — ${escapeHtml(m)}</div>
      </div>
      <div class="muted">›</div>
    `;
    modules.appendChild(row);
  });

  $("detalleMsg").textContent = "";

  showView("detalle");
}

// ======================
// ADMIN DASH
// ======================
function renderAdmin() {
  const courses = load(LS.courses, []);
  const users = load(LS.users, []);
  const evalsCount = courses.reduce((acc, c) => acc + (c.quiz?.length ? 1 : 0), 0);

  $("statCursos").textContent = String(courses.length);
  $("statUsuarios").textContent = String(users.length);
  $("statEvals").textContent = String(evalsCount);
  $("statReportes").textContent = "4";

  const list = $("adminUltimos");
  list.innerHTML = "";
  courses.slice(0, 3).forEach(c => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-thumb">📌</div>
      <div class="course-main">
        <div class="course-title">${escapeHtml(c.title)}</div>
        <div class="course-desc">${escapeHtml(c.category || "Curso")} • ⏱ ${c.durationHours} h</div>
      </div>
      <div>
        <button class="btn ghost" data-open="${c.id}">Gestionar</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("button[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openDetalle(Number(btn.dataset.open)));
  });
}

// ======================
// EVALUACION MODAL
// ======================
let evalIndex = 0;
let evalAnswers = {};

function openEval() {
  const session = getSession();
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === selectedCourseId);
  if (!c) return;

  // Solo alumno puede realizar evaluación
  if (session.role !== "alumno") {
    $("detalleMsg").textContent = "Solo el Alumno puede realizar evaluaciones.";
    return;
  }

  // Debe estar inscrito
  if (!isEnrolled(c.id, session.userId)) {
    $("detalleMsg").textContent = "No estás inscrito a este curso. El Maestro debe inscribirte.";
    return;
  }

  if (!c.quiz || c.quiz.length === 0) {
    $("detalleMsg").textContent = "Este curso aún no tiene evaluación publicada.";
    return;
  }

  evalIndex = 0;
  evalAnswers = {};
  renderEvalQuestion();
  $("modalEval").classList.remove("hidden");
}

function closeEval() {
  $("modalEval").classList.add("hidden");
  $("evalMsg").textContent = "";
}

function renderEvalQuestion() {
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === selectedCourseId);
  const q = c.quiz[evalIndex];

  $("evalProgress").textContent = `Pregunta ${evalIndex + 1} de ${c.quiz.length}`;
  const body = $("evalBody");
  body.innerHTML = `
    <div class="q">${escapeHtml(q.q)}</div>
    ${renderOption("A", q.options.A)}
    ${renderOption("B", q.options.B)}
    ${renderOption("C", q.options.C)}
    ${renderOption("D", q.options.D)}
  `;

  const saved = evalAnswers[evalIndex] || "";
  body.querySelectorAll("input[name='opt']").forEach(inp => {
    inp.checked = inp.value === saved;
    inp.addEventListener("change", () => {
      evalAnswers[evalIndex] = inp.value;
      $("evalMsg").textContent = "";
    });
  });

  $("btnPrev").disabled = evalIndex === 0;
  $("btnNext").textContent = (evalIndex === c.quiz.length - 1) ? "Enviar" : "Siguiente";
}

function renderOption(letter, text) {
  return `
    <label class="opt">
      <input type="radio" name="opt" value="${letter}" />
      <div><b>${letter})</b> ${escapeHtml(text)}</div>
    </label>
  `;
}

function nextEval() {
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === selectedCourseId);

  if (!evalAnswers[evalIndex]) {
    $("evalMsg").textContent = "Selecciona una respuesta para continuar.";
    return;
  }

  if (evalIndex < c.quiz.length - 1) {
    evalIndex++;
    renderEvalQuestion();
    return;
  }

  // Submit
  submitEval();
}

function prevEval() {
  if (evalIndex > 0) {
    evalIndex--;
    renderEvalQuestion();
  }
}

function submitEval() {
  const session = getSession();
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === selectedCourseId);

  // calcular score (100/quizLength)
  const per = Math.round(100 / c.quiz.length);
  let score = 0;
  c.quiz.forEach((q, i) => {
    if (evalAnswers[i] === q.correct) score += per;
  });
  if (score > 100) score = 100;

  const status = score >= 70 ? "Aprobado" : "No aprobado";

  const grades = load(LS.grades, []);
  const existingIdx = grades.findIndex(g => g.courseId === c.id && g.studentId === session.userId);
  const record = {
    courseId: c.id,
    studentId: session.userId,
    courseTitle: c.title,
    score,
    status,
    when: new Date().toISOString()
  };
  if (existingIdx >= 0) grades[existingIdx] = record;
  else grades.push(record);
  save(LS.grades, grades);

  $("evalMsg").textContent = `Enviado. Calificación: ${score} (${status}).`;
  setTimeout(() => {
    closeEval();
    openCalif(); // mostrar calificación automáticamente
  }, 700);
}

// ======================
// CALIFICACIONES MODAL
// ======================
function openCalif() {
  const session = getSession();
  const courses = load(LS.courses, []);
  const c = courses.find(x => x.id === selectedCourseId);
  if (!c) return;

  $("modalCalif").classList.remove("hidden");
  $("califSubtitle").textContent = c.title;

  const body = $("califBody");
  const grades = load(LS.grades, []);

  if (session.role === "alumno") {
    const g = grades.find(x => x.courseId === c.id && x.studentId === session.userId);
    body.innerHTML = g
      ? `<div class="course-detail">
           <div class="detail-name">Resultado de evaluación</div>
           <div class="detail-desc">Calificación: <b>${g.score}</b></div>
           <div class="detail-desc">Estado: <b>${g.status}</b></div>
         </div>`
      : `<div class="muted">Aún no tienes calificación registrada en este curso.</div>`;
    return;
  }

  if (session.role === "maestro") {
    // maestro ve calificaciones de alumnos (inscritos) de ese curso
    const users = load(LS.users, []);
    const enrollments = load(LS.enrollments, []);
    const students = enrollments
      .filter(e => e.courseId === c.id)
      .map(e => users.find(u => u.id === e.studentId))
      .filter(Boolean);

    if (students.length === 0) {
      body.innerHTML = `<div class="muted">No hay alumnos inscritos en este curso.</div>`;
      return;
    }

    const rows = students.map(st => {
      const g = grades.find(x => x.courseId === c.id && x.studentId === st.id);
      return `
        <div class="course-card">
          <div class="course-thumb">👤</div>
          <div class="course-main">
            <div class="course-title">${escapeHtml(st.name)}</div>
            <div class="course-desc">${escapeHtml(st.email)}</div>
          </div>
          <div class="pill">${g ? `${g.score} • ${g.status}` : "Sin calificar"}</div>
        </div>
      `;
    }).join("");

    body.innerHTML = rows;
    return;
  }

  // admin
  body.innerHTML = `<div class="muted">El Administrador ve reportes globales (no calificaciones por curso en este MVP).</div>`;
}

function closeCalif() {
  $("modalCalif").classList.add("hidden");
}

// ======================
// INIT + EVENTS
// ======================
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      renderCatalog($("searchInput").value);
    });
  });
}

function routeAfterLogin() {
  const session = getSession();
  if (!session) return;

  setLogoutVisible(true);
  $("whoami").textContent = `${session.name} • ${session.role}`;

  if (session.role === "admin") {
    renderAdmin();
    showView("admin");
  } else {
    renderCatalog();
    showView("catalogo");
  }
}

function init() {
  seedIfNeeded();

  // Login events
  $("btnLogin").addEventListener("click", () => {
    const email = $("loginEmail").value.trim();
    const pass = $("loginPass").value;
    const session = login(email, pass);
    if (!session) {
      $("loginMsg").textContent = "Credenciales inválidas. Intenta de nuevo.";
      return;
    }
    $("loginMsg").textContent = "";
    routeAfterLogin();
  });

  $("togglePass").addEventListener("click", () => {
    const inp = $("loginPass");
    inp.type = inp.type === "password" ? "text" : "password";
  });

  $("btnLogout").addEventListener("click", () => {
    clearSession();
    setLogoutVisible(false);
    showView("login");
  });

  // Catalog search
  $("btnSearch").addEventListener("click", () => renderCatalog($("searchInput").value));
  $("searchInput").addEventListener("input", () => renderCatalog($("searchInput").value));

  // Back
  $("btnBackCatalog").addEventListener("click", () => showView("catalogo"));

  // Detalle actions
  $("btnIniciarEval").addEventListener("click", openEval);
  $("btnVerCalif").addEventListener("click", openCalif);

  // Modals
  $("btnCloseEval").addEventListener("click", closeEval);
  $("btnPrev").addEventListener("click", prevEval);
  $("btnNext").addEventListener("click", nextEval);

  $("btnCloseCalif").addEventListener("click", closeCalif);

  // Admin tiles (demo)
  document.querySelectorAll(".admin-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      alert("Demo: esta sección se implementa en sprints futuros.");
    });
  });

  applyTabs();

  // Route if session exists
  const session = getSession();
  if (session) routeAfterLogin();
  else {
    setLogoutVisible(false);
    showView("login");
  }
}

init();
