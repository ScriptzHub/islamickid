// ----- CONFIG -----
const RAMADAN_DATE = new Date("2026-02-18T00:00:00Z");
let leaderboard = JSON.parse(localStorage.getItem("recentVerses")||"[]");

// ----- RAMADAN COUNTDOWN -----
function updateCountdown(){
  const now = new Date();
  const diff = RAMADAN_DATE - now;
  const cdEl = document.getElementById("countdown");

  if(diff<=0){ cdEl.innerHTML="RAMADAN HAS BEGUN!!!"; return; }

  const d = Math.floor(diff/86400000),
        h = Math.floor((diff/3600000)%24),
        m = Math.floor((diff/60000)%60),
        s = Math.floor((diff/1000)%60);

  cdEl.innerHTML=`${d}d ${h}h ${m}m ${s}s`;
}
setInterval(updateCountdown,1000);
updateCountdown();

// ----- VOTE SYSTEM -----
function vote(){
  const last=localStorage.getItem("voteTime"), now=Date.now();
  if(last && now-last<86400000){ alert("You can vote again in 24 hours!"); return; }

  let count=parseInt(localStorage.getItem("votes")||"0");
  count++;
  localStorage.setItem("votes",count);
  localStorage.setItem("voteTime",now);
  document.getElementById("votes").innerText="Votes: "+count;
}
document.getElementById("votes").innerText="Votes: "+(localStorage.getItem("votes")||0);

// ----- PRAYER TIMES -----
async function loadPrayerTimes(){
  try{
    const res=await fetch("https://api.aladhan.com/v1/timingsByCity?city=London&country=UK&method=2");
    const data=await res.json();
    const t=data.data.timings;
    const table=document.getElementById("prayerTable");
    table.innerHTML=`
      <tr><td>Fajr</td><td>${t.Fajr}</td></tr>
      <tr><td>Dhuhr</td><td>${t.Dhuhr}</td></tr>
      <tr><td>Asr</td><td>${t.Asr}</td></tr>
      <tr><td>Maghrib</td><td>${t.Maghrib}</td></tr>
      <tr><td>Isha</td><td>${t.Isha}</td></tr>
    `;
  }catch{
    document.getElementById("prayerTable").innerHTML="<tr><td>Prayer times unavailable</td></tr>";
  }
}
loadPrayerTimes();

// ----- VERSE GENERATOR -----
function formatText(s){return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();}

async function getVerse(){
  const surah=Math.floor(Math.random()*114)+1;
  const res=await fetch(`https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,en.asad,en.transliteration`);
  const data=await res.json();
  const a=data.data[0].ayahs, e=data.data[1].ayahs, t=data.data[2].ayahs;
  const i=Math.floor(Math.random()*a.length);

  const verseText=`${a[i].text}<br>${formatText(e[i].text)}<br>${t[i].text}<br>${data.data[0].englishName} — Ayah ${a[i].numberInSurah}`;
  const verseDiv=document.getElementById("verse");
  verseDiv.innerHTML=verseText;
  verseDiv.scrollTop=0; // always show top
  verseDiv.classList.add("flash"); setTimeout(()=>verseDiv.classList.remove("flash"),300);

  leaderboard.unshift(formatText(e[i].text));
  if(leaderboard.length>5) leaderboard.pop();
  localStorage.setItem("recentVerses",JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard(){
  const lb=document.getElementById("leaderboard");
  lb.innerHTML=leaderboard.map(v=>`- ${v}`).join("<br>");
}

// ----- COPY VERSE -----
function copyVerse(){
  const v=document.getElementById("verse").innerText;
  navigator.clipboard.writeText(v);
  alert("Verse copied!");
}
