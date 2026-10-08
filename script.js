"use strict";

/* ---------- Event data (seats are reduced in memory as students register) ---------- */
const DEFAULT_EVENTS = [
  { id: 1, title: "Web Development Bootcamp", cat: "Workshop", date: "2026-10-03",
    time: "9:30 AM to 4:30 PM", venue: "Computer Lab 2, IT Block", by: "Department of IT",
    seats: 60, left: 14,
    about: "A hands-on day of HTML, CSS and JavaScript. You will build and host a small " +
           "responsive website. Bring your laptop; beginners are welcome." },
  { id: 2, title: "CodeSprint 24-Hour Hackathon", cat: "Technical", date: "2026-10-10",
    time: "10:00 AM onwards", venue: "Innovation Lab", by: "Coding Club",
    seats: 120, left: 38,
    about: "Form a team of up to four and build a working prototype in 24 hours. " +
           "Mentors from industry will review projects and pick the top three teams." },
  { id: 3, title: "Kala Vizha Cultural Night", cat: "Cultural", date: "2026-10-24",
    time: "5:30 PM to 9:00 PM", venue: "Open Air Auditorium", by: "Fine Arts Association",
    seats: 300, left: 112,
    about: "An evening of music, dance and drama by students from every department. " +
           "Register to reserve a seat and take part in the audience choice awards." },
  { id: 4, title: "Paper Presentation Symposium", cat: "Academic", date: "2026-10-29",
    time: "10:00 AM to 1:00 PM", venue: "Seminar Hall, Main Block", by: "Research Cell",
    seats: 80, left: 9,
    about: "Present your research or project idea to a panel of faculty. " +
           "Best papers are recommended for the state-level student conference." },
  { id: 5, title: "Inter-Department Cricket Cup", cat: "Sports", date: "2026-11-07",
    time: "8:00 AM to 5:00 PM", venue: "College Ground", by: "Physical Education Dept.",
    seats: 96, left: 0,
    about: "Knockout matches between department teams. Team slots are filled, " +
           "but everyone is welcome to cheer from the stands." },
  { id: 6, title: "Placement Aptitude Workshop", cat: "Career", date: "2026-11-14",
    time: "2:00 PM to 4:30 PM", venue: "Seminar Hall, Main Block", by: "Training and Placement Cell",
    seats: 150, left: 71,
    about: "Practise quantitative aptitude, reasoning and group discussion with " +
           "trainers who have coached students for campus drives." }
];

const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics and Communication",
  "Electrical and Electronics", "Mechanical", "Civil", "Artificial Intelligence and Data Science"];
const YEARS = ["I year", "II year", "III year", "IV year"];

/* ---------- Form fields with their validation rules ---------- */
const FIELDS = [
  { id: "name", label: "Full name", type: "text", auto: "name", ph: "e.g. Priya Raman",
    test: v => /^[A-Za-z][A-Za-z .]{2,49}$/.test(v),
    msg: "Enter your full name using letters only (at least 3 characters)." },
  { id: "regno", label: "Register number", type: "text", auto: "off", ph: "e.g. 912221104027",
    test: v => /^[A-Za-z0-9]{8,15}$/.test(v),
    msg: "Register number must be 8 to 15 letters or digits, with no spaces." },
  { id: "email", label: "Email address", type: "email", auto: "email", ph: "name@college.edu",
    test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    msg: "Enter a valid email address, like name@college.edu." },
  { id: "phone", label: "Mobile number", type: "tel", auto: "tel", ph: "10-digit number",
    test: v => /^[6-9][0-9]{9}$/.test(v),
    msg: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." },
  { id: "dept", label: "Department", opts: DEPARTMENTS, test: v => v !== "",
    msg: "Choose your department." },
  { id: "year", label: "Year of study", opts: YEARS, test: v => v !== "",
    msg: "Choose your year of study." }
];

/* ---------- Storage: events and registrations are kept in the browser (localStorage) ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (_) { return d; } };
const save = () => {
  try {
    localStorage.setItem("ce_events", JSON.stringify(EVENTS));
    localStorage.setItem("ce_regs", JSON.stringify(registrations));
  } catch (_) { /* storage blocked: data lasts only for this visit */ }
};
const EVENTS = load("ce_events", DEFAULT_EVENTS);
const registrations = load("ce_regs", []);
let lastRegistration = null;

