"""Build single-file, Canva-ready canva.html: inline CSS/JS, small WebP art, Canva SDK tags."""
from pathlib import Path
import base64,io,re
from PIL import Image
root=Path(__file__).resolve().parents[1]
s=(root/'index.html').read_text()
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(root/m[1]).read_text()+'</style>',s)
def img(m):
 im=Image.open(root/m[2]).convert('RGBA');w=600 if m[2].split('/')[-1].startswith('pair') else 300
 im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS);b=io.BytesIO();im.save(b,'WEBP',quality=80,method=6)
 return m[1]+'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()+m[1]
s=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(root/m[1]).read_text().replace('</script','<\\/script')+'</script>',s)
s=re.sub(r"(['\"])(assets/artwork/[^'\"\s]+\.png)\1",img,s)
sdk='''<script src="/_sdk/6542d56fbfe7a3eb.telemetry_sdk.js" integrity="sha512-ECdM0nK7EkwDuOqho2qxgyRQXyBHk9hZqRKMBr+Xsu6zjeHlt+qkO2N2YRiHN7Kg4e1fEHDhjIp4bGJYVypv1g=="></script><script src="/_sdk/6c2ecc939521f244.data_sdk.js" integrity="sha512-gRx8s+XsZDN6mSIQu2sivLZysbV0WHhb5kXNUWlgVb5lCMU1foJYukyMEDPv8Tnoocb8iwqB4XdRrWc7oEGzIQ=="></script><script src="/_sdk/b443124ed7f67435.editing_sdk.js" integrity="sha512-oLX1dpTmN2mZumhKQc0okubrUJ8MqA6c5fM5NHln6+9t8KpYrcElyL7NOV7dV6pLkMWSzWZRFAI+WLGRVrl64A=="></script><script src="/_sdk/ab4336f91e694f96.resizing_sdk.js" integrity="sha512-cxmeUrBrNlwwLr+tEu/iwM5F3boeK4qDMoH3QjUPqJptkO5NkaDVhQvyIHIn+3EflI5/uubWzkSA78B1tCswgA=="></script>'''
fonts='<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap" rel="stylesheet">'
s=s.replace('</head>',fonts+sdk+'</head>',1)
(root/'canva.html').write_text(s);print(len(s)//1024,'KB')
