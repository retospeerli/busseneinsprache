const $ = (id) => document.getElementById(id);

let tone = "neutral";
let mode = "contest"; // contest | refund

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

function toneIntroContest() {
  if (tone === "happy") {
    return "Besten Dank vorab für die Prüfung dieses Anliegens.";
  }
  if (tone === "grumpy") {
    return "Auch wenn eine solche Bestreitung unnötig aufwändig erscheint, nehme ich hierzu formell Stellung.";
  }
  return "Hiermit bestreite ich die mir zugestellte Umtriebsentschädigung vollumfänglich.";
}

function toneClosingContest() {
  if (tone === "happy") {
    return "Ich danke Ihnen im Voraus für die Prüfung und die schriftliche Bestätigung der Annullierung.";
  }
  if (tone === "grumpy") {
    return "Ich danke Ihnen für die Prüfung und erwarte eine schriftliche Bestätigung der Annullierung.";
  }
  return "Ich fordere daher die vollständige Annullierung der Forderung und eine entsprechende schriftliche Bestätigung.";
}

function toneIntroRefund() {
  if (tone === "happy") {
    return "Besten Dank vorab für die Prüfung dieses Rückforderungsbegehrens.";
  }
  if (tone === "grumpy") {
    return "Nachdem ich die Rechtslage näher geprüft habe, fordere ich die bereits bezahlte Umtriebsentschädigung hiermit formell zurück.";
  }
  return "Hiermit fordere ich die bereits bezahlte Umtriebsentschädigung zurück.";
}

function toneClosingRefund() {
  if (tone === "happy") {
    return "Ich danke Ihnen im Voraus für die Rückerstattung und die kurze schriftliche Bestätigung.";
  }
  if (tone === "grumpy") {
    return "Ich ersuche um Rückerstattung innert angemessener Frist und um eine kurze schriftliche Bestätigung.";
  }
  return "Ich fordere Sie daher auf, den bezahlten Betrag innert angemessener Frist zurückzuerstatten und mir die Rückzahlung schriftlich zu bestätigen.";
}

function buildSignatureBlock(first, last, address, city) {
  const today = new Date().toLocaleDateString("de-CH");
  const signatureLines = [];

  if (first) signatureLines.push(first);
  signatureLines.push("");

  const fullName = `${first} ${last}`.trim();
  if (fullName) signatureLines.push(fullName);

  if (address) signatureLines.push(address);
  if (city) signatureLines.push(city);

  signatureLines.push("");
  signatureLines.push(city ? `${city}, ${today}` : today);

  return signatureLines.join("\n");
}

function generateContestText(data) {
  const driverSentence = data.driver
    ? `Fahrzeuglenker war ${data.driver}.`
    : "";

  return `Sehr geehrte Damen und Herren

${toneIntroContest()}

Die Forderung betrifft das Fahrzeug mit dem Kennzeichen ${data.plate || "[Autokennzeichen]"}, angeblich parkierend am ${data.date} um ${data.time} auf dem Parkplatz ${data.location || "[Ort / Schulareal]"}. ${driverSentence}

Am betreffenden Parkplatz ist keine klare und vollständige Signalisation einer Gebührenpflicht oder der entsprechenden Zahlungsmodalitäten ersichtlich. Die vorhandene Beschilderung beschränkt sich auf ein audienzrichterliches Parkverbot für unberechtigte Drittpersonen. Eine Gebührenpflicht für berechtigte Nutzer ist daraus nicht erkennbar.

Nach den Grundsätzen von Treu und Glauben (Art. 2 ZGB) sowie dem Vertrauensschutz (Art. 9 BV) müssen Gebühren- oder Sanktionsregelungen für Nutzer klar und unmittelbar am Ort der Nutzung erkennbar sein. Diese Voraussetzungen sind vorliegend nicht erfüllt.

Mangels klarer und rechtskonformer Signalisation bestand für mich keine Möglichkeit, eine angebliche Gebührenpflicht zu erkennen oder korrekt zu erfüllen.

${toneClosingContest()}

Freundliche Grüsse

${data.signature}`;
}

function generateRefundText(data) {
  const driverSentence = data.driver
    ? `Fahrzeuglenker war ${data.driver}.`
    : "";

  return `Sehr geehrte Damen und Herren

${toneIntroRefund()}

Die bereits bezahlte Forderung betrifft das Fahrzeug mit dem Kennzeichen ${data.plate || "[Autokennzeichen]"}, angeblich parkierend am ${data.date} um ${data.time} auf dem Parkplatz ${data.location || "[Ort / Schulareal]"}. ${driverSentence}

Die Rückforderung stützt sich auf die Regeln der ungerechtfertigten Bereicherung (Art. 62 OR). Wurde eine Zahlung ohne gültige rechtliche Grundlage geleistet, ist sie zurückzuerstatten. Wurde eine Nichtschuld freiwillig bezahlt, ist die Rückforderung nach Art. 63 OR möglich, wenn die Zahlung im Irrtum über die angebliche Zahlungspflicht erfolgt ist.

Vorliegend bestand am betreffenden Parkplatz keine klare und vollständige Signalisation einer Gebührenpflicht oder der entsprechenden Zahlungsmodalitäten. Die vorhandene Beschilderung beschränkt sich auf ein audienzrichterliches Parkverbot für unberechtigte Drittpersonen. Eine Gebührenpflicht für berechtigte Nutzer war daraus nicht klar erkennbar.

Nach Art. 2 ZGB sowie Art. 9 BV müssen Rechtsfolgen, Gebührenpflichten und belastende Nutzungsbedingungen für Betroffene klar und verlässlich erkennbar sein. Fehlt eine rechtsgenügende Signalisation, fehlt es an einer tragfähigen Grundlage für eine solche Forderung.

Die Zahlung erfolgte daher ohne hinreichende rechtliche Grundlage bzw. im Irrtum über eine angebliche Zahlungspflicht. Der entsprechende Rückforderungsanspruch verjährt nach Art. 67 OR grundsätzlich drei Jahre ab Kenntnis des Anspruchs, in jedem Fall aber zehn Jahre nach seiner Entstehung.

${toneClosingRefund()}

Freundliche Grüsse

${data.signature}`;
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

  const signature = buildSignatureBlock(first, last, address, city);

  const data = {
    plate,
    date,
    time,
    location,
    driver,
    signature
  };

  $("letterText").value =
    mode === "refund"
      ? generateRefundText(data)
      : generateContestText(data);
}

function copy() {
  navigator.clipboard.writeText($("letterText").value);
}

function mail() {
  const recipient = "sicherheit@seewache.ch";
  const subject =
    mode === "refund"
      ? "Rückforderung Umtriebsentschädigung"
      : "Bestreitung Umtriebsentschädigung";
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

  document.querySelectorAll(".mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll(".mode").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      generate();
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
