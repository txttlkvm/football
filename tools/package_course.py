"""Bundle local course code and rendered artwork into portable offline HTML/ZIP."""
from pathlib import Path
import base64,re,zipfile,mimetypes
root=Path(__file__).resolve().parents[1]
source=(root/'index.html').read_text()
source=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>\n'+(root/m[1]).read_text()+'\n</style>',source)
source=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>\n'+(root/m[1]).read_text().replace('</script','<\\/script')+'\n</script>',source)
# Inline the centralized artwork manifest's local image references so actor
# instances use data URIs and the portable file needs no resource requests.
embedded=set()
def image_uri(m):
 path=root/m[2]
 if not path.is_file():raise FileNotFoundError('Missing rendered artwork: '+str(path))
 encoded=base64.b64encode(path.read_bytes()).decode('ascii')
 mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
 embedded.add(m[2]);return m[1]+'data:'+mime+';base64,'+encoded+m[1]
source=re.sub(r"(['\"])(assets/artwork/[^'\"\s]+\.(?:png|webp))\1",image_uri,source)
(root/'finish-the-tackle.html').write_text(source)
with zipfile.ZipFile(root/'finish-the-tackle.zip','w',zipfile.ZIP_DEFLATED) as z:
 paths=[root/'index.html',root/'finish-the-tackle.html',root/'README.md',root/'qa/AUDIT.md',*sorted((root/'assets').rglob('*'))]
 for path in paths:
  if path.is_file():z.write(path,path.relative_to(root))
print('Built standalone HTML and course ZIP; embedded',len(embedded),'rendered assets.')
