let all = [];

const $ = id => document.getElementById(id);


// ================================
// LOGIN
// ================================

async function login() {

  $("loginStatus").textContent = "Entrando...";

  const email = $("email").value.trim();
  const password = $("password").value;

  if (!email || !password) {
    $("loginStatus").textContent =
      "Digite seu e-mail e sua senha.";
    return;
  }

  try {

    const r = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );

    if (!r.ok) {
      $("loginStatus").textContent =
        "E-mail ou senha inválidos.";
      return;
    }

    const s = await r.json();

    localStorage.setItem(
      "sb_access",
      s.access_token
    );

    $("loginStatus").textContent = "";

    showDash();

  } catch (error) {

    console.error(error);

    $("loginStatus").textContent =
      "Não foi possível entrar. Verifique sua conexão.";
  }
}


// ================================
// CABEÇALHOS SUPABASE
// ================================

function headers() {

  const token =
    localStorage.getItem("sb_access");

  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${token}`
  };
}


// ================================
// CARREGAR PAINEL
// ================================

async function showDash() {

  $("loginBox").style.display = "none";
  $("dashboard").style.display = "block";

  try {

    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=*&order=created_at.desc`,
      {
        headers: headers()
      }
    );

    if (!r.ok) {

      $("people").innerHTML =
        `<div class="empty">
          Não foi possível carregar as respostas.
        </div>`;

      return;
    }

    all = await r.json();

    populatePeopleFilter();

    render();

  } catch (error) {

    console.error(error);

    $("people").innerHTML =
      `<div class="empty">
        Erro ao carregar as respostas.
      </div>`;
  }
}


// ================================
// LISTA DE PARTICIPANTES
// ================================

function populatePeopleFilter() {

  const select = $("personFilter");

  if (!select) return;

  const currentValue = select.value;

  const names = [
    ...new Set(
      all
        .map(response =>
          String(response.name || "").trim()
        )
        .filter(name => name !== "")
    )
  ].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  select.innerHTML =
    `<option value="todos">
      Todos os participantes
    </option>`;

  names.forEach(name => {

    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    select.appendChild(option);
  });

  if (
    names.includes(currentValue)
  ) {
    select.value = currentValue;
  }
}


// ================================
// FILTRO
// ================================

function filtered() {

  const stage =
    $("stageFilter").value;

  const search =
    $("search").value
      .trim()
      .toLowerCase();

  const person =
    $("personFilter")
      ? $("personFilter").value
      : "todos";

  return all.filter(response => {

    const correctStage =
      stage === "todos" ||
      response.stage === stage;

    const name =
      String(response.name || "")
        .trim();

    const correctPerson =
      person === "todos" ||
      name === person;

    const correctSearch =
      name.toLowerCase()
        .includes(search);

    return (
      correctStage &&
      correctPerson &&
      correctSearch
    );
  });
}


// ================================
// RESUMO
// ================================

function renderSummary(rows) {

  const total =
    all.length;

  const before =
    all.filter(x =>
      x.stage === "antes"
    ).length;

  const after =
    all.filter(x =>
      x.stage === "depois"
    ).length;

  $("totalResponses").textContent =
    total;

  $("beforeResponses").textContent =
    before;

  $("afterResponses").textContent =
    after;

  $("count").textContent =
    `${rows.length} resposta(s) sendo exibida(s)`;
}


// ================================
// RESULTADOS
// ================================

function renderStats(rows) {

  const statQuestions =
    questions.slice(0, 23);

  $("stats").innerHTML =
    statQuestions.map((q, index) => {

      const values = rows
        .map(r => r.answers?.[q[0]])
        .filter(v =>
          v !== undefined &&
          v !== null &&
          v !== ""
        );

      const counts = {};

      const respondentTotal =
        values.length;

      values.forEach(value => {

        if (Array.isArray(value)) {

          value.forEach(option => {

            counts[option] =
              (counts[option] || 0) + 1;

          });

        } else {

          counts[value] =
            (counts[value] || 0) + 1;
        }

      });

      const entries =
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1]);

      if (!entries.length) {

        return `
          <div class="question-card">

            <h3>
              ${index + 1}. ${escapeHTML(q[1])}
            </h3>

            <div class="empty">
              Ainda não há respostas.
            </div>

          </div>
        `;
      }

      const items =
        entries.map(([option, amount]) => {

          const percentage =
            respondentTotal > 0
              ? (amount / respondentTotal) * 100
              : 0;

          return `
            <div class="barrow">

              <div class="bar-info">

                <span class="bar-label">
                  ${escapeHTML(option)}
                </span>

                <span class="bar-value">
                  ${amount} · ${percentage.toFixed(0)}%
                </span>

              </div>

              <div class="bar-background">

                <div
                  class="bar-fill"
                  style="width:${Math.min(percentage, 100)}%"
                ></div>

              </div>

            </div>
          `;

        }).join("");

      return `
        <div class="question-card">

          <h3>
            ${index + 1}. ${escapeHTML(q[1])}
          </h3>

          ${items}

        </div>
      `;

    }).join("");
}


// ================================
// RESPOSTAS INDIVIDUAIS
// ================================

function renderPeople(rows) {

  if (!rows.length) {

    $("people").innerHTML =
      `<div class="empty">
        Nenhuma resposta encontrada.
      </div>`;

    return;
  }

  $("people").innerHTML =
    rows.map(response => {

      const isBefore =
        response.stage === "antes";

      const stageText =
        isBefore ? "ANTES" : "DEPOIS";

      const stageClass =
        isBefore
          ? "stage-antes"
          : "stage-depois";

      const date =
        response.created_at
          ? new Date(response.created_at)
              .toLocaleString("pt-BR")
          : "Data não informada";

      const answers =
        questions.map((q, index) => {

          let answer =
            response.answers?.[q[0]];

          if (Array.isArray(answer)) {
            answer = answer.join(", ");
          }

          if (
            answer === undefined ||
            answer === null ||
            answer === ""
          ) {
            answer = "Não respondido";
          }

          return `
            <div class="answer">

              <b>
                ${index + 1}. ${escapeHTML(q[1])}
              </b>

              <br>

              ${escapeHTML(String(answer))}

            </div>
          `;

        }).join("");

      return `
        <details class="person">

          <summary>

            <b>
              ${escapeHTML(response.name || "Sem nome")}
            </b>

            <span class="stage ${stageClass}">
              ${stageText}
            </span>

            <br>

            <small>
              ${date}
            </small>

          </summary>

          <div class="person-content">

            ${answers}

          </div>

        </details>
      `;

    }).join("");
}


// ================================
// RENDERIZAÇÃO GERAL
// ================================

function render() {

  const rows =
    filtered();

  renderSummary(rows);

  renderStats(rows);

  renderPeople(rows);
}


// ================================
// SEGURANÇA DO TEXTO
// ================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ================================
// EVENTOS
// ================================

$("login").onclick =
  login;

$("stageFilter").onchange =
  render;

$("search").oninput =
  render;

if ($("personFilter")) {
  $("personFilter").onchange =
    render;
}

$("logout").onclick =
  () => {

    localStorage.removeItem(
      "sb_access"
    );

    location.reload();
  };


// ENTER NO LOGIN

$("password").addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      login();
    }

  }
);


// ================================
// VERIFICAR LOGIN SALVO
// ================================

if (
  localStorage.getItem("sb_access")
) {
  showDash();
}
