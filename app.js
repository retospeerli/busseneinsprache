const $ = id => document.getElementById(id)

let tone = "neutral"

document.querySelectorAll(".tone").forEach(btn=>{
btn.onclick=()=>{
tone = btn.dataset.tone

document.querySelectorAll(".tone").forEach(b=>b.classList.remove("active"))
btn.classList.add("active")
}
})


function toneIntro(){

if(tone==="happy")
return "Besten Dank vorab für die Prüfung dieses Anliegens."

if(tone==="grumpy")
return "Auch wenn eine solche Bestreitung unnötig aufwändig erscheint, nehme ich hierzu formell Stellung."

return "Hiermit bestreite ich die mir zugestellte Umtriebsentschädigung vollumfänglich."
}


function toneClosing(){

if(tone==="happy")
return "Ich danke Ihnen im Voraus für die Prüfung und die schriftliche Bestätigung der Annullierung."

if(tone==="grumpy")
return "Ich danke Ihnen für die Prüfung und erwarte eine schriftliche Bestätigung der Annullierung."

return "Ich fordere daher die vollständige Annullierung der Forderung und eine entsprechende schriftliche Bestätigung."
}


function generate(){

const first = $("firstName").value
const last = $("lastName").value
const address = $("address").value
const city = $("city").value

const plate = $("plate").value
const date = $("eventDate").value
const time = $("eventTime").value
const location = $("location").value
const driver = $("driverName").value

const today = new Date().toLocaleDateString("de-CH")

const text = `Sehr geehrte Damen und Herren

${toneIntro()}

Die Forderung betrifft das Fahrzeug mit dem Kennzeichen ${plate}, angeblich parkierend am ${date} um ${time} auf dem Parkplatz ${location}. Fahrzeuglenker war ${driver}.

Am betreffenden Parkplatz ist keine klare und vollständige Signalisation einer Gebührenpflicht oder der entsprechenden Zahlungsmodalitäten ersichtlich. Die vorhandene Beschilderung beschränkt sich auf ein audienzrichterliches Parkverbot für unberechtigte Drittpersonen. Eine Gebührenpflicht für berechtigte Nutzer ist daraus nicht erkennbar.

Nach den Grundsätzen von Treu und Glauben (Art. 2 ZGB) sowie dem Vertrauensschutz (Art. 9 BV) müssen Gebühren- oder Sanktionsregelungen für Nutzer klar und unmittelbar am Ort der Nutzung erkennbar sein. Diese Voraussetzungen sind vorliegend nicht erfüllt.

Mangels klarer und rechtskonformer Signalisation bestand für mich keine Möglichkeit, eine angebliche Gebührenpflicht zu erkennen oder korrekt zu erfüllen.

${toneClosing()}

Freundliche Grüsse

${first}

${first} ${last}
${address}
${city}

${city}, ${today}`

$("letterText").value = text
}


function copy(){

navigator.clipboard.writeText($("letterText").value)

}


function mail(){

const recipient = "sicherheit@seewache.ch"
const subject = "Bestreitung Umtriebsentschädigung"
const body = $("letterText").value

window.location.href =
`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

}


$("btnGenerate").onclick = generate
$("btnCopy").onclick = copy
$("btnMail").onclick = mail
