const $ = (id) => document.getElementById(id);

let tone = "neutral";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatSwissDate(dateValue) {
  if (!dateValue) return "[Datum]";
  const [year, month, day] = dateValue.split("-");
  return `${day}.${month}.${year}`;
}

function populateTimeSelects() {
  const hourSelect = $("eventHour");
  const minuteSelect = $("eventMinute");

  hourSelect.innerHTML = "";
  minuteSelect.innerHTML = "";

  for (let h = 0; h < 24; h++) {
    const option = document.createElement("option");
    option.value = pad2(h);
    option.textContent = pad2(h);
    hourSelect.appendChild(option);
  }

  for (let m = 0; m < 60; m++) {
    const option = document.createElement("option");
    option.value = pad2(m);
    option.textContent = pad2(m);
    minuteSelect.appendChild(option);
  }
}

function setTodayAsDefaultDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  $("eventDate").value = `${yyyy}-${mm}-${dd}`;
}

function setCurrentTimeAsDefault() {
  const now = new Date();
  $("eventHour").value = pad2(now.getHours());
  $("eventMinute").value = pad2(now.getMinutes());
}

function toneIntro() {
  if (tone === "happy") {
    return "Besten Dank vorab für die Prüfung dieses Anliegens.";
  }

  if (tone === "grumpy") {
    return "Auch wenn eine solche Bestreitung unnötig aufwändig erscheint, nehme ich hierzu formell Stellung.";
  }

  return "Hiermit bestreite ich die mir zugestellte Umtriebsentschädigung vollumfänglich.";
}

function toneClosing() {
  if (tone === "happy") {
    return "Ich danke Ihnen im Voraus für die Prüfung und die schriftliche Bestätigung der Annullierung.";
  }

  if (tone === "grumpy") {
    return "Ich danke Ihnen für die Prüfung und erwarte eine schriftliche Bestätigung der Annullierung.";
  }

  return "Ich fordere daher die vollständige Annullierung der Forderung und eine entsprechende schriftliche Bestätigung.";
}

function generate() {
  const first = $("firstName").value.trim();
  const last = $("lastName").value.trim();
  const address = $("address").value.trim();
  const city = $("city").value.trim();

  const plate = $("plate").value.trim();
  const date = formatSwissDate($("eventDate").value);
  const time = `${$("eventHour").value}:${$("eventMinute").value}`;
  const location = $("location").value.trim();
  const driver = $("driverName").value.trim();

  const today = new Date().toLocaleDateString("de-CH");

  const driverSentence = driver
    ? `Fahrzeuglenker war ${driver}.`
    : "";

  const signatureLines = [];

  if (first) signatureLines.push(first);
  signatureLines.push("");

  const fullName = `${first} ${last}`.trim();
  if (fullName) signatureLines.push(fullName);

  if (address) signatureLines.push(address);
  if (city) signatureLines.push(city);

  signatureLines.push("");
  signatureLines.push(city ? `${city}, ${today}` : today);

  const signatureBlock = signatureLines.join("\n");

  const text = `Sehr geehrte Damen und Herren

${toneIntro()}

Die Forderung betrifft das Fahrzeug mit dem Kennzeichen ${plate || "[Autokennzeichen]"}, angeblich parkierend am ${date} um ${time} auf dem Parkplatz ${location || "[Ort / Schulareal]"}. ${driverSentence}

Am betreffenden Parkplatz ist keine klare und vollständige Signalisation einer Gebührenpflicht oder der entsprechenden Zahlungsmodalitäten ersichtlich. Die vorhandene Beschilderung beschränkt sich auf ein audienzrichterliches Parkverbot für unberechtigte Drittpersonen. Eine Gebührenpflicht für berechtigte Nutzer ist daraus nicht erkennbar.

Nach den Grundsätzen von Treu und Glauben (Art. 2 ZGB) sowie dem Vertrauensschutz (Art. 9 BV) müssen Gebühren- oder Sanktionsregelungen für Nutzer klar und unmittelbar am Ort der Nutzung erkennbar sein. Diese Voraussetzungen sind vorliegend nicht erfüllt.

Mangels klarer und rechtskonformer Signalisation bestand für mich keine Möglichkeit, eine angebliche Gebührenpflicht zu erkennen oder korrekt zu erfüllen.

${toneClosing()}

Freundliche Grüsse

${signatureBlock}`;

  $("letterText").value = text;
}

function copy() {
  navigator.clipboard.writeText($("letterText").value);
}

function mail() {
  const recipient = "sicherheit@seewache.ch";
  const subject = "Bestreitung Umtriebsentschädigung";
  const body = $("letterText").value;

  window.location.href =
    `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tone").forEach((btn) => {
    btn.addEventListener("click", () => {
      tone = btn.dataset.tone;
      document.querySelectorAll(".tone").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  populateTimeSelects();
  setTodayAsDefaultDate();
  setCurrentTimeAsDefault();

  $("btnGenerate").addEventListener("click", generate);
  $("btnCopy").addEventListener("click", copy);
  $("btnMail").addEventListener("click", mail);

  generate();
});
