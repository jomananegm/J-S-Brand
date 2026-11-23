// Generates J'S brand SVG assets (logo, seal, favicon, roll illustration)
import { writeFileSync, mkdirSync } from 'node:fs';
const out = new URL('../assets/brand/', import.meta.url);
const ill = new URL('../assets/illustrations/', import.meta.url);
mkdirSync(out, { recursive: true }); mkdirSync(ill, { recursive: true });

const C = { esp: '#28110C', bur: '#5E0B13', blush: '#E1ACB5', cream: '#FDF2D2', coffee: '#603027' };
const r1 = n => Math.round(n * 10) / 10;

/* ---------------- Wordmark: J + mini-roll apostrophe + S ---------------- */
const J = 'M86 30V98C86 140 30 144 22 108';
const S = 'M250 52C240 24 186 22 184 56C182 88 254 82 254 116C254 150 192 154 176 124';
const dcx = 138, dcy = 46, dr = 19;
// tear-drop apostrophe: circle with a tail toward bottom-left
const drop = `M${dcx + dr} ${dcy}A${dr} ${dr} 0 1 0 ${dcx - 6} ${dcy + 18}C${dcx - 10} ${dcy + 28} ${dcx - 16} ${dcy + 36} ${dcx - 22} ${dcy + 42}C${dcx + 2} ${dcy + 38} ${dcx + 14} ${dcy + 28} ${dcx + 18} ${dcy + 8}Z`;
function miniSpiral(cx, cy, r0, r1_, turns) {
  let d = ''; const n = 60;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * Math.PI * 2, r = r0 + (r1_ - r0) * (i / n);
    d += (i ? 'L' : 'M') + r1(cx + r * Math.cos(t)) + ' ' + r1(cy + r * Math.sin(t));
  }
  return d;
}
const swirl = miniSpiral(dcx, dcy, 1.5, 13, 2.1);