const CATS = ["Workshop", "Technical", "Cultural", "Academic", "Sports", "Career", "Other"];
const EVENT_FIELDS = [
  { id: "title", label: "Event title", type: "text", ph: "e.g. AI Workshop",
    test: v => v.length >= 3, msg: "Enter an event title (at least 3 characters)." },
  { id: "cat", label: "Category", opts: CATS, test: v => v !== "", msg: "Choose a category." },
  { id: "date", label: "Date", type: "date",
    test: v => /^\d{4}-\d{2}-\d{2}$/.test(v), msg: "Choose the event date." },
  { id: "time", label: "Time", type: "text", ph: "e.g. 10:00 AM to 1:00 PM",
    test: v => v.length >= 3, msg: "Enter the event time." },
  { id: "venue", label: "Venue", type: "text", ph: "e.g. Seminar Hall, Main Block",
    test: v => v.length >= 3, msg: "Enter the venue." },
  { id: "by", label: "Organised by", type: "text", ph: "e.g. Coding Club",
    test: v => v.length >= 2, msg: "Enter who organises the event." },
  { id: "seats", label: "Total seats", type: "number", ph: "e.g. 100",
    test: v => /^[1-9][0-9]{0,4}$/.test(v), msg: "Enter total seats as a whole number, 1 or more." },
  { id: "about", label: "About the event", type: "textarea", full: true,
    test: v => v.length >= 10, msg: "Write a short description (at least 10 characters)." }
];

const app = document.getElementById("app");

/* ---------- Helpers ---------- */
const esc = t => String(t).replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toDate = iso => new Date(iso + "T00:00:00");
const longDate = iso => toDate(iso).toLocaleDateString("en-GB",
  { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const part = (iso, opt) => toDate(iso).toLocaleDateString("en-GB", opt);

const stub = e => `<div class="stub" aria-hidden="true">
  <span class="mon">${part(e.date, { month: "short" })}</span>
  <span class="day">${toDate(e.date).getDate()}</span>
  <span class="wd">${part(e.date, { weekday: "short" })}</span></div>`;

const seatBadge = e => e.left === 0
  ? `<span class="badge full">Full</span>`
  : `<span class="badge ${e.left <= 15 ? "low" : ""}">${e.left} seats left</span>`;

/* ---------- Views ---------- */
function regsView() {
  const rows = registrations.map((r, i) => `<tr>
    <td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.regno)}</td><td>${esc(r.title)}</td>
    <td>${esc(r.dept)}, ${esc(r.year)}</td>
    <td><button class="btn ghost" type="button" data-dl="${i}">Download</button></td></tr>`).join("");
  return `<h2 class="sub">Registered students (${registrations.length})</h2>` + (rows
    ? `<div class="tablewrap"><table class="regs"><thead><tr><th>Registration ID</th><th>Name</th>
        <th>Register number</th><th>Event</th><th>Department, year</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`
    : `<p class="lead">No one has registered yet. Registrations will appear here.</p>`);
}

function listView() {
  const rows = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date)).map(e => `
    <li class="event">${stub(e)}
      <div class="info">
        <span class="cat">${esc(e.cat)}</span>
        <h2><a href="#/event/${e.id}">${esc(e.title)}</a></h2>
        <p>${esc(e.time)}, ${esc(e.venue)}</p>
      </div>
      <div class="side">${seatBadge(e)}
        <a class="btn ghost" href="#/event/${e.id}">View details</a></div>
    </li>`).join("");
  return `<section class="wrap">
    <div class="bar"><h1>Upcoming events</h1><a class="btn" href="#/new">Add new event</a></div>
    <p class="lead">Pick an event, read the details and reserve your seat in a minute.</p>
    <ul class="events">${rows || `<li class="event">No events yet. Add the first one.</li>`}</ul>
    ${regsView()}</section>`;
}

function detailsView(e) {
  const action = e.left
    ? `<a class="btn" href="#/register/${e.id}">Register for this event</a>`
    : `<p class="note">This event is full, so registration is closed.</p>`;
  return `<section class="wrap narrow">
    <a class="back" href="#/">Back to all events</a>
    <div class="head">${stub(e)}<div><span class="cat">${esc(e.cat)}</span><h1>${esc(e.title)}</h1></div></div>
    <p class="about">${esc(e.about)}</p>
    <dl class="facts">
      <div><dt>Date</dt><dd>${longDate(e.date)}</dd></div>
      <div><dt>Time</dt><dd>${esc(e.time)}</dd></div>
      <div><dt>Venue</dt><dd>${esc(e.venue)}</dd></div>
      <div><dt>Organised by</dt><dd>${esc(e.by)}</dd></div>
      <div><dt>Seats</dt><dd>${e.left} of ${e.seats} left</dd></div>
      <div><dt>Entry</dt><dd>Free, with college ID card</dd></div>
    </dl><div class="actions">${action}<a class="btn ghost" href="#/edit/${e.id}">Edit event</a></div></section>`;
}

