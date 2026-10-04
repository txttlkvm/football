from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('/workspace/football/qa/before')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':810},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/qa/before/original.html');page.wait_for_timeout(5000)
 report=[]
 n=page.locator('.slide').count()
 for i in range(n):
  page.evaluate('(i)=>goTo(i)',i);page.wait_for_timeout(350)
  page.screenshot(path=str(out/f'slide-{i+1:02}.png'))
  report.append(page.locator('.slide.active').evaluate('(s)=>({title:s.querySelector("h1,h2")?.textContent,badge:s.querySelector(".badge")?.textContent,overflow:[...s.querySelectorAll("*")].filter(e=>e.scrollHeight>e.clientHeight+2 && getComputedStyle(e).overflow==="hidden").map(e=>e.id||e.className)})'))
 # Exercise every existing interaction, wrong and correct, plus resets.
 actions=["goTo(4);chooseAngle('a')","chooseAngle('c')","chooseAngle('b')","resetAngle()","goTo(7);coachRep(document.querySelector('#repChoices button'),'hip')","coachRep(document.querySelectorAll('#repChoices button')[1],'eyes')","replayRep()","goTo(10);checkSequence()","sequence=[...requiredSequence];renderSequence();checkSequence()","resetSequence()","goTo(12);document.querySelectorAll('#diagnosticGrid article').forEach((c,i)=>{c.querySelector('button').click();[...c.querySelectorAll('button')].find(b=>b.dataset.choice===diagnosisData[i][1]).click()})","renderDiagnostics()","goTo(15);chooseDrill(document.querySelector('#drillChoices button'),'open')","chooseDrill(document.querySelector('#drillChoices button'),'fit')","chooseDrill(document.querySelector('#drillChoices button'),'lane')","resetDrill()","goTo(18);document.querySelectorAll('#gameScenarios article').forEach(c=>c.querySelectorAll('button')[1].click())","document.querySelector('#gameScenarios button').click()","goTo(19)","resetCourse()"]
 for j,a in enumerate(actions):
  page.evaluate(a);page.wait_for_timeout(100);page.screenshot(path=str(out/f'state-{j+1:02}.png'))
 (out/'audit.json').write_text(json.dumps({'slides':n,'screens':report,'errors':errors,'actions':actions},indent=2))
 print(json.dumps({'slides':n,'screens':report,'errors':errors},indent=2))
 b.close()