function wordmark({ fill, outline, shadow, swirlColor, w = 30 }) {
  const strokes = (color, width) => `<g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"><path d="${J}"/><path d="${S}"/></g>`;
  const dropShape = (color, sw, sc) => `<path d="${drop}" fill="${color}" ${sw ? `stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round"` : ''}/>`;
  let g = '';
  if (shadow) g += `<g transform="translate(7 8)">${strokes(shadow, w + 12)}${dropShape(shadow, 12, shadow)}</g>`;
  if (outline) g += strokes(outline, w + 12) + dropShape(outline, 12, outline);
  g += strokes(fill, w) + dropShape(fill, 0);
  g += `<path d="${swirl}" fill="none" stroke="${swirlColor}" stroke-width="3.6" stroke-linecap="round"/>`;
  return g;
}
const svg = (vb, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

writeFileSync(new URL('wordmark-sticker.svg', out), svg('0 0 290 180', wordmark({ fill: C.cream, outline: C.esp, shadow: C.esp, swirlColor: C.bur }), "J'S"));
writeFileSync(new URL('wordmark-sticker-blush.svg', out), svg('0 0 290 180', wordmark({ fill: C.blush, outline: C.esp, shadow: C.esp, swirlColor: C.bur }), "J'S"));
writeFileSync(new URL('wordmark-burgundy.svg', out), svg('0 0 290 180', wordmark({ fill: C.bur, swirlColor: C.blush }), "J'S"));
writeFileSync(new URL('wordmark-cream.svg', out), svg('0 0 290 180', wordmark({ fill: C.cream, swirlColor: C.bur }), "J'S"));
writeFileSync(new URL('wordmark-espresso.svg', out), svg('0 0 290 180', wordmark({ fill: C.esp, swirlColor: C.blush }), "J'S"));

// Lockup: wordmark + descriptor
writeFileSync(new URL('lockup-burgundy.svg', out), svg('0 0 640 180',
  wordmark({ fill: C.bur, swirlColor: C.blush }) +
  `<g font-family="Poppins, Arial, sans-serif" font-weight="700" fill="${C.bur}"><text x="300" y="82" font-size="34" letter-spacing="2">THE LITTLE</text><text x="300" y="124" font-size="34" letter-spacing="2">TREAT BRAND</text></g><rect x="300" y="138" width="56" height="6" rx="3" fill="${C.blush}"/>`, "J'S — The Little Treat Brand"));
writeFileSync(new URL('lockup-cream.svg', out), svg('0 0 640 180',
  wordmark({ fill: C.cream, swirlColor: C.bur }) +
  `<g font-family="Poppins, Arial, sans-serif" font-weight="700" fill="${C.cream}"><text x="300" y="82" font-size="34" letter-spacing="2">THE LITTLE</text><text x="300" y="124" font-size="34" letter-spacing="2">TREAT BRAND</text></g><rect x="300" y="138" width="56" height="6" rx="3" fill="${C.blush}"/>`, "J'S — The Little Treat Brand"));

// Monogram / favicon: wordmark on a burgundy sticker circle
const mono = (bg, ring) => svg('0 0 200 200',
  `<circle cx="100" cy="100" r="96" fill="${bg}" stroke="${C.esp}" stroke-width="6"/>` +
  (ring ? `<circle cx="100" cy="100" r="80" fill="none" stroke="${ring}" stroke-width="3" stroke-dasharray="6 7"/>` : '') +
  `<g transform="translate(26 50) scale(.51)">${wordmark({ fill: C.cream, outline: C.esp, swirlColor: C.bur })}</g>`, "J'S");
writeFileSync(new URL('monogram.svg', out), mono(C.bur, C.blush));
writeFileSync(new URL('favicon.svg', out), svg('0 0 200 200',
  `<circle cx="100" cy="100" r="98" fill="${C.bur}"/><g transform="translate(18 44) scale(.56)">${wordmark({ fill: C.cream, swirlColor: C.blush })}</g>`, "J'S"));

// Seal sticker with circular text
writeFileSync(new URL('seal.svg', out), svg('0 0 200 200',
  `<defs><path id="c" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"/></defs>
  <circle cx="100" cy="100" r="96" fill="${C.blush}" stroke="${C.esp}" stroke-width="4"/>
  <text font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="1.6" fill="${C.esp}"><textPath href="#c">THE LITTLE TREAT BRAND ✦ A LITTLE SOMETHING GOOD ✦</textPath></text>
  <circle cx="100" cy="100" r="54" fill="${C.bur}" stroke="${C.esp}" stroke-width="3"/>
  <g transform="translate(58 76) scale(.29)">${wordmark({ fill: C.cream, swirlColor: C.blush })}</g>`, "J'S seal"));

/* ---------------- Cinnamon roll, top view ---------------- */
const cx = 300, cy = 300;
function smoothClosed(pts) {
  const n = pts.length; let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}
const edge = [];
for (let i = 0; i < 56; i++) { const t = i / 56 * Math.PI * 2, r = 232 + 7 * Math.sin(6 * t + .4) + 4 * Math.sin(11 * t) + 3 * Math.sin(17 * t + 2); edge.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
function spiral(off = 0, wob = 2.6) {
  const t0 = .9 * Math.PI, t1 = 8.4 * Math.PI, rs = 16, re = 222, b = (re - rs) / (t1 - t0); let d = '';
  for (let i = 0; i <= 320; i++) { const t = t0 + (t1 - t0) * i / 320, r = rs + b * (t - t0) + off + wob * Math.sin(5 * t); d += (i ? 'L' : 'M') + r1(cx + r * Math.cos(t)) + ' ' + r1(cy + r * Math.sin(t)); }
  return d;
}
const pool = []; const drips = [[.5, 12], [1.7, 16], [2.9, 10], [4.1, 14], [5.3, 10]];
for (let i = 0; i < 140; i++) { const t = i / 140 * Math.PI * 2; let r = 70 + 6 * Math.sin(4 * t + .5) + 4 * Math.sin(7 * t + 1.2); for (const [a, amp] of drips) { const dt = Math.atan2(Math.sin(t - a), Math.cos(t - a)); r += amp * Math.exp(-(dt * dt) / (2 * .16 * .16)); } pool.push([cx + r * Math.cos(t), cy - 4 + r * Math.sin(t)]); }
function drizzle(seed = 0) {
  const pts = [], rows = 10;
  for (let i = 0; i < rows; i++) { const y = 112 + i * (376 / (rows - 1)); const half = Math.sqrt(Math.max(0, 208 * 208 - (y - cy) ** 2)); const side = (i + seed) % 2 ? 1 : -1; pts.push([cx + side * half * .9 + ((i * 7) % 13) - 6, y + (side > 0 ? 12 : -8)]); }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; d += `Q${r1((a[0] + b[0]) / 2 + (b[1] - a[1]) * .3)} ${r1((a[1] + b[1]) / 2 - 20)} ${r1(b[0])} ${r1(b[1])}`; }
  return d;
}
const E = smoothClosed(edge), SP = spiral(0), SPH = spiral(-9, 2), DZ = drizzle(), PL = smoothClosed(pool);
const rollBody = `
  <defs>
    <radialGradient id="d" cx="44%" cy="40%" r="66%"><stop offset="0" stop-color="#F7D29A"/><stop offset=".5" stop-color="#E3A565"/><stop offset=".86" stop-color="#C47838"/><stop offset="1" stop-color="#9C5527"/></radialGradient>
    <radialGradient id="ic" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#FFFEF8"/><stop offset=".55" stop-color="#FDF2D2"/><stop offset="1" stop-color="#E8D1A2"/></radialGradient>
    <filter id="tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .17  0 0 0 0 .06  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    <clipPath id="clip"><path d="${E}"/></clipPath>
  </defs>
  <ellipse cx="312" cy="322" rx="236" ry="232" fill="#28110C" opacity=".35" filter="url(#sh)"/>
  <path d="${E}" fill="url(#d)"/>
  <g clip-path="url(#clip)">
    <path d="${E}" fill="#fff" filter="url(#tex)" opacity=".6"/>
    <path d="${SP}" fill="none" stroke="#5A2210" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)" opacity=".9"/>
    <path d="${SP}" fill="none" stroke="#7B3416" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${SPH}" fill="none" stroke="#FFE0AE" stroke-width="7" stroke-linecap="round" opacity=".55" filter="url(#soft)"/>
    <g fill="#4A1B0A" opacity=".5"><circle cx="160" cy="220" r="3"/><circle cx="430" cy="170" r="2.6"/><circle cx="480" cy="370" r="3"/><circle cx="210" cy="450" r="2.6"/><circle cx="350" cy="500" r="3"/><circle cx="120" cy="340" r="2.2"/><circle cx="470" cy="260" r="2.2"/><circle cx="260" cy="130" r="2"/><circle cx="390" cy="420" r="2.4"/></g>
  </g>
  <path d="${E}" fill="none" stroke="#7E3E1A" stroke-width="5" opacity=".55"/>
  <path d="${DZ}" fill="none" stroke="#B99260" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".35" transform="translate(4 7)" filter="url(#soft)"/>
  <path d="${DZ}" fill="none" stroke="url(#ic)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${DZ}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8" transform="translate(-2 -3)"/>
  <path d="${PL}" fill="#B99260" opacity=".35" transform="translate(4 7)" filter="url(#soft)"/>
  <path d="${PL}" fill="url(#ic)"/>
  <g fill="#fff" opacity=".88"><ellipse cx="278" cy="268" rx="26" ry="8" transform="rotate(-28 278 268)"/><ellipse cx="258" cy="294" rx="6" ry="4"/></g>`;
writeFileSync(new URL('roll-top.svg', ill), svg('0 0 600 600', rollBody, 'Classic Cinnamon Roll, top view'));

// Roll without shadow (for stacking in 3D box)
writeFileSync(new URL('roll-top-flat.svg', ill), svg('0 0 600 600', rollBody.replace(/<ellipse cx="312"[^>]*\/>/, ''), 'Classic Cinnamon Roll'));
console.log('brand assets written');