function fieldHtml(f, val = "") {
  const a = `id="${f.id}" name="${f.id}" aria-describedby="e-${f.id}"`;
  const control = f.opts
    ? `<select ${a}><option value="">Select</option>${f.opts.map(o => `<option${o === val ? " selected" : ""}>${o}</option>`).join("")}</select>`
    : f.type === "textarea" ? `<textarea ${a} rows="4">${esc(val)}</textarea>`
    : `<input ${a} type="${f.type}"${f.auto ? ` autocomplete="${f.auto}"` : ""} placeholder="${f.ph || ""}" value="${esc(val)}"${f.type === "number" ? ' min="1"' : ""}>`;
  return `<div class="field${f.full ? " full" : ""}" id="f-${f.id}"><label for="${f.id}">${f.label}</label>${control}
    <p class="err" id="e-${f.id}" role="alert"></p></div>`;
}

function formView(e) {
  return `<section class="wrap narrow">
    <a class="back" href="#/event/${e.id}">Back to event details</a>
    <h1>Register for this event</h1>
    <div class="summary">${stub(e)}
      <p><strong>${e.title}</strong>${longDate(e.date)}, ${e.venue}</p></div>
    <form id="reg" class="form" novalidate>
      ${FIELDS.map(fieldHtml).join("")}
      <div class="field full" id="f-agree">
        <label class="check"><input type="checkbox" id="agree" name="agree">
          I will attend and carry my college ID card.</label>
        <p class="err" id="e-agree" role="alert"></p></div>
      <div class="field full"><button class="btn" type="submit">Confirm registration</button></div>
    </form></section>`;
}

function confirmView(r) {
  return `<section class="wrap narrow done">
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1e7b4b"/>
      <path d="M18 33l10 10 19-21" fill="none" stroke="#fff" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1>You are registered</h1>
    <p class="lead" style="margin-inline:auto">Show this registration ID at the venue,
      along with your college ID card.</p>
    <div class="ticket"><p class="id">${esc(r.id)}</p>
      <dl class="facts">
        <div><dt>Event</dt><dd>${esc(r.title)}</dd></div>
        <div><dt>Date and time</dt><dd>${longDate(r.date)}, ${esc(r.time)}</dd></div>
        <div><dt>Venue</dt><dd>${esc(r.venue)}</dd></div>
        <div><dt>Name</dt><dd>${esc(r.name)}</dd></div>
        <div><dt>Register number</dt><dd>${esc(r.regno)}</dd></div>
        <div><dt>Department and year</dt><dd>${esc(r.dept)}, ${esc(r.year)}</dd></div>
      </dl></div>
    <div class="actions center"><button class="btn" type="button" id="dl">Download registration ID</button>
    <a class="btn ghost" href="#/">Browse more events</a></div></section>`;
}

/* ---------- Form validation ---------- */
function setError(id, message) {
  document.getElementById("f-" + id).classList.toggle("invalid", Boolean(message));
  document.getElementById("e-" + id).textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute("aria-invalid", Boolean(message));
}

function checkField(form, f) {
  const ok = f.test(form.elements[f.id].value.trim());
  setError(f.id, ok ? "" : f.msg);
  return ok;
}

function bindLive(form, fields) {
  fields.forEach(f => {
    const input = form.elements[f.id];
    const isInvalid = () => document.getElementById("f-" + f.id).classList.contains("invalid");
    input.addEventListener("blur", () => checkField(form, f));
    ["input", "change"].forEach(t =>
      input.addEventListener(t, () => { if (isInvalid()) checkField(form, f); }));
  });
}

const focusFirst = () => {
  const first = document.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
  if (first) first.focus();
};

function bindForm(e) {
  const form = document.getElementById("reg");
  bindLive(form, FIELDS);
  form.elements.agree.addEventListener("change", ev => {
    if (ev.target.checked) setError("agree", "");
  });

  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const results = FIELDS.map(f => checkField(form, f));
    const agreed = form.elements.agree.checked;
    setError("agree", agreed ? "" : "Please tick the box to confirm.");

    const regno = form.elements.regno.value.trim().toUpperCase();
    const duplicate = registrations.some(r => r.eventId === e.id && r.regno === regno);
    if (results[1] && duplicate) {
      setError("regno", "This register number is already registered for this event.");
      results[1] = false;
    }
    if (results.includes(false) || !agreed) return focusFirst();

    let id;
    do { id = `EVT-${String(e.id).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`; }
    while (registrations.some(r => r.id === id));
    lastRegistration = {
      id, eventId: e.id, title: e.title, date: e.date, time: e.time, venue: e.venue, regno,
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      dept: form.elements.dept.value, year: form.elements.year.value
    };
    registrations.push(lastRegistration);
    e.left -= 1;
    save();
    location.hash = "#/confirmed";
  });
}

