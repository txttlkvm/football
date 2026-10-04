/* Original rendered youth-football artwork. All assets are local and portable. */
let playerSerial = 0;
const playerArtwork = Object.freeze({
  defender: Object.freeze({
    pursuit:'assets/artwork/defender-pursuit.png',
    balanced:'assets/artwork/defender-balanced.png',
    breakdown:'assets/artwork/defender-balanced.png',
    coach:'assets/artwork/defender-balanced.png',
    upright:'assets/artwork/defender-upright.png',
    eyes:'assets/artwork/defender-eyes.png',
    lunge:'assets/artwork/defender-lunge.png',
    nowrap:'assets/artwork/defender-open.png',
    hit:'assets/artwork/defender-open.png',
    overrun:'assets/artwork/defender-pursuit.png'
  }),
  runner:'assets/artwork/runner-carry.png',
  coachEyes:'assets/artwork/defender-eyes-3.png',
  coachRunner:'assets/artwork/runner-carry-9.png',
  contact:Object.freeze({
    fit:'assets/artwork/pair-fit.png',
    wrap:'assets/artwork/pair-wrap.png',
    drive:'assets/artwork/pair-drive.png',
    stopped:'assets/artwork/pair-stopped.png'
  }),
  coachFit:'assets/artwork/pair-fit-3-9.png'
});
const playerPoseLabels=Object.freeze({
  pursuit:'pursuing the runner',balanced:'low, balanced ready position',
  breakdown:'low, balanced breakdown',upright:'poor upright arrival',
  eyes:'eyes and head down',lunge:'overextended forward lunge',
  nowrap:'arms open without a secure wrap',hit:'arms open as the runner escapes',
  overrun:'running beyond the near hip',fit:'controlled shoulder fit',
  wrap:'secured wrap',drive:'secured wrap with driving feet',
  stopped:'secured wrap with feet stopped at contact'
});
function contactPose(role,pose) {
  return role==='defender'&&Object.prototype.hasOwnProperty.call(playerArtwork.contact,pose);
}
// Keep the retained activity factory name: the result is rendered artwork, not SVG.
function playerSVG(role='defender',pose='balanced',number=role==='runner'?'1':'5') {
  playerSerial++;
  const pair=contactPose(role,pose),coach=String(number)==='3';
  const src=pair?(coach&&pose==='fit'?playerArtwork.coachFit:playerArtwork.contact[pose]):
    role==='runner'?(String(number)==='9'?playerArtwork.coachRunner:playerArtwork.runner):
    coach&&pose==='eyes'?playerArtwork.coachEyes:playerArtwork.defender[pose]||playerArtwork.defender.balanced;
  // Paired poses are authored as one composition; their hands and contact stay aligned.
  const defenderNumber=coach&&pose==='fit'?'3':'5';
  const runnerNumber=coach&&pose==='fit'?'9':'1';
  const alt=pair?`Defender number ${defenderNumber} and runner number ${runnerNumber}: ${playerPoseLabels[pose]}`:
    role==='runner'?`Runner number ${String(number)==='9'?'9':'1'} carrying the football`:
    `Defender number ${coach&&pose==='eyes'?'3':'5'}: ${playerPoseLabels[pose]||playerPoseLabels.balanced}`;
  return `<img class="football-player rendered-player${pair?' rendered-pair':''}" src="${src}" width="${pair?300:150}" height="184" alt="${alt}" data-artwork-pose="${pose}" decoding="async" draggable="false">`;
}
function actor(role,pose,number,style='',extra='') {
  return `<div class="player-actor ${role}${contactPose(role,pose)?' contact-pair':''} ${extra}" style="${style}" data-pose="${pose}" data-number="${number}">${playerSVG(role,pose,number)}</div>`;
}
function sceneMarkup(scene='pursuit',mini=false) {
  let pose=scene;
  let runner=true;
  let defenderStyle='left:14%;bottom:12%;', runnerStyle='right:13%;bottom:31%;';
  let label='TRACK THE NEAR HIP', note='Inside-out. Stay connected.',path=true;
  if(['upright','balanced','lunge','breakdown','eyes','coach'].includes(scene)) {
    runner=false;defenderStyle='left:35%;bottom:14%;';path=false;
    label={upright:'HIPS HIGH',balanced:'FEET UNDER HIPS',lunge:'WEIGHT TOO FAR FORWARD',breakdown:'SHORT STEPS · LOW HIPS',eyes:'PAUSE · EYES DROP',coach:'WATCH → ONE CUE → REPLAY'}[scene];
    note={upright:'Little room to react.',balanced:'Ready to change direction.',lunge:'A long stride costs balance.',breakdown:'Stay low. Stay balanced.',eyes:'Restore visual connection.',coach:'Coach the next action.'}[scene];
    if(scene==='coach')pose='balanced';
  }
  if(['wrap','drive','fit','stopped','hit','nowrap'].includes(scene)) {
    defenderStyle='left:28%;bottom:17%;';runnerStyle='left:48%;bottom:19%;';path=false;
    label={nowrap:'PAUSE · ARMS OPEN',wrap:'SECURE THE WRAP',fit:'ARRIVE UNDER CONTROL',drive:'WRAP AND RUN',stopped:'PAUSE · FEET STOP',hit:'ARMS OPEN · RUNNER ESCAPES'}[scene];
    note={nowrap:'One clear correction.',wrap:'Finish the tackle.',fit:'Near foot, near shoulder.',drive:'Drive your feet.',stopped:'Contact is not the finish.',hit:'Don’t chase the hit.'}[scene];
    if(scene==='hit')runnerStyle='right:8%;bottom:22%;';
  }
  if(scene==='overrun'){label='RUNNER TURNS THE CORNER';note='The first failure is the angle.';defenderStyle='left:57%;bottom:17%;';runnerStyle='right:13%;bottom:32%;';}
  if(scene==='pursuit')pose='pursuit';
  if(contactPose('defender',pose))runner=false;
  return `<span class="field-caption">${label||'CONTROLLED REP'}</span>${path?`<svg class="route-overlay" viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow-${scene}-${playerSerial}" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#ffc83d"/></marker></defs><path d="M135 254 Q230 180 435 159" fill="none" stroke="#ffc83d" stroke-width="4" stroke-dasharray="10 7"/><path d="M430 135 L510 110" fill="none" stroke="#fff9e9" stroke-width="3"/><path d="M499 106 L511 110 L504 122" fill="none" stroke="#fff9e9" stroke-width="3"/></svg>`:''}${actor('defender',pose,'5',defenderStyle)}${runner?actor('runner','runner','1',runnerStyle):''}<span class="field-note">${note||'Track the hip.'}</span>${mini?'':'<div class="field-legend"><span><i></i> DEFENDER · 5</span><span><i></i> RUNNER · 1</span></div>'}`;
}
function paintScene(field,scene,mini=false){field.dataset.scene=scene;field.innerHTML=sceneMarkup(scene,mini);}
