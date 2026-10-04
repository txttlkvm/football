"""canva-upload-fidelity.html: ALL CSS/JS inline (as in canva.html); only the 14 images are hosted on Vercel."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
s=(root/'canva-upload.html').read_text()
css=(root/'cdn/app.css').read_text();js=(root/'cdn/app.js').read_text().replace('</script','<\\/script')
H='https://two-shares-web.vercel.app/cdn/'
s=s.replace(f'<link rel="stylesheet" href="{H}app.css">','<style>'+css+'</style>',1)
s=s.replace(f'<script src="{H}app.js"></script>','<script>'+js+'</script>',1)
(root/'canva-upload-fidelity.html').write_text(s);print(len(s.encode()),'bytes')
