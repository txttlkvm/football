"""Build small Canva upload: hosted cdn/ (css, js, webp art) + canva-upload.html (markup + SDK tags only)."""
from pathlib import Path
import re,subprocess,shutil
from PIL import Image
root=Path(__file__).resolve().parents[1];H='https://two-shares-web.vercel.app/cdn/'
cdn=root/'cdn';shutil.rmtree(cdn,ignore_errors=True);(cdn/'img').mkdir(parents=True)
for p in sorted((root/'assets/artwork').glob('*.png')):
 im=Image.open(p).convert('RGBA');w=600 if p.name.startswith('pair') else 300
 im.resize((w,round(im.height*w/im.width)),Image.LANCZOS).save(cdn/'img'/(p.stem+'.webp'),'WEBP',quality=80,method=6)
def cat(fs):return '\n'.join((root/'assets'/f).read_text() for f in fs)
js=re.sub(r"assets/artwork/([^'\"\s]+)\.png",lambda m:H+'img/'+m[1]+'.webp',cat(['players.js','course.js','enhancements.js']))
(cdn/'app.src.js').write_text(js);(cdn/'app.src.css').write_text(cat(['utilities.css','base.css','course.css']))
run=lambda a:subprocess.run(['npx','-y','esbuild@0.25',*a],check=True,cwd=root)
run(['cdn/app.src.js','--minify','--outfile=cdn/app.js']);run(['cdn/app.src.css','--minify','--outfile=cdn/app.css'])
(cdn/'app.src.js').unlink();(cdn/'app.src.css').unlink()
s=(root/'index.html').read_text()
s=re.sub(r'<link rel="stylesheet" href="[^"]+">','',s)
s=re.sub(r'<script src="[^"]+"></script>','',s)
sdk=(root/'canva.html').read_text();sdk=''.join(re.findall(r'<script src="/_sdk/[^>]*></script>',sdk))
fonts='<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap" rel="stylesheet">'
s=s.replace('</head>',fonts+f'<link rel="stylesheet" href="{H}app.css">'+sdk+'</head>',1)
s=s.replace('</body>',f'<script src="{H}app.js"></script></body>',1)
s=re.sub(r'\n\s*',' ',s);s=re.sub(r'>\s{2,}<','> <',s)
(root/'canva-upload.html').write_text(s);print(len(s.encode()),'bytes')
