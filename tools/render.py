import sys
from playwright.sync_api import sync_playwright
from PIL import Image
import os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
with sync_playwright() as pw:
    b=pw.chromium.launch(args=['--no-sandbox','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1300,'height':1300},device_scale_factor=1)
    pg.goto('file://'+root+'tools/render.html'); pg.wait_for_timeout(1500)
    for sid,name in [('r-box-angle','box-open-angle'),('r-box-top','box-top-12'),('r-box-closed','box-closed'),('r-shared','box-shared'),('r-og','og-image'),('r-icon','icon-512')]:
        el=pg.query_selector('#'+sid); path=f'/tmp/{name}.png'; el.screenshot(path=path)
        im=Image.open(path).convert('RGB')
        if name in ('og-image',): im.save(root+'assets/images/og-image.png', optimize=True)
        elif name=='icon-512':
            im.save(root+'assets/brand/icon-512.png'); im.resize((180,180),Image.LANCZOS).save(root+'assets/brand/apple-touch-icon.png'); im.resize((192,192),Image.LANCZOS).save(root+'assets/brand/icon-192.png')
        else:
            im.save(root+f'assets/images/{name}.webp','WEBP',quality=82,method=6)
        print(name, im.size)
    b.close()
