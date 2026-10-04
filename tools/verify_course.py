"""Functional and screenshot QA. Run with the static server on port 8000."""
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
from pathlib import Path
import json
root=Path('/workspace/football');out=root/'qa/after';out.mkdir(exist_ok=True)
report={'viewports':{},'checks':[],'errors':[],'external_requests':[]}
checks=report['checks']
def record(name,condition):
 checks.append({'check':name,'passed':bool(condition)})
 assert condition,name
layout_js='''() => {
 const s=document.querySelector('.slide.active');const sr=s.getBoundingClientRect();
 const issues=[];const visible=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.height>0};
 for(const e of s.querySelectorAll('button,p,h1,h2,h3,.feedback,.player-actor')){
  if(!visible(e))continue;const r=e.getBoundingClientRect();
  if(r.bottom>sr.bottom+1||r.top<sr.top-1||r.left<sr.left-1||r.right>sr.right+1)issues.push('outside slide: '+(e.id||e.className));
  const box=e.closest('.diagnostic-card,.scenario-card,.pose-choice,.decision-panel,.teach-panel');
  if(box){const br=box.getBoundingClientRect();if(r.bottom>br.bottom+1||r.top<br.top-1)issues.push('outside card: '+(e.id||e.className));}
  if(e.matches('.player-actor')){const f=e.closest('.field');if(f){const fr=f.getBoundingClientRect();if(r.top<fr.top-1||r.bottom>fr.bottom+1||r.left<fr.left-1||r.right>fr.right+1)issues.push('clipped player: '+(e.id||e.className));}}
 }
 for(const e of s.querySelectorAll('.feedback,.diagnostic-card,.scenario-card,.decision-panel,.teach-panel,#sortList')){
  if(visible(e)&&e.scrollHeight>e.clientHeight+2)issues.push('overflow: '+(e.id||e.className));
 }
 if(document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth)issues.push('page scroll');
 return issues;
}'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':810},device_scale_factor=1)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('request',lambda r:report['external_requests'].append(r.url) if not r.url.startswith('http://127.0.0.1:8000') else None)
 page.goto('http://127.0.0.1:8000/');page.wait_for_timeout(400)
 record('22 real slides',page.locator('.slide').count()==22)
 record('10 TEACH / TRY pairs in exact alternating order',page.evaluate("slides.map(s=>s.dataset.kind).join(',')")=='intro,'+','.join(['teach,try']*10)+',completion')
 record('no PREP category',page.locator('main').inner_text().find('TEACH · PREP')<0)
 record('no circle-only player nodes',page.locator('.player-dot,.runner-dot').count()==0)
 record('rendered player artwork exists and loads',page.locator('img.football-player').count()>30 and page.locator('img.football-player').evaluate_all('imgs => imgs.every(img => img.complete && img.naturalWidth > 0)'))
 record('previous disabled at start',page.locator('#prevButton').is_disabled())
 # Walk through every slide using actual Next, preserving the current real count.
 for size in [{'width':1440,'height':810},{'width':1365,'height':768}]:
  page.set_viewport_size(size);page.evaluate('resetCourse()');key=f"{size['width']}x{size['height']}";report['viewports'][key]=[]
  sub=out if size['width']==1440 else out/key;sub.mkdir(exist_ok=True)
  for i in range(22):
   page.wait_for_timeout(330)
   issues=page.evaluate(layout_js)
   report['viewports'][key].append({'slide':i+1,'issues':issues})
   page.screenshot(path=str(sub/f'slide-{i+1:02}.png'))
   record(f'{key} slide {i+1} fits stage and cards',not issues)
   record(f'{key} slide {i+1} truthful slide total',page.locator('#progressText').inner_text()==f'{i+1} / 22')
   if i<21:page.locator('#nextButton').click()
  record(f'{key} Next disabled on completion',page.locator('#nextButton').is_disabled())
 page.set_viewport_size({'width':1440,'height':810});page.evaluate('resetCourse()')
 def goto(index):page.evaluate('(i)=>goTo(i)',index);page.wait_for_timeout(330)
 def snap(name):
  page.wait_for_timeout(750);issues=page.evaluate(layout_js);record(name+' feedback fits',not issues);page.screenshot(path=str(out/(name+'.png')))
 def points():return page.evaluate('state.score')
 # All choices for all ten activities. Wrong attempts are retriable and award no points.
 goto(2)
 for i in [0,2]:page.locator('#angleChoices button').nth(i).click();record('wrong angle earns no points',points()==0)
 snap('try-01-wrong');page.locator('#angleChoices button').nth(1).click();snap('try-01-correct');record('angle +10',points()==10)
 page.locator('[data-template-id=angle-retry]').click();record('angle retry resets movement',page.locator('#angleDefender').evaluate("e=>e.style.left")=='13%');page.locator('#angleChoices button').nth(1).click();record('angle cannot farm score',points()==10)
 goto(4)
 for i in [0,2]:page.locator('#breakdownChoices button').nth(i).click();record('wrong breakdown no points',points()==10)
 snap('try-02-wrong');page.locator('#breakdownChoices button').nth(1).click();snap('try-02-correct');record('breakdown +10',points()==20)
 page.locator('button:has-text("Retry position")').click();record('breakdown retry clears selection',page.locator('#breakdownChoices .correct').count()==0);page.locator('#breakdownChoices button').nth(1).click();record('breakdown cannot farm score',points()==20)
 goto(6)
 for i in [0,2,3]:page.locator('#repChoices button').nth(i).click();record('wrong eyes cue no points',points()==20)
 snap('try-03-wrong');page.locator('#repChoices button').nth(1).click();snap('try-03-correct');record('eyes +10',points()==30)
 page.locator('#replayButton').click();record('eyes replay restores pause',page.locator('#repCaption').inner_text()=='PAUSE · EYES DROP');page.locator('#repChoices button').nth(1).click();record('eyes cannot farm score',points()==30)
 goto(8);page.locator('button:has-text("Check sequence")').click();snap('try-04-wrong');record('wrong sequence no points',points()==30)
 # Solve only with the exposed arrow controls.
 for target,name in enumerate(['TRACK','BREAK DOWN','FIT','WRAP','DRIVE']):
  pos=page.locator('#sortList strong').all_text_contents().index(name)
  while pos>target:page.get_by_role('button',name='Move '+name+' up',exact=True).click();pos-=1
 page.locator('button:has-text("Check sequence")').click();snap('try-04-correct');record('sequence +10',points()==40)
 page.locator('[data-template-id=reset-sequence]').click();record('sequence reset shuffled',page.locator('#sortList strong').all_text_contents()[0]=='WRAP')
 goto(10)
 for i,item in enumerate(['ANGLE','LEVEL','EYES','WRAP','FEET']):
  card=page.locator('.diagnostic-card').nth(i)
  for wrong in ['ANGLE','LEVEL','EYES','WRAP','FEET']:
   if wrong!=item:card.get_by_role('button',name=wrong,exact=True).click()
 snap('try-05-wrong')
 for i,item in enumerate(['ANGLE','LEVEL','EYES','WRAP','FEET']):page.locator('.diagnostic-card').nth(i).get_by_role('button',name=item,exact=True).click()
 snap('try-05-correct');record('five diagnoses total +10',points()==50)
 page.locator('button:has-text("Retry diagnoses")').click();record('diagnosis retry clears feedback selections',page.locator('.diagnostic-card .correct').count()==0)
 for i,item in enumerate(['ANGLE','LEVEL','EYES','WRAP','FEET']):page.locator('.diagnostic-card').nth(i).get_by_role('button',name=item,exact=True).click()
 record('diagnoses cannot farm score',points()==50)
 goto(12);page.locator('#finishChoices button').nth(0).click();snap('try-06-wrong');record('wrong finish no points',points()==50);page.locator('#finishChoices button').nth(1).click();snap('try-06-correct');record('finish +10',points()==60)
 page.locator('button:has-text("Compare again")').click();record('finish retry resets selection',page.locator('#finishChoices .correct').count()==0);page.locator('#finishChoices button').nth(1).click();record('finish cannot farm score',points()==60)
 goto(14)
 for i in [0,2]:page.locator('#feetChoices button').nth(i).click();record('wrong feet cue no points',points()==60)
 snap('try-07-wrong');page.locator('#feetChoices button').nth(1).click();snap('try-07-correct');record('feet +10',points()==70)
 page.locator('button:has-text("Replay the pause")').click();record('feet replay stopped state',page.locator('#feetField').get_attribute('data-scene')=='stopped');page.locator('#feetChoices button').nth(1).click();record('feet cannot farm score',points()==70)
 goto(16)
 for i,correct in enumerate([1,0,2]):
  card=page.locator('#cueScenarios .scenario-card').nth(i)
  for j in range(3):
   if j!=correct:card.locator('button').nth(j).click()
 snap('try-08-wrong')
 for i,correct in enumerate([1,0,2]):page.locator('#cueScenarios .scenario-card').nth(i).locator('button').nth(correct).click()
 snap('try-08-correct');record('three cues total +10',points()==80);record('cue meter complete',page.locator('#cueProgress').inner_text()=='3 / 3 useful corrections')
 page.locator('button:has-text("Retry coaching cues")').click();record('cues retry resets meter',page.locator('#cueProgress').inner_text()=='0 / 3 useful corrections')
 for i,correct in enumerate([1,0,2]):page.locator('#cueScenarios .scenario-card').nth(i).locator('button').nth(correct).click()
 record('cues cannot farm score',points()==80)
 goto(18)
 for i in [1,2]:page.locator('#drillChoices button').nth(i).click();record('wrong KPI priority no points',points()==80)
 snap('try-09-wrong');page.locator('#drillChoices button').nth(0).click();snap('try-09-correct');record('KPI +10',points()==90);record('data decision records priority',page.evaluate('state.priority').startswith('Angle / leverage'))
 page.locator('button:has-text("Try another decision")').click();record('KPI retry clears selection',page.locator('#drillChoices .correct').count()==0);page.locator('#drillChoices button').nth(0).click();record('KPI cannot farm score',points()==90)
 goto(20)
 for i in range(3):page.locator('#gameScenarios .scenario-card').nth(i).locator('button').nth(1).click()
 snap('try-10-wrong');record('wrong game choices no points',points()==90);record('incorrect game decisions remain retriable',page.locator('#gameScore').inner_text()=='0 / 3')
 for i in range(3):page.locator('#gameScenarios .scenario-card').nth(i).locator('button').nth(0).click()
 snap('try-10-correct');record('all ten activities total 100',points()==100);record('game meter complete',page.locator('#gameScore').inner_text()=='3 / 3')
 for i in range(3):page.locator('#gameScenarios .scenario-card').nth(i).locator('button').nth(0).click()
 record('game cannot farm score',points()==100)
 page.locator('#nextButton').click();snap('completion-scored');page.screenshot(path=str(out/'slide-22.png'));record('completion score truthful',page.locator('#finalScore').inner_text()=='100 / 100');record('10 challenges completed',page.locator('#completionCount').inner_text()=='10 / 10 challenges completed');record('completion includes cues', 'Eyes up' in page.locator('#selectedCues').inner_text());record('completion includes data priority','Angle / leverage' in page.locator('#selectedPriority').inner_text())
 # Verify every representative feedback state also fits at 1365×768.
 page.set_viewport_size({'width':1365,'height':768})
 for i in [2,4,6,8,10,12,14,16,18,20,21]:
  goto(i);record(f'1365x768 solved slide {i+1} feedback fits',not page.evaluate(layout_js));page.screenshot(path=str(out/'1365x768'/f'state-{i+1:02}.png'))
 goto(21);page.locator('[data-template-id=reset-course]').click();record('restart resets score',points()==0);record('restart clears completed challenges',page.evaluate('state.completed.size')==0);record('restart clears cues',page.evaluate('state.cues.length')==0);record('restart returns intro',page.locator('#progressText').inner_text()=='1 / 22');record('restart hides replay',not page.locator('#replayButton').is_visible());record('restart clears highlights',page.locator('main .correct,main .wrong').count()==0)
 page.locator('#nextButton').click();record('Next navigates',page.locator('#progressText').inner_text()=='2 / 22');page.locator('#prevButton').click();record('Previous navigates',page.locator('#progressText').inner_text()=='1 / 22')
 page.locator('h1').click();page.keyboard.press('ArrowRight');record('keyboard right navigation',page.locator('#progressText').inner_text()=='2 / 22');page.locator('h2').filter(has_text='Win the angle first.').click();page.keyboard.press('ArrowLeft');record('keyboard left navigation',page.locator('#progressText').inner_text()=='1 / 22')
 for i,index in enumerate([0,1,9,15,17,19]):page.locator('.navbutton').nth(i).click();record('section navigation '+str(index),page.locator('#progressText').inner_text()==f'{index+1} / 22')
 record('no browser JavaScript errors',not report['errors']);record('no external runtime requests',not report['external_requests']);browser.close()
# Contact sheet includes all 22 current-run slides, ending on the completed scorecard.
files=sorted(out.glob('slide-*.png'));canvas=Image.new('RGB',(4*480,6*293),'#071a2b');draw=ImageDraw.Draw(canvas)
for i,f in enumerate(files):
 im=Image.open(f);im.thumbnail((480,270));x=i%4*480;y=i//4*293;canvas.paste(im,(x,y));draw.text((x+10,y+273),f'{i+1:02} · '+('INTRO' if i==0 else 'COMPLETION' if i==21 else ('TEACH' if i%2 else 'TRY')+' '+str((i+1)//2)),fill='white')
canvas.save(out/'contact-sheet.jpg',quality=93)
report['passed']=sum(c['passed'] for c in checks);report['failed']=sum(not c['passed'] for c in checks)
(out/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps({'passed':report['passed'],'failed':report['failed'],'errors':report['errors'],'screenshots':str(out)},indent=2))
