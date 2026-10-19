"""canva-upload-lossless.html: original canva.html with identical pixels; dedupe data URIs, minify CSS/JS/HTML whitespace."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[1]
s=(root/'canva.html').read_text();sizes={'original':len(s.encode())}
def esb(code,loader):return subprocess.run(['npx','-y','esbuild@0.25','--minify','--loader='+loader],input=code,capture_output=True,text=True,check=True,cwd=root).stdout.strip()
# 1. dedupe image data URIs inside the inline script(s) (declare once, reference by name)
def fix_script(m):
 code=m[1]
 if 'data:image' not in code:return m[0]
 uris={};
 def rep(x):
  u=x[2];uris.setdefault(u,len(uris));return '__I%d'%uris[u]
 code=re.sub(r"(['\"])(data:image/[a-z]+;base64,[A-Za-z0-9+/=]+)\1",rep,code)
 decl=''.join(f'const __I{i}="{u}";' for u,i in uris.items())
 return '<script>'+decl+code+'</script>'
s2=re.sub(r'<script>(.*?)</script>',fix_script,s,flags=re.S);sizes['dedupe']=len(s2.encode())
# 2. minify CSS and JS (semantics-preserving)
s3=re.sub(r'<style>(.*?)</style>',lambda m:'<style>'+esb(m[1],'css')+'</style>',s2,flags=re.S)
def minjs(m):
 c=m[1]
 return '<script>'+esb(c,'js').replace('</script','<\\/script')+'</script>'
s3=re.sub(r'<script>(.*?)</script>',minjs,s3,flags=re.S);sizes['css_js_min']=len(s3.encode())
# 3. HTML whitespace
s4=re.sub(r'(<body.*?)(<script>)',lambda m:re.sub(r'\n\s*',' ',m[1])+m[2],s3,count=1,flags=re.S);sizes['html_ws']=len(s4.encode())
(root/'canva-upload-lossless.html').write_text(s4);print(sizes)