/* ---------- Add / edit event ---------- */
function eventFormView(e) {
  const v = e || {};
  return `<section class="wrap narrow">
    <a class="back" href="${e ? "#/event/" + e.id : "#/"}">Back</a>
    <h1>${e ? "Edit event" : "Add new event"}</h1>
    <form id="evf" class="form" novalidate>
      ${EVENT_FIELDS.map(f => fieldHtml(f, v[f.id] === undefined ? "" : String(v[f.id]))).join("")}
      <div class="field full actions"><button class="btn" type="submit">${e ? "Save changes" : "Create event"}</button>
      ${e ? `<button class="btn danger" type="button" id="del">Delete event</button>` : ""}</div>
    </form></section>`;
}

function bindEventForm(e) {
  const form = document.getElementById("evf");
  bindLive(form, EVENT_FIELDS);
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    if (!EVENT_FIELDS.map(f => checkField(form, f)).every(Boolean)) return focusFirst();
    const d = {};
    EVENT_FIELDS.forEach(f => d[f.id] = form.elements[f.id].value.trim());
    d.seats = Number(d.seats);
    let id;
    if (e) { d.left = Math.max(0, e.left + d.seats - e.seats); Object.assign(e, d); id = e.id; }
    else { id = Math.max(0, ...EVENTS.map(x => x.id)) + 1; d.id = id; d.left = d.seats; EVENTS.push(d); }
    save();
    location.hash = "#/event/" + id;
  });
  const del = document.getElementById("del");
  if (del) del.onclick = () => {
    if (!confirm("Delete this event? Existing registrations stay in the list.")) return;
    EVENTS.splice(EVENTS.indexOf(e), 1);
    save();
    location.hash = "#/";
  };
}

/* ---------- Download the registration ID as an image ---------- */
function downloadTicket(r) {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 520;
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, 900, 520);
  g.fillStyle = "#2a1b5e"; g.fillRect(0, 0, 900, 110);
  g.fillStyle = "#ffb627"; g.font = "bold 34px sans-serif";
  g.fillText("Campus Events - Registration Pass", 40, 66);
  g.fillStyle = "#2a1b5e"; g.font = "bold 46px sans-serif"; g.fillText(r.id, 40, 185);
  g.font = "24px sans-serif";
  [["Event", r.title], ["Date", longDate(r.date) + ", " + r.time], ["Venue", r.venue],
   ["Name", r.name], ["Register no.", r.regno], ["Department", r.dept + ", " + r.year]]
    .forEach(([k, v], i) => {
      g.fillStyle = "#565a70"; g.fillText(k, 40, 245 + i * 40);
      g.fillStyle = "#1b1b2f"; g.fillText(v, 240, 245 + i * 40, 620);
    });
  g.fillStyle = "#565a70"; g.font = "18px sans-serif";
  g.fillText("Show this pass with your college ID card at the venue.", 40, 500);
  const a = document.createElement("a");
  a.download = r.id + ".png"; a.href = c.toDataURL("image/png");
  a.click();
}

/* ---------- Router: shows a view for the current #/hash ---------- */
function render() {
  const [page, id] = location.hash.replace(/^#\/?/, "").split("/");
  const e = EVENTS.find(x => String(x.id) === id);

  if (page === "event" && e) app.innerHTML = detailsView(e);
  else if (page === "register" && e && e.left > 0) { app.innerHTML = formView(e); bindForm(e); }
  else if (page === "new") { app.innerHTML = eventFormView(); bindEventForm(); }
  else if (page === "edit" && e) { app.innerHTML = eventFormView(e); bindEventForm(e); }
  else if (page === "confirmed" && lastRegistration) {
    app.innerHTML = confirmView(lastRegistration);
    document.getElementById("dl").onclick = () => downloadTicket(lastRegistration);
  } else app.innerHTML = listView();

  app.querySelectorAll("[data-dl]").forEach(b =>
    b.onclick = () => downloadTicket(registrations[b.dataset.dl]));
  window.scrollTo(0, 0);
  const heading = app.querySelector("h1");
  heading.setAttribute("tabindex", "-1");
  heading.focus();
}

window.addEventListener("hashchange", render);
render();
