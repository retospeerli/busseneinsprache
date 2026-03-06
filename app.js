## app.js

```javascript
const $ = (id) => document.getElementById(id);
let currentTone = "neutral";

function setStatus(id, msg, cls = "", ms = 0) {
  const el = $(id);
  if (!el) return;
  el.className = `status ${cls}`.trim();
  el.textContent = msg;
  if (ms > 0) setTimeout(() => { el.textContent = ""; el.className = "status"; }, ms);
}

function todayCH() {
  const d = new Date();
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toneLabel(tone) {
  if (tone === "happy") return "Wertschätzend";
  if (tone === "grumpy") return "Deutlich, aber höflich";
  return "Sachlich";
}

function toneIntro() {
  if (currentTone === "happy") {
    return "Besten Dank vorab für die Prüfung dieses Anliegens.";
  }
  if (currentTone === "grumpy") {
    return "Auch wenn die Bestreitung einer derartigen Forderung unnötig aufwändig erscheint, nehme ich hierzu formell Stellung.";
  }
  return "Hiermit bestreite ich die mir zugestellte Umtriebsentschädigung vollumfänglich.";
}

function toneClosing() {
  if (currentTone === "happy") {
    return "Ich danke Ihnen im Voraus für die Prüfung und die schriftliche Bestätigung der Annullierung.";
  }
  if (currentTone === "grumpy") {
    return "Ich danke Ihnen für die formelle Prüfung und erwarte die schriftliche Bestätigung der Annullierung.";
  }
  return "Ich fordere daher die vollständige Annullierung der Forderung und eine entsprechende schriftliche Bestätigung.";
}

function updateSummary() {
  const plate = $("plate").value.trim() || "—";
  const eventDate = $("eventDate").value.trim();
  const eventTime = $("eventTime").value.trim();
  const location = $("location").value.trim() || "—";

  $("sumPlate").textContent = plate;
  $("sumDateTime").textContent = (eventDate || eventTime) ? [eventDate, eventTime].filter(Boolean).join(" / ") : "—";
  $("sumLocation").textContent = location;
}

function generateLetterText() {
  const firstName = $("firstName").value.trim() || "[Vorname]";
  const lastName = $("lastName").value.trim() || "[Nachname]";
  const address = $("address").value.trim() || "[Adresse]";
  const zip = $("zip").value.trim() || "[PLZ]";
  const city = $("city").value.trim() || "[Ort]";
  const plate = $("plate").value.trim() || "[Autokennzeichen]";
  const eventDate = $("eventDate").value.trim() || "[Datum]";
  const eventTime = $("eventTime").value.trim() || "[Uhrzeit]";
  const location = $("location").value.trim() || "[Ort / Schulareal]";
  const driverName = $("driverName").value.trim() || "[Name des Lenkers / der Lenkerin]";

  const body =
`Sehr geehrte Damen und Herren

${toneIntro()}

Die Forderung betrifft das Fahrzeug mit dem Kennzeichen ${plate}, angeblich parkierend am ${eventDate} um ${eventTime} auf dem Parkplatz ${location}. Fahrzeuglenker war ${driverName}.

Am betreffenden Parkplatz ist keine klare und vollständige Signalisation einer Gebührenpflicht oder der entsprechenden Zahlungsmodalitäten ersichtlich. Die vorhandene Beschilderung beschränkt sich auf ein audienzrichterliches Parkverbot für unberechtigte Drittpersonen. Eine Gebührenpflicht für berechtigte Nutzer ist daraus nicht erkennbar.

Nach den Grundsätzen von Treu und Glauben (Art. 2 ZGB) sowie dem Vertrauensschutz (Art. 9 BV) müssen Gebühren- oder Sanktionsregelungen für Nutzer klar und unmittelbar am Ort der Nutzung erkennbar sein. Diese Voraussetzungen sind vorliegend nicht erfüllt.

Mangels klarer und rechtskonformer Signalisation bestand für mich keine Möglichkeit, eine angebliche Gebührenpflicht zu erkennen oder korrekt zu erfüllen.

${toneClosing()}

Freundliche Grüsse

${firstName}

