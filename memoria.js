window.addEventListener("DOMContentLoaded", () => {
  const refs = {
    board: document.getElementById("game-board"),
    difficulty: document.getElementById("difficulty"),
    restart: document.getElementById("restart"),
    timer: document.getElementById("timer"),
    attempts: document.getElementById("attempts"),
    best: document.getElementById("bestScore"),
    match: document.getElementById("match-sound"),
    error: document.getElementById("error-sound"),
  };
  const needed = Object.entries(refs).filter(([k,v]) => !v).map(([k])=>k);
  if (needed.length){ alert("Elementos ausentes: "+needed.join(", ")); return; }

  const emojis = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦"];
  let first=null, second=null, lock=false, matches=0, attempts=0, secs=0, timerInt, size=4;

  const safePlay = a => { try{ a && a.play && a.play(); }catch(_){} };

  function start(){
    clearInterval(timerInt);
    refs.board.innerHTML = "";
    attempts=0; secs=0; matches=0; refs.attempts.textContent="0"; refs.timer.textContent="0";
    size = parseInt(refs.difficulty.value,10);
    refs.board.style.gridTemplateColumns = `repeat(${size}, minmax(56px, 1fr))`;

    const choose = emojis.slice(0, (size*size)/2);
    const deck = [...choose, ...choose].sort(()=>Math.random()-0.5);

    deck.forEach(icon=>{
      const c = document.createElement("div");
      c.className="card";
      c.dataset.icon=icon;
      c.addEventListener("click", flip);
      refs.board.appendChild(c);
    });

    timerInt = setInterval(()=>{ secs++; refs.timer.textContent=String(secs); },1000);
    loadBest();
  }

  function flip(){
    if(lock || this===first || this.classList.contains("flipped")) return;
    this.textContent = this.dataset.icon;
    this.classList.add("flipped");
    if(!first){ first=this; return; }
    second=this; attempts++; refs.attempts.textContent=String(attempts); check();
  }

  function check(){
    if(first.dataset.icon===second.dataset.icon){
      safePlay(refs.match); reset();
      matches++; if(matches===(size*size)/2){ clearInterval(timerInt); saveBest(); setTimeout(()=>alert("🎉 Você venceu!"),200); }
    }else{
      safePlay(refs.error); lock=true; setTimeout(()=>{
        first.textContent=""; second.textContent="";
        first.classList.remove("flipped"); second.classList.remove("flipped"); reset();
      },700);
    }
  }
  const reset=()=>{ first=null; second=null; lock=false; };

  function saveBest(){
    const key=`best_${size}x${size}`;
    const prev=parseInt(localStorage.getItem(key)||"0",10);
    if(!prev || attempts<prev) localStorage.setItem(key,String(attempts));
    loadBest();
  }
  function loadBest(){
    const key=`best_${size}x${size}`;
    const rec=localStorage.getItem(key);
    refs.best.textContent= rec ? rec : "-";
  }

  refs.restart.addEventListener("click", start);
  refs.difficulty.addEventListener("change", start);
  start();
});
