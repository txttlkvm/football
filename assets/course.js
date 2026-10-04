
    const slides=[...document.querySelectorAll(".slide")];let current=0;
    const state={score:0,completed:new Set(),visited:new Set([0]),cues:[],priority:"Not selected"};
    let sequence=["WRAP","TRACK","DRIVE","BREAK DOWN","FIT"];const requiredSequence=["TRACK","BREAK DOWN","FIT","WRAP","DRIVE"];
    const diagnosisData=[["Overrun angle","ANGLE","Track the near hip."],["Upright level","LEVEL","Shorten steps. Lower hips."],["Lost eyes","EYES","Eyes up. See the hip."],["No wrap","WRAP","Secure the wrap before the finish."]];
    const gameData=[["Runner turns the corner; defender closes from inside.","Track the near hip. Keep the edge.","Sprint to where the runner was.","Track the hip"],["Player is balanced, but arms are wide.","Coach one controlled wrap-and-drive rep.","Launch through contact.","Wrap up"],["Player secures the runner, then stops feet.","Wrap and run on the next rep.","Add full-speed open-field contact.","Drive your feet"]];

    function updateUI(){courseProgress.style.width=(state.visited.size/slides.length*100)+"%";progressText.textContent=(current+1)+" / "+slides.length;scoreReadout.textContent=state.score+" pts";finalScore.textContent=state.score+" pts";prevButton.disabled=current===0;nextButton.disabled=current===slides.length-1;document.querySelectorAll(".navbutton").forEach(b=>b.classList.remove("current"))}
    function goTo(index){current=Math.max(0,Math.min(index,slides.length-1));slides.forEach((s,i)=>s.classList.toggle("active",i===current));state.visited.add(current);updateUI()}
    function nextSlide(){if(current<slides.length-1)goTo(current+1)}function previousSlide(){if(current>0)goTo(current-1)}
    function complete(id,points=8){if(!state.completed.has(id)){state.completed.add(id);state.score+=points;updateUI()}}function addCue(cue){if(!state.cues.includes(cue))state.cues.push(cue)}

    // Keep the authored 16:9 stage intact inside narrow Canva and mobile previews.
    function fitCourseStage(){
      const scale=Math.min(window.innerWidth/1440,window.innerHeight/810);
      document.documentElement.style.setProperty('--stage-scale',String(scale));
    }
    fitCourseStage();
    window.addEventListener('resize',fitCourseStage,{passive:true});

// Preserve the original keyboard navigation, with form controls left to native keyboard behavior.
document.addEventListener("keydown",e=>{if(e.target.matches("button,input,select,textarea"))return;if(e.key==="ArrowRight")nextSlide();if(e.key==="ArrowLeft")previousSlide()});
