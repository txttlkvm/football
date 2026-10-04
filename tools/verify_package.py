from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path('/workspace/football');result={'checks':[],'errors':[],'requests':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=b.new_context(viewport={'width':1440,'height':810},offline=True);page=context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));page.on('request',lambda r:result['requests'].append(r.url) if r.url.startswith(('http:','https:')) else None)
 page.set_content((root/'finish-the-tackle.html').read_text(),wait_until='load');page.wait_for_timeout(350)
 assert page.locator('.slide').count()==22;result['checks'].append('22 slides render from bundled HTML with networking disabled')
 page.screenshot(path=str(root/'qa/after/standalone-offline.png'))
 for i in range(21):page.locator('#nextButton').click()
 assert page.locator('#progressText').inner_text()=='22 / 22';result['checks'].append('all Next navigation works offline')
 assert page.locator('#completionCount').inner_text()=='0 / 10 challenges completed';result['checks'].append('unanswered activities report incomplete scorecard')
 page.locator('[data-template-id=reset-course]').click();assert page.locator('#progressText').inner_text()=='1 / 22';result['checks'].append('restart works offline')
 page.locator('.navbutton').filter(has_text='Practice data').click();page.locator('#nextButton').click();page.locator('#drillChoices button').nth(2).click();assert page.evaluate('state.score')==0;page.locator('#drillChoices button').nth(0).click();assert page.evaluate('state.score')==10;result['checks'].append('incorrect and correct KPI decisions work offline')
 assert 'Angle / leverage' in page.evaluate('state.priority');result['checks'].append('coaching priority recorded offline')
 assert not result['errors'];assert not result['requests'];result['checks'].append('zero browser errors or remote requests')
 b.close()
result['passed']=len(result['checks']);(root/'qa/after/package-verification.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