${firstName} ${lastName}
${address}
${zip} ${city}
${city}, ${todayCH()}`;

  $("letterText").value = body;
  setStatus("copyStatus", "Text aktualisiert.", "ok", 1200);
}

async function copyToClipboard() {
  const text = $("letterText").value.trim();
  if (!text) {
    setStatus("copyStatus", "Bitte zuerst Text generieren.", "warn", 1600);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("copyStatus", "Kopiert ✓", "ok", 1200);
  } catch {
    try {
      $("letterText").focus();
      $("letterText").select();
      const ok = document.execCommand("copy");
      setStatus("copyStatus", ok ? "Kopiert ✓" : "Kopieren fehlgeschlagen.", ok ? "ok" : "warn", 1500);
    } catch {
      setStatus("copyStatus", "Kopieren fehlgeschlagen (Browserrechte).", "warn", 1800);
    }
  }
}

function openMail() {
  const subject = "Bestreitung Umtriebsentschädigung";
  const body = $("letterText").value.trim();
  if (!body) {
    setStatus("mailStatus", "Bitte zuerst Text generieren.", "warn", 1800);
    return;
  }
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  setStatus("mailStatus", "Mailfenster wird geöffnet…", "ok", 1500);
}

let recognition = null;
function initDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus("dictStatus", "Diktieren nicht verfügbar (Browser).", "warn");
    $("btnDictate").disabled = true;
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "de-CH";
  recognition.interimResults = true;
  recognition.continuous = true;

  let finalChunk = "";

  recognition.onstart = () => {
    $("btnDictate").disabled = true;
    $("btnStopDictate").disabled = false;
    setStatus("dictStatus", "Diktieren läuft…");
  };
  recognition.onerror = (e) => setStatus("dictStatus", `Diktierfehler: ${e.error}`, "warn");
  recognition.onend = () => {
    $("btnDictate").disabled = false;
    $("btnStopDictate").disabled = true;
    setStatus("dictStatus", "");
    finalChunk = "";
  };
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalChunk += transcript;
      else interim += transcript;
    }
    if (interim.trim()) setStatus("dictStatus", `…${interim.trim()}`);
    if (finalChunk.trim()) {
      insertAtCursor($("letterText"), finalChunk);
      finalChunk = "";
      setStatus("dictStatus", "✓ eingefügt", "ok", 700);
    }
  };
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const needsSpace = before && !before.endsWith("\n") && !before.endsWith(" ") ? " " : "";
  const insertText = needsSpace + text.trim() + " ";
  textarea.value = before + insertText + after;
  const newPos = (before + insertText).length;
  textarea.focus();
  textarea.setSelectionRange(newPos, newPos);
}

function startDictation() {
  if (!recognition) return;
  try { recognition.start(); } catch {}
}
function stopDictation() {
  if (!recognition) return;
  recognition.stop();
}

function resetFields() {
  ["firstName","lastName","address","zip","city","plate","eventDate","eventTime","location","driverName"].forEach(id => $(id).value = "");
  currentTone = "neutral";
  document.querySelectorAll(".toneBtn").forEach(b => b.classList.remove("active"));
  const neutralBtn = document.querySelector('.toneBtn[data-tone="neutral"]');
  if (neutralBtn) neutralBtn.classList.add("active");
  $("toneLabel").textContent = toneLabel("neutral");
  $("letterText").value = "";
  setStatus("copyStatus", "");
  setStatus("mailStatus", "");
  setStatus("dictStatus", "");
  updateSummary();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".toneBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTone = btn.dataset.tone;
      document.querySelectorAll(".toneBtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $("toneLabel").textContent = toneLabel(currentTone);
      generateLetterText();
    });
  });

  ["plate","eventDate","eventTime","location"].forEach(id => {
    $(id).addEventListener("input", updateSummary);
    $(id).addEventListener("change", updateSummary);
  });
  updateSummary();

  $("btnGenerate").addEventListener("click", generateLetterText);
  $("btnCopy").addEventListener("click", copyToClipboard);
  $("btnMail").addEventListener("click", openMail);
  $("btnReset").addEventListener("click", resetFields);

  initDictation();
  $("btnDictate").addEventListener("click", startDictation);
  $("btnStopDictate").addEventListener("click", stopDictation);
});


