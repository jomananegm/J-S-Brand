/* J'S — منطق الموقع: السلة، الطلب على الواتساب، الصفحات، الحركة. من غير مكتبات. */
{
const C = window.JS_CONFIG, P = window.JS_PRODUCTS, CATS = window.JS_CATEGORIES;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isNum = v => typeof v === 'number' && isFinite(v) && v >= 0;
const num = n => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmt = n => num(n) + ' جنيه';
const MAX = Math.max(1, C.order?.maxQtyPerItem || 10);
const WA = 'https://wa.me/' + C.contact.whatsappIntl;
const TBC = 'J\'S هتأكده معاك';
const byId = id => P.find(p => p.id === id);
const canBuy = p => !!p && p.availability === 'available';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const featured = P.find(p => p.featured && canBuy(p)) || P.find(canBuy) || P[0];
const nm = p => p.nameAr || p.name;
const sub = p => p.subtitleAr || p.subtitle || '';
const unitAr = p => p.unitLabel === 'box' ? 'بوكس' : 'رول';
const qtyAr = (n, p) => `${n} ${unitAr(p)}`;
const cityAr = C.delivery.cityAr || 'إسكندرية';

/* ---------- الصور والحركة ورندرات الـ 3D ---------- */
const MEDIA = {
  hero: { src: 'assets/photos/roll-hero.webp', ar: 'الكلاسيك بالأيسينج', alt: 'رول سينامون كلاسيك بالأيسينج' },
  rollWide: { src: 'assets/photos/roll-wide.webp', ar: 'سايحة… وده المطلوب', alt: 'رول سينامون سايحة على طبق كاروهات' },
  rollPlate: { src: 'assets/photos/roll-plate.webp', ar: 'حاجة صغيرة… بمود كبير', alt: 'رول سينامون على طبق' },
  pour: { src: 'assets/photos/anim-pour.webp', anim: true, ar: 'لحظة الصبّة', alt: 'أيسينج بيتصب على الرول' },
  forkPull: { src: 'assets/photos/anim-fork-pull.webp', anim: true, ar: 'السحبة', alt: 'شوكة بتسحب حتة من الرول' },
  drizzle: { src: 'assets/photos/anim-drizzle.webp', anim: true, ar: 'أيسينج على الآخر', alt: 'أيسينج بيسيح على الرول' },
  icingMotion: { src: 'assets/photos/anim-icing-motion.webp', anim: true, ar: 'J\'S بتتحرك', alt: 'رول J\'S والأيسينج بيتصب' },
  boxOpen: { src: 'assets/images/box-open-angle.webp', render: true, ar: 'البوكس الكبير', alt: 'البوكس الكبير مفتوح وفيه 12 رول' },
  boxTop: { src: 'assets/images/box-top-12.webp', render: true, ar: '12 رول جنب بعض', alt: 'البوكس من فوق وفيه 12 رول' },
  boxClosed: { src: 'assets/images/box-closed.webp', render: true, ar: 'مقفول ومستنيك', alt: 'البوكس الكبير مقفول' },
  shared: { src: 'assets/images/box-shared.webp', render: true, ar: 'مود كبير… للشلة', alt: 'البوكس متقسم على 4 صحاب' }
};
const photo = k => (C.photos && C.photos[k]) || MEDIA[k].src;
const isRender = k => !!MEDIA[k].render && !(C.photos && C.photos[k]);
const PRODUCT_SHOTS = { 'big-mood-box': ['boxOpen', 'hero', 'boxTop', 'shared', 'forkPull'], 'classic-roll': ['hero', 'rollWide', 'rollPlate', 'forkPull'] };
const tagFor = k => isRender(k) ? '<span class="tagm">3D</span>' : MEDIA[k].anim ? '<span class="tagm">متحرك</span>' : '';
const RENDER_NOTE = 'رندر 3D — بيتبدل بصورة البوكس الحقيقية';

/* ---------- السلة ---------- */
let cart = sanitize(store.get('js-cart-v2'));
let groupSize = null;
function sanitize(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const it of raw) { const p = byId(it && it.id), q = Math.floor(Number(it && it.qty)); if (canBuy(p) && q >= 1 && !out.find(o => o.id === p.id)) out.push({ id: p.id, qty: Math.min(q, MAX) }); }
  return out;
}
const clampQ = v => { const n = Math.floor(Number(v)); return isFinite(n) ? Math.min(MAX, Math.max(1, n)) : 1; };
function save() { store.set('js-cart-v2', cart); renderCart(); }
function addItem(id, qty = 1) {
  const p = byId(id); if (!canBuy(p)) return 0;
  const line = cart.find(l => l.id === id), before = line ? line.qty : 0;
  if (line) line.qty = Math.min(MAX, line.qty + clampQ(qty)); else cart.push({ id, qty: clampQ(qty) });
  save(); return cart.find(l => l.id === id).qty - before;
}
function setQty(id, q) { const l = cart.find(x => x.id === id); if (l) { l.qty = clampQ(q); save(); } }
function removeItem(id) { cart = cart.filter(l => l.id !== id); save(); }
const itemCount = () => cart.reduce((s, l) => s + l.qty, 0);
function totals() {
  let sum = 0, priced = true, allIncl = cart.length > 0;
  for (const l of cart) { const p = byId(l.id); if (isNum(p.price)) sum += p.price * l.qty; else priced = false; if (!p.deliveryIncluded) allIncl = false; }
  const fee = allIncl ? 0 : (isNum(C.delivery.fee) ? C.delivery.fee : null);
  return { subtotal: priced ? sum : null, included: allIncl, fee, total: priced && fee !== null ? sum + fee : null };
}
const priceLabel = p => isNum(p.price) ? fmt(p.price) : 'السعر بيتأكد على الواتساب';
const unitPrice = p => isNum(p.price) && p.pieces > 1 ? fmt(p.price / p.pieces) + ' للرول' : '';

$$('[data-price-box]').forEach(el => { const b = byId('big-mood-box'); if (b && isNum(b.price)) el.textContent = fmt(b.price); });

function buyBlock(p, ctx) {
  const badges = [];
  badges.push(canBuy(p) ? '<li class="ok">متاح للطلب</li>' : `<li class="soon">${p.availability === 'sold-out' ? 'خلص حاليًا' : 'قريب'}</li>`);
  if (p.deliveryIncluded) badges.push('<li>التوصيل مشمول</li>');
  badges.push(`<li>${esc(cityAr)}</li>`);
  const price = `<span class="price${isNum(p.price) ? '' : ' tbc'}">${esc(priceLabel(p))}${isNum(p.price) && p.deliveryIncluded ? '<small>شامل</small>' : ''}</span>${unitPrice(p) ? `<span class="unit">يعني ${unitPrice(p)}</span>` : ''}`;
  if (!canBuy(p)) return `<div class="buy"><div class="pricerow">${price}</div><ul class="badges">${badges.join('')}</ul><p class="note">لسه مش متاح للطلب.</p></div>`;
  return `<div class="buy" data-pid="${esc(p.id)}">
    <div class="pricerow">${price}</div>
    <ul class="badges">${badges.join('')}</ul>
    <div class="buyrow">
      <div class="qty" role="group" aria-label="العدد" dir="ltr">
        <button type="button" data-act="dec" aria-label="قلّل">−</button>
        <input id="q-${ctx}-${esc(p.id)}" type="number" inputmode="numeric" min="1" max="${MAX}" step="1" value="1" aria-label="عدد ${esc(nm(p))}">
        <button type="button" data-act="inc" aria-label="زوّد">+</button>
      </div>
      <button type="button" class="btn bur big" data-act="add">ضيفه للطلب</button>
    </div>
  </div>`;
}

/* ---------- الصفحات ---------- */
function renderMenu() {
  const live = P.filter(p => CATS.find(c => c.id === p.category && c.status === 'live'));
  live.sort((a, b) => (canBuy(b) - canBuy(a)) || (b.featured - a.featured));
  $('#menuSlot').innerHTML = live.map(p => {
    const shot = p.id === 'classic-roll' ? 'rollWide' : (PRODUCT_SHOTS[p.id] || [])[0];
    return `<article class="menu-card reveal${canBuy(p) ? '' : ' soon'}">
      <div class="pic"><img src="${esc(shot ? photo(shot) : p.image)}" alt="${esc(shot ? MEDIA[shot].alt : nm(p))}" loading="lazy">${p.featured ? '<span class="sticker cream">التوقيع بتاعنا</span>' : canBuy(p) ? '' : '<span class="sticker bur">قريب</span>'}${shot && isRender(shot) ? `<span class="ph">${RENDER_NOTE}</span>` : ''}</div>
      <div class="body">
        <h2><a href="#${esc(p.slug)}">${esc(nm(p))}</a></h2>
        <p class="en-name" lang="en" dir="ltr">${esc(p.name)}</p>
        <p class="sub">${esc(sub(p))}</p>
        <p class="lede" style="margin-top:10px;color:var(--coffee)">${esc(p.descriptionAr || p.description)}</p>
        ${buyBlock(p, 'menu')}
        <p style="margin-top:14px"><a href="#${esc(p.slug)}" style="font-weight:700;color:var(--bur)">التفاصيل</a></p>
      </div></article>`;
  }).join('');
  $('#laterSlot').innerHTML = CATS.filter(c => c.status !== 'live').map(c => `<div class="ticket reveal"><span class="lbl">قريب</span><h3>${esc(c.nameAr || c.name)}</h3><p>${esc(c.ar || c.blurb || '')}</p></div>`).join('');
}
function renderDetail(p) {
  const d = p.details || {}, shots = PRODUCT_SHOTS[p.id] || [], main = shots[0];
  const fact = (k, v, f) => `<li><b>${k}</b><span>${v ? esc(v) : f}</span></li>`;
  $('#detailSlot').innerHTML = `<nav class="crumbs" aria-label="إنت فين"><a href="#home">الرئيسية</a><span aria-hidden="true">/</span><a href="#rolls">المنيو</a><span aria-hidden="true">/</span><span aria-current="page">${esc(nm(p))}</span></nav>
  <div class="pd" style="margin-top:22px">
    <div>
      <div class="pd-main" id="pdMain"><img src="${esc(main ? photo(main) : p.image)}" alt="${esc(main ? MEDIA[main].alt : nm(p))}"><span class="ph"${main && isRender(main) ? '' : ' hidden'}>${RENDER_NOTE}</span></div>
      ${shots.length > 1 ? `<div class="thumbs">${shots.map((k, i) => `<button type="button" class="thumb" data-shot="${k}" aria-pressed="${i === 0}" aria-label="اعرض ${esc(MEDIA[k].ar)}"><img src="${esc(photo(k))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>
    <div class="pd-sticky">
      ${p.featured ? '<span class="sticker">التوقيع بتاعنا</span>' : ''}
      <h1>${esc(nm(p))}</h1>
      <p class="en-name" lang="en" dir="ltr">${esc(p.name)}</p>
      <p class="sub" style="font-weight:700;color:var(--coffee);margin:0 0 8px">${esc(sub(p))}</p>
      <p class="lede" style="color:var(--coffee)">${esc(p.descriptionAr || p.description)}</p>
      ${buyBlock(p, 'pd')}
      <ul class="facts">
        ${fact('جواه إيه', d.inside, '')}
        ${fact('السعر', isNum(p.price) ? fmt(p.price) + (p.deliveryIncluded ? ' — شامل التوصيل في ' + cityAr : '') : '', 'J\'S بتأكده على الواتساب.')}
        ${fact('المكونات', d.ingredients, 'هتتكتب هنا قريب — اسأل J\'S على الواتساب.')}
        ${fact('الحساسية', d.allergens, 'عندك حساسية؟ اسأل J\'S على الواتساب قبل ما تطلب.')}
        <li><b>التوصيل</b><span data-delivery-text></span></li>
        <li><b>الدفع</b><span>إنستاباي، بعد ما J'S تأكد طلبك.</span></li>
      </ul>
      ${p.id !== 'big-mood-box' && canBuy(byId('big-mood-box')) ? '<p style="margin-top:18px"><a class="btn bur" href="#big-mood-box">خدها في البوكس الكبير</a></p>' : ''}
    </div>
  </div>`;
  $$('#detailSlot .thumb').forEach(t => t.addEventListener('click', () => {
    const k = t.dataset.shot, img = $('#pdMain img'); img.src = photo(k); img.alt = MEDIA[k].alt;
    $('#pdMain .ph').hidden = !isRender(k);
    $$('#detailSlot .thumb').forEach(x => x.setAttribute('aria-pressed', String(x === t)));
  }));
  document.title = nm(p) + " — J'S";
  paintDelivery();
}
function renderFounder() {
  const f = C.founder, en = f.name, comm = (C.community && C.community.name) || "Little Treats with J'S";
  const pic = f.photo ? `<img src="${esc(f.photo)}" alt="${esc(f.nameAr || en)} (${esc(en)})، صاحبة J'S، لابسة كاب ومريلة J'S وقدامها صينية رولز" loading="lazy">` : `<div class="inner"><b>صورة ${esc(f.nameAr || en)}</b>الصورة هنا</div>`;
  const waText = encodeURIComponent(`صورتنا مع J'S ♡ عايزين نتنزل على البيدج مع كوميونتي ${comm}`);
  const html = `<figure class="polaroid"><span class="tape" aria-hidden="true"></span><div class="frame">${pic}</div><figcaption><span lang="en" dir="ltr">${esc(en)}</span> ♡</figcaption></figure>
    <div class="founder-copy">
      <span class="sticker">رسالة من <span lang="en" dir="ltr">${esc(en)}</span> ♡</span>
      <h2 style="margin-top:16px">كل حاجة في J'S… <span class="pk">من <span lang="en" dir="ltr">${esc(en)}</span>.</span></h2>
      <p class="lede" style="margin-top:14px">اطلب من J'S، صوّر اللحظة إنت وشلتك، وهننزلكم على البيدج بتاعتنا كجزء من كوميونتي <b lang="en" dir="ltr">${esc(comm)}</b>… ونعملكم منشن ♡</p>
      ${f.bio ? `<p style="max-width:56ch">${esc(f.bio)}</p>` : ''}
      <ol class="comm-steps">
        <li><b>اطلب البوكس</b><span>من هنا، على الواتساب.</span></li>
        <li><b>صوّروا اللحظة</b><span>إنت والشلة والبوكس.</span></li>
        <li><b>ابعتوها لينا</b><span>على الواتساب أو اعملولنا منشن.</span></li>
        <li><b>هتنزلوا على البيدج</b><span>ومعاكم منشن ♡</span></li>
      </ol>
      <div class="buyrow"><button class="btn big" type="button" data-add="big-mood-box" data-community>اطلب وانضم للكوميونتي</button><a class="btn ghost" href="${WA}?text=${waText}" target="_blank" rel="noopener">ابعت صورتكم</a></div>
      <p class="sig"><span class="comm-badge" lang="en" dir="ltr">${esc(comm.toUpperCase())}</span><span class="signed" lang="en" dir="ltr">— ${esc(en)}</span></p>
    </div>`;
  $$('[data-founder]').forEach(el => el.innerHTML = html);
}
function renderDrop() {
  const L = C.launch, out = [];
  if (isNum(L.limitedQuantity) && L.limitedQuantity > 0) out.push(`<p><span class="sticker">${L.limitedQuantity} بوكس بس في الدفعة دي</span></p>`);
  const dl = L.deadline ? new Date(L.deadline) : null;
  if (dl && !isNaN(dl) && dl > new Date()) out.push(`<p class="note" style="margin-bottom:8px">الطلبات بتقفل بعد:</p><div class="countdown" id="cd" dir="ltr"></div>`);
  $('#dropFacts').innerHTML = out.join('');
  if (!$('#cd')) return;
  const tick = () => {
    const ms = dl - new Date();
    if (ms <= 0) { $('#dropFacts').innerHTML = '<p class="note">الدفعة دي قفلت. كلّم J\'S على الواتساب للدفعة الجاية.</p>'; clearInterval(t); return; }
    let r = ms; $('#cd').innerHTML = [['يوم', 864e5], ['ساعة', 36e5], ['دقيقة', 6e4], ['ثانية', 1e3]].map(([l, u]) => { const v = Math.floor(r / u); r -= v * u; return `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`; }).join('');
  };
  const t = setInterval(tick, 1000); tick();
}
function deliveryText() {
  const d = C.delivery, parts = [];
  const incl = featured && featured.deliveryIncluded && isNum(featured.price);
  parts.push('التوصيل متاح في ' + cityAr + (d.areas.length ? ' — ' + d.areas.join('، ') : '') + '.');
  if (incl) parts.push(`وداخل في سعر ${nm(featured)} (${fmt(featured.price)}).`);
  else parts.push(isNum(d.fee) ? 'مصاريف التوصيل: ' + fmt(d.fee) + '.' : 'مصاريف التوصيل بتتأكد على الواتساب.');
  parts.push(d.eta ? d.eta + '.' : 'J\'S بتأكد التوفر وميعاد التوصيل على الواتساب.');
  return parts.join(' ');
}
function paintDelivery() { $$('[data-delivery-text]').forEach(el => el.textContent = deliveryText()); }
function renderFaq() {
  const d = C.delivery, box = byId('big-mood-box'), single = byId('classic-roll');
  const qa = [
    ['أطلب إزاي؟', `ضيف ${esc(nm(box))}، اكتب بياناتك في <a href="#order">صفحة الطلب</a>، ودوس <b>كمّل على الواتساب</b>. هتلاقي الرسالة مكتوبة جاهزة — دوس إرسال بس.`],
    ['البوكس فيه إيه؟', `${esc(box.details.inside)}. بوكس واحد، 12 رول.`],
    ['بكام؟', isNum(box.price) ? `${fmt(box.price)} للبوكس${box.deliveryIncluded ? '، شامل التوصيل في ' + esc(cityAr) + '. مفيش أي حاجة زيادة' : ''}.` : 'J\'S بتأكد السعر معاك على الواتساب.'],
    ['كده الطلب اتأكد؟', 'لسه. رسالتك دي طلب، وJ\'S بترد تأكد التوفر وميعاد التوصيل. الطلب بيتأكد لما J\'S تقول.'],
    ['بتوصّلوا فين؟', `${esc(cityAr)}. ${d.areas.length ? 'المناطق دلوقتي: ' + esc(d.areas.join('، ')) + '.' : 'اكتب منطقتك في الفورم وJ\'S هتأكد التوصيل ليها.'}`],
    ['هيوصل إمتى؟', d.eta ? esc(d.eta) + '.' : 'J\'S بتأكد معاك ميعاد التوصيل على الواتساب. مش هنخمّن.'],
    ['أدفع إزاي؟', 'إنستاباي، بعد ما J\'S تأكد طلبك. حوّل على الرقم اللي J\'S أكدته، ابعت السكرين على الواتساب، وJ\'S تراجعه بنفسها. <a href="#payment">خطوات الدفع</a>.'],
    ['إزاي أتنزل على البيدج؟', `اطلب البوكس وعلّم على <b>عايزين نتنزل على البيدج</b> في الفورم، صوّروا اللحظة وابعتوها لـ J'S على الواتساب — وهننزلكم مع كوميونتي <b lang="en" dir="ltr">${esc((C.community && C.community.name) || "Little Treats with J'S")}</b> ونعملكم منشن.`],
    ['ينفع أبعته هدية؟', 'أكيد — علّم على <b>هدية لحد تاني؟</b> في الفورم واكتب اسمه ورقمه. J\'S هتأكد التفاصيل معاك على الواتساب.'],
    ['فيه رول لوحدها؟', canBuy(single) ? `أيوه — ${esc(nm(single))} بـ ${esc(priceLabel(single))}.` : `لسه. دلوقتي ${esc(nm(box))} هو الطريقة الوحيدة.`],
    ['المكونات والحساسية؟', box.details.allergens ? esc(box.details.allergens) : 'التفاصيل هتتكتب هنا قريب. لو عندك حساسية، اسأل J\'S على الواتساب قبل ما تطلب واكتبها في الملاحظات.'],
    ['ينفع أستلم بنفسي؟', d.pickup ? esc(d.pickup) : 'اسأل J\'S على الواتساب — الموقع بياخد طلبات توصيل بس دلوقتي.']
  ];
  $('#faqSlot').innerHTML = qa.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span>${q}</span></summary><div class="a"><p>${a}</p></div></details>`).join('');
}
function renderInstagram() {
  const s = C.social;
  if (s.instagramUrl) $('#igSlot').innerHTML = `<a href="${esc(s.instagramUrl)}" target="_blank" rel="noopener"><span class="ico"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><span>إنستجرام<small dir="ltr">${esc(s.instagramHandle)}</small></span></a>`;
}
function renderAreaField() {
  const a = C.delivery.areas; if (!a.length) return;
  $('#areaField').innerHTML = `<label for="f-area">المنطقة <span class="req">مطلوب</span></label><select id="f-area" name="area" required aria-describedby="e-area"><option value="">اختار منطقتك</option>${a.map(x => `<option>${esc(x)}</option>`).join('')}</select><p class="err" id="e-area"></p>`;
}
function renderGallery() {
  const keys = ['hero', 'pour', 'boxOpen', 'rollWide', 'forkPull', 'boxTop', 'drizzle', 'rollPlate', 'shared', 'icingMotion'];
  $('#galleryTrack').innerHTML = keys.map(k => `<figure><div class="shot"><img src="${esc(photo(k))}" alt="${esc(MEDIA[k].alt)}" loading="lazy">${tagFor(k)}</div><figcaption dir="rtl">${esc(MEDIA[k].ar)}</figcaption></figure>`).join('');
  const track = $('#galleryTrack');
  const step = dir => { const f = $('figure', track); track.scrollBy({ left: dir * ((f ? f.offsetWidth : 300) + 20), behavior: reduced ? 'auto' : 'smooth' }); };
  $('#galPrev').addEventListener('click', () => step(-1)); $('#galNext').addEventListener('click', () => step(1));
  track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
}
function renderMoods() {
  const cls = ['', 'blush', 'bur', '', 'blush'];
  $('#moodGrid').innerHTML = C.occasions.map((o, i) => `<button type="button" class="mood ${cls[i % cls.length]}" data-mood="${esc(o.id)}"><span class="emo"><svg aria-hidden="true"><use href="#m-${esc(o.id)}"/></svg></span><b>${esc(o.ar)}</b>${o.line ? `<span class="mline">${esc(o.line)}</span>` : ''}<span class="go">اطلب المود ده ←</span></button>`).join('');
  $('#occasionPills').innerHTML = C.occasions.map(o => `<label><input type="radio" name="occasion" value="${esc(o.id)}"><span>${esc(o.ar)}</span></label>`).join('') + '<label><input type="radio" name="occasion" value="" checked><span>مش لازم</span></label>';
}

/* ---------- واجهة السلة ---------- */
function linesHtml() {
  return `<ul class="lines">${cart.map(l => {
    const p = byId(l.id), shot = p.id === 'classic-roll' ? 'hero' : (PRODUCT_SHOTS[p.id] || [])[0];
    return `<li class="line" data-cid="${esc(p.id)}">
      <div class="lp"><img src="${esc(shot ? photo(shot) : p.image)}" alt=""></div>
      <div><div class="ln">${esc(nm(p))}</div><div class="lu">${esc(sub(p))} · ${isNum(p.price) ? fmt(p.price) + ' لل' + unitAr(p) : 'السعر بيتأكد على الواتساب'}</div>
        <div class="lc"><div class="qty sm" role="group" aria-label="عدد ${esc(nm(p))}" dir="ltr"><button type="button" data-act="cdec" aria-label="قلّل">−</button><input type="number" inputmode="numeric" min="1" max="${MAX}" value="${l.qty}" data-act="cset" aria-label="عدد ${esc(nm(p))}"><button type="button" data-act="cinc" aria-label="زوّد">+</button></div><button type="button" class="rm" data-act="cremove">شيل</button></div></div>
      ${isNum(p.price) ? `<div class="lt">${fmt(p.price * l.qty)}</div>` : ''}</li>`;
  }).join('')}</ul>`;
}
function totalsHtml() {
  const t = totals(), rolls = cart.reduce((s, l) => s + l.qty * (byId(l.id).pieces || 1), 0);
  return `<dl class="totals">
    <div><dt>عدد الرولز</dt><dd>${rolls}</dd></div>
    <div><dt>المجموع</dt><dd>${t.subtotal !== null ? fmt(t.subtotal) : TBC}</dd></div>
    <div><dt>التوصيل (${esc(cityAr)})</dt><dd class="${t.included ? 'incl' : ''}">${t.included ? 'مشمول' : t.fee !== null ? fmt(t.fee) : TBC}</dd></div>
    <div class="grand"><dt>الإجمالي</dt><dd>${t.total !== null ? fmt(t.total) : TBC}</dd></div>
  </dl>${t.included && t.total !== null ? '<p class="note" style="margin-top:8px">ده السعر كله… ولا جنيه زيادة. J\'S بتأكد التوفر وميعاد التوصيل على الواتساب.</p>' : ''}`;
}
const emptyHtml = () => `<div class="empty"><img src="assets/images/box-closed.webp" alt="" width="150" height="188" style="border-radius:14px;border:2px solid var(--esp)"><h3>السلة فاضية… والمود واقف.</h3><p>حاجة حلوة على بُعد دوسة.</p><button class="btn bur" type="button" data-add="big-mood-box">ضيف البوكس الكبير</button></div>`;
function renderCart() {
  const n = itemCount(), cc = $('#cartCount');
  cc.textContent = n; cc.dataset.n = n;
  $('#cartBtn').setAttribute('aria-label', `افتح طلبك، ${n} حاجة`);
  $('#drawerBody').innerHTML = cart.length ? linesHtml() + totalsHtml() : emptyHtml();
  $('#drawerFoot').innerHTML = cart.length ? '<a class="btn bur big" href="#checkout-area" data-close>كمّل الطلب</a><button class="btn cream" type="button" data-close>كمّل تفرّج</button>' : '';
  $('#summarySlot').innerHTML = cart.length ? linesHtml() + totalsHtml() : emptyHtml();
  $('#mbarBtn').textContent = n ? `كمّل الطلب (${n})` : 'ضيف البوكس';
  if (!cart.length && !$('#reviewPanel').hidden && $('#sentNote').hidden) hideReview();
}

/* ---------- الدرج والتوست ---------- */
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement; $('#toast').classList.remove('show');
  const d = $('#drawer'), s = $('#scrim'); d.hidden = false; s.hidden = false; void d.offsetWidth;
  d.classList.add('open'); s.classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#drawerClose').focus(), 60);
}
function closeDrawer(restore = true) {
  const d = $('#drawer'), s = $('#scrim'); if (d.hidden) return;
  d.classList.remove('open'); s.classList.remove('open'); document.body.style.overflow = '';
  setTimeout(() => { d.hidden = true; s.hidden = true; }, 320);
  if (restore && lastFocus) lastFocus.focus();
}
$('#cartBtn').addEventListener('click', openDrawer);
$('#drawerClose').addEventListener('click', () => closeDrawer());
$('#scrim').addEventListener('click', () => closeDrawer());
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDrawer(); closeMenu(); }
  if (e.key === 'Tab' && !$('#drawer').hidden) {
    const f = $$('#drawer a[href],#drawer button,#drawer input'); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
let toastT;
function toast(msg) { $('#toastMsg').textContent = msg; $('#toast').classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => $('#toast').classList.remove('show'), 3400); }
$('#toastView').addEventListener('click', () => { $('#toast').classList.remove('show'); openDrawer(); });
function bump() { const cb = $('#cartBtn'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
function quickAdd(id, qty = 1, btn) {
  const p = byId(id); if (!p) return;
  const added = addItem(id, qty);
  if (!added) { toast(canBuy(p) ? `أقصى عدد ${MAX} — عندك ${MAX} في السلة.` : `${nm(p)} مش متاح دلوقتي.`); return; }
  toast(`اتضاف ✦ ${qtyAr(added, p)} — ${nm(p)}`); bump();
  if (btn) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); burst(btn); }
}

/* ---------- الضغطات ---------- */
document.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) { if (addBtn.dataset.occasionFrom === 'split') groupSize = Number($('#friends').value); if (addBtn.hasAttribute('data-community')) { form.elements.community.checked = true; $('#communityFields').hidden = false; } quickAdd(addBtn.dataset.add, 1, addBtn); return; }
  const mood = e.target.closest('[data-mood]');
  if (mood) {
    const id = mood.dataset.mood, r = $(`#occasionPills input[value="${CSS.escape(id)}"]`); if (r) r.checked = true;
    if (!cart.length) addItem(featured.id, 1);
    const o = C.occasions.find(x => x.id === id);
    toast(`المود: ${o.ar} ✦ البوكس جاهز`); bump(); burst(mood);
    location.hash = 'checkout-area'; return;
  }
  const t = e.target.closest('[data-act],[data-close]');
  if (!t) return;
  if (t.hasAttribute('data-close')) { closeDrawer(false); if (t.tagName === 'A' && t.getAttribute('href') === location.hash) { e.preventDefault(); route(); } return; }
  const act = t.dataset.act, buy = t.closest('.buy'), line = t.closest('.line');
  if (buy && ['dec', 'inc', 'add'].includes(act)) {
    const inp = $('input', buy), v = clampQ(inp.value);
    if (act === 'dec') inp.value = Math.max(1, v - 1);
    if (act === 'inc') inp.value = Math.min(MAX, v + 1);
    if (act === 'add') { quickAdd(buy.dataset.pid, v, t); inp.value = 1; }
  }
  if (line) {
    const id = line.dataset.cid, l = cart.find(x => x.id === id); if (!l) return;
    if (act === 'cdec' && l.qty > 1) setQty(id, l.qty - 1);
    if (act === 'cinc') setQty(id, l.qty + 1);
    if (act === 'cremove') { removeItem(id); toast('اتشال من الطلب'); }
    const inDrawer = !$('#drawer').hidden, el = $((inDrawer ? '#drawer ' : '#summarySlot ') + `[data-cid="${CSS.escape(id)}"] [data-act="${act}"]`) || (inDrawer ? $('#drawerClose') : null);
    el && el.focus();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('.buy input')) t.value = clampQ(t.value);
  if (t.matches('[data-act="cset"]')) setQty(t.closest('.line').dataset.cid, t.value);
});

/* ---------- الطلب ---------- */
const form = $('#checkout'), FIELDS = ['name', 'phone', 'area', 'address', 'notes', 'rname', 'rphone', 'insta'];
function restoreDraft() {
  const d = store.get('js-checkout-v2'); if (!d) return;
  for (const k of FIELDS) if (form.elements[k] && typeof d[k] === 'string') form.elements[k].value = d[k];
  if (d.gift) { form.elements.gift.checked = true; $('#giftFields').hidden = false; }
  if (d.community) { form.elements.community.checked = true; $('#communityFields').hidden = false; }
}
form.addEventListener('input', e => {
  const d = { gift: form.elements.gift.checked, community: form.elements.community.checked }; for (const k of FIELDS) d[k] = form.elements[k].value;
  store.set('js-checkout-v2', d);
  if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target.name);
});
form.elements.gift.addEventListener('change', e => { $('#giftFields').hidden = !e.target.checked; if (e.target.checked) $('#f-rname').focus(); });
form.elements.community.addEventListener('change', e => { $('#communityFields').hidden = !e.target.checked; store.set('js-checkout-v2', Object.assign(store.get('js-checkout-v2') || {}, { community: e.target.checked })); });
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function normPhone(v) {
  let s = String(v).replace(/[٠-٩]/g, d => AR_DIGITS.indexOf(d)).replace(/[\s\-().]/g, '');
  if (s.startsWith('+20')) s = '0' + s.slice(3); else if (s.startsWith('0020')) s = '0' + s.slice(4); else if (s.startsWith('20') && s.length === 12) s = '0' + s.slice(2);
  return s;
}
const phoneRule = v => !v.trim() ? 'اكتب رقم الموبايل.' : /^01[0125]\d{8}$/.test(normPhone(v)) ? '' : 'اكتب رقم موبايل مصري، زي 01xxxxxxxxx.';
const rules = {
  name: v => v.trim().length >= 2 ? '' : 'اكتب اسمك بالكامل.',
  phone: phoneRule,
  area: v => v.trim().length >= 2 ? '' : (C.delivery.areas.length ? 'اختار منطقتك.' : 'اكتب منطقتك في إسكندرية.'),
  address: v => v.trim().length >= 8 ? '' : 'اكتب العنوان بالتفصيل (الشارع، العمارة، الدور).',
  rname: v => !form.elements.gift.checked || v.trim().length >= 2 ? '' : 'اكتب اسمه.',
  rphone: v => !form.elements.gift.checked ? '' : phoneRule(v)
};
function validate(k) {
  const el = form.elements[k]; if (!el || !rules[k]) return true;
  const msg = rules[k](el.value); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); $('#e-' + k).textContent = msg; return !msg;
}
function buildMessage(d) {
  const t = totals(), L = ["طلب جديد من موقع J'S", ''];
  L.push('الاسم: ' + d.name, 'رقم الموبايل: ' + d.phone, 'المدينة: ' + cityAr, 'المنطقة: ' + d.area, 'العنوان بالتفصيل: ' + d.address);
  const title = p => `${nm(p)}${p.nameAr ? ' (' + p.name + ')' : ''}${sub(p) ? ' — ' + sub(p) : ''}`;
  if (cart.length === 1) {
    const l = cart[0], p = byId(l.id);
    L.push('المنتج: ' + title(p), 'الكمية: ' + qtyAr(l.qty, p) + (p.pieces > 1 ? ` (${l.qty * p.pieces} رول)` : ''), `سعر ال${unitAr(p)}: ` + (isNum(p.price) ? fmt(p.price) + (p.deliveryIncluded ? ' (شامل التوصيل)' : '') : TBC));
  } else {
    L.push('المنتجات:'); cart.forEach((l, i) => { const p = byId(l.id); L.push(`${i + 1}. ${title(p)} — الكمية: ${l.qty} — السعر: ${isNum(p.price) ? fmt(p.price) : TBC}`); });
  }
  L.push('المجموع: ' + (t.subtotal !== null ? fmt(t.subtotal) : TBC));
  L.push('التوصيل: ' + (t.included ? 'مشمول' : t.fee !== null ? fmt(t.fee) + ' (J\'S هتأكده)' : TBC));
  L.push('الإجمالي النهائي: ' + (t.total !== null ? fmt(t.total) + (t.included ? ' (شامل كل حاجة)' : ' (J\'S هتأكده)') : TBC));
  if (d.occasion) L.push('المود: ' + d.occasion);
  if (d.group) L.push('هتتقسم على: ' + d.group + ' أشخاص');
  if (d.gift) L.push(`هدية: أيوه — التوصيل لـ ${d.rname} (${d.rphone})`);
  if (d.community) L.push(`الكوميونتي: أيوه، عايزين نتنزل على البيدج مع ${(C.community && C.community.name) || "Little Treats with J'S"}` + (d.insta ? ` — إنستجرام: ${d.insta}` : ''));
  L.push('ملاحظات: ' + (d.notes || 'مفيش'), '');
  L.push(t.included ? 'ياريت تأكدوا التوفر وميعاد التوصيل وتفاصيل الطلب.' : 'ياريت تأكدوا التوفر ومصاريف التوصيل وتفاصيل الطلب.');
  return L.join('\n');
}
let lastMsg = '';
form.addEventListener('submit', e => {
  e.preventDefault();
  cart = sanitize(cart); renderCart();
  const ok = ['name', 'phone', 'area', 'address', 'rname', 'rphone'].map(validate).every(Boolean);
  if (!cart.length) { $('#formErr').textContent = 'السلة فاضية — ضيف البوكس الأول.'; $('#summarySlot').scrollIntoView({ block: 'center' }); return; }
  if (!ok) { $('#formErr').textContent = 'صلّح الخانات اللي باللون الأحمر.'; const bad = $('[aria-invalid=true]', form); bad && bad.focus(); return; }
  $('#formErr').textContent = '';
  const f = form.elements, oc = C.occasions.find(o => o.id === (f.occasion.value || ''));
  const flat = s => s.trim().replace(/\s*\n\s*/g, '، ');
  lastMsg = buildMessage({ name: f.name.value.trim(), phone: normPhone(f.phone.value), area: f.area.value.trim(), address: flat(f.address.value), notes: f.notes.value.trim().replace(/\s*\n\s*/g, ' '), occasion: oc ? oc.ar : '', group: groupSize && groupSize > 1 ? groupSize : null, gift: f.gift.checked, rname: f.rname.value.trim(), rphone: normPhone(f.rphone.value), community: f.community.checked, insta: (v => v ? (v.startsWith('@') ? v : '@' + v) : '')(f.insta.value.trim().replace(/\s+/g, '')) });
  $('#msgPreview').textContent = lastMsg;
  $('#waLink').href = WA + '?text=' + encodeURIComponent(lastMsg);
  $('#sentNote').hidden = true; $('#formPanel').hidden = true; $('#reviewPanel').hidden = false;
  $('#reviewPanel').scrollIntoView({ block: 'start' }); $('#reviewPanel').focus({ preventScroll: true });
});
function hideReview() { $('#reviewPanel').hidden = true; $('#formPanel').hidden = false; }
$('#editBtn').addEventListener('click', () => { hideReview(); $('#f-name').focus(); });
$('#waLink').addEventListener('click', () => setTimeout(() => { $('#sentNote').hidden = false; }, 300));
$('#copyMsg').addEventListener('click', async e => { try { await navigator.clipboard.writeText(lastMsg); e.target.textContent = 'اتنسخ ✓'; } catch (err) { e.target.textContent = 'النسخ مقفول هنا — حدد النص اللي فوق'; } });
$('#newOrder').addEventListener('click', () => { cart = []; groupSize = null; save(); $('#sentNote').hidden = true; hideReview(); location.hash = 'home'; });

/* ---------- الدفع ---------- */
$('#aliasText').textContent = C.payment.instapayAlias;
$('#revealPay').addEventListener('click', e => {
  const open = $('#payDetails').hidden; $('#payDetails').hidden = !open;
  e.currentTarget.setAttribute('aria-expanded', String(open));
  e.currentTarget.textContent = open ? 'اخفي بيانات إنستاباي' : "J'S أكدت طلبي — وريني بيانات إنستاباي";
});
$('#copyAlias').addEventListener('click', async () => { try { await navigator.clipboard.writeText(C.payment.instapayAlias); $('#copyState').textContent = 'الرقم اتنسخ.'; } catch (err) { $('#copyState').textContent = 'النسخ مقفول هنا — الرقم هو ' + C.payment.instapayAlias + '.'; } });

/* ---------- قائمة الموبايل والبار ---------- */
function closeMenu() { $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
$('#menuBtn').addEventListener('click', () => { const o = !$('#nav').classList.contains('open'); $('#nav').classList.toggle('open', o); $('#menuBtn').setAttribute('aria-expanded', String(o)); });
$('#nav').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
$('#mbarBtn').addEventListener('click', e => { if (itemCount()) location.hash = 'checkout-area'; else quickAdd(featured.id, 1, e.currentTarget); });

/* ---------- ميلان صورة الهيرو ---------- */
const hp = $('#heroPic');
if (hp && !reduced) {
  hp.addEventListener('pointermove', e => { const r = hp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; hp.style.setProperty('--ty', (x - .5) * 16 + 'deg'); hp.style.setProperty('--tx', -(y - .5) * 16 + 'deg'); hp.style.setProperty('--lx', x * 100 + '%'); hp.style.setProperty('--ly', y * 100 + '%'); });
  hp.addEventListener('pointerleave', () => { hp.style.setProperty('--tx', '0deg'); hp.style.setProperty('--ty', '0deg'); });
}

/* ---------- البوكس الـ 3D ---------- */
const box = window.JSBox ? JSBox($('#box3d'), { open: false, rx: -22, ry: -30, hint: false, label: 'البوكس الكبير من J\'S وفيه 12 رول', help: '. اسحب أو استخدم الأسهم عشان تلفّه، ودوس Enter عشان تفتح أو تقفل الغطا.' }) : null;
if (box) $('#box3d').insertAdjacentHTML('beforeend', '<div class="b3-hint" dir="rtl">اسحب عشان تلفّه · دوس عشان تفتحه</div>');
const STEPS = [{ open: false, v: [-22, -30], price: false }, { open: true, v: [-30, -24], price: false }, { open: true, v: [-68, 0], price: false }, { open: true, v: [-32, -36], price: true }];
let autoplay = null, stepIdx = 0;
function goStep(i) {
  stepIdx = i; const s = STEPS[i]; if (!box) return;
  box.setOpen(s.open); box.view(s.v[0], s.v[1]);
  $('#priceCard').classList.toggle('hide', !s.price);
  $$('#unboxSteps li').forEach((li, j) => j === i ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current'));
  syncLid();
}
function syncLid() { if (!box) return; const o = box.isOpen(); $('#lidBtn').textContent = o ? 'اقفل الغطا' : 'افتح الغطا'; $('#lidBtn').setAttribute('aria-pressed', String(o)); }
function stopAuto() { clearInterval(autoplay); autoplay = null; }
if (box) {
  box.onInteract = () => { stopAuto(); syncLid(); };
  $('#lidBtn').addEventListener('click', () => { stopAuto(); box.toggle(); syncLid(); });
  $('#spinBtn').addEventListener('click', () => { stopAuto(); box.spin(180); });
  $$('#unboxSteps li').forEach(li => li.addEventListener('click', () => { stopAuto(); goStep(Number(li.dataset.step)); }));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && autoplay === null && stepIdx === 0) {
        let i = 0; autoplay = setInterval(() => { i++; if (i >= STEPS.length) { stopAuto(); return; } goStep(i); }, 2200);
        io.disconnect();
      }
    }), { threshold: .45 });
    io.observe($('#unbox .stage'));
  } else goStep(1);
}

/* ---------- قسّمها على الشلة ---------- */
const COLORS = [['#FDF2D2', '#28110C'], ['#5E0B13', '#FDF2D2'], ['#603027', '#FDF2D2'], ['#E1ACB5', '#28110C'], ['#28110C', '#FDF2D2'], ['#F2CDD3', '#28110C'], ['#C98444', '#28110C'], ['#9C3A46', '#FDF2D2'], ['#EBD9B4', '#28110C'], ['#7A1420', '#FDF2D2'], ['#D98E9B', '#28110C'], ['#B56A31', '#FDF2D2']];
const LETTERS = ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل'];
const QUIPS = { 1: 'الـ12 ليك لوحدك؟ مش هنحكم عليك.', 2: '6 و6… قسمة عادلة.', 3: '4 لكل واحد. حسبة سهلة.', 4: '3 لكل واحد. الكلاسيك.', 6: '2 لكل واحد. الكل كسبان.', 12: 'واحدة لكل واحد… اختار صح.' };
$('#tray').innerHTML = Array.from({ length: 12 }, () => '<div class="r"><img src="assets/illustrations/roll-top-flat.svg" alt="" width="120" height="120"><b></b></div>').join('');
$('#splitOut').insertAdjacentHTML('afterend', '<p id="splitQuip" class="quip"></p>');
function renderSplit() {
  const n = Number($('#friends').value), b12 = byId('big-mood-box'), pieces = b12.pieces || 12;
  const base = Math.floor(pieces / n), extra = pieces % n, owner = [];
  for (let f = 0; f < n; f++) for (let k = 0; k < base + (f < extra ? 1 : 0); k++) owner.push(f);
  $$('#tray .r').forEach((r, i) => { const f = owner[i]; $('b', r).textContent = LETTERS[f]; r.style.setProperty('--c', COLORS[f][0]); r.style.setProperty('--fg', COLORS[f][1]); r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); });
  $('#friendsVal').textContent = n;
  const per = b12.price / n;
  $('#perPerson').textContent = (Number.isInteger(per * 2) ? '' : '≈') + fmt(per);
  $('#perRolls').textContent = extra ? `${base}–${base + 1} رول` : `${base} رول`;
  $('#splitQuip').textContent = QUIPS[n] || (extra ? 'في ناس هتاخد زيادة… اتفقوا بقى.' : '');
  $('#legend').innerHTML = Array.from({ length: n }, (_, f) => `<li style="--c:${COLORS[f][0]}"><i></i>${n === 1 ? 'إنت' : 'صاحبك ' + LETTERS[f]} · ${base + (f < extra ? 1 : 0)}</li>`).join('');
}
$('#friends').addEventListener('input', renderSplit);

/* ---------- قلوب ونقط لما تضيف ---------- */
function burst(el) {
  if (reduced || !el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, layer = $('#burst');
  const cols = ['#E1ACB5', '#FDF2D2', '#603027', '#5E0B13', '#C98444'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i'), a = (i / 18) * Math.PI * 2 + Math.random() * .4, d = 60 + Math.random() * 90;
    if (i % 5 === 0) { p.className = 'h'; p.innerHTML = '<svg><use href="#i-heart"/></svg>'; }
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${cols[i % cols.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 30}px;--rot:${(Math.random() * 360) | 0}deg`;
    layer.appendChild(p); setTimeout(() => p.remove(), 950);
  }
}

/* ---------- العناوين بتنط (كلمة كلمة عشان الحروف العربي تفضل متشبكة) ---------- */
const bounceObs = (!reduced && 'IntersectionObserver' in window) ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('bounced'); bounceObs.unobserve(en.target); } }), { threshold: .3 }) : null;
$$('[data-bounce]').forEach(h => {
  if (!bounceObs) return;
  h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'ch'; w.setAttribute('aria-hidden', 'true'); w.style.setProperty('--i', i++); w.textContent = part;
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
  };
  walk(h); bounceObs.observe(h);
});
function rebounce() { if (!bounceObs) return; $$('.view.active [data-bounce]:not(.bounced)').forEach(h => bounceObs.observe(h)); }

/* ---------- مود النهارده (الهيرو) ---------- */
(function rotator() {
  const a = $('#rotAr'); if (!a || !C.occasions.length) return;
  let i = 0;
  const set = () => { a.textContent = C.occasions[i % C.occasions.length].ar; a.classList.remove('go'); void a.offsetWidth; a.classList.add('go'); };
  set(); if (!reduced) setInterval(() => { i++; set(); }, 2400);
})();

/* ---------- صُب واسحب ---------- */
(function scrubber() {
  const host = $('#frames'), range = $('#scrub'); if (!host || !range) return;
  const SETS = { pour: { n: 9, label: 'أيسينج بيتصب على رول سينامون من J\'S' }, pull: { n: 9, label: 'شوكة بتسحب حتة سايحة من رول J\'S' } };
  let imgs = [], played = false, anim = null;
  const paint = () => {
    const v = Number(range.value) / 100, a = Math.floor(v), b = Math.min(imgs.length - 1, a + 1), t = v - a;
    imgs.forEach((im, k) => { im.style.opacity = k === a ? 1 : k === b ? t : 0; });
    range.style.setProperty('--p', (Number(range.value) / Number(range.max) * 100) + '%');
    range.setAttribute('aria-valuetext', `لقطة ${a + 1} من ${imgs.length}`);
  };
  const load = name => {
    const S = SETS[name];
    host.innerHTML = Array.from({ length: S.n }, (_, i) => `<img src="assets/frames/${name}-${i}.webp" alt="" ${i ? 'loading="lazy"' : ''} width="414" height="414" draggable="false">`).join('');
    host.setAttribute('aria-label', S.label); imgs = $$('img', host);
    range.max = (S.n - 1) * 100; range.value = 0; paint();
  };
  const play = () => {
    cancelAnimationFrame(anim); const max = Number(range.max), start = performance.now(), dur = 2600;
    const step = now => { const t = Math.min(1, (now - start) / dur), e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; range.value = e * max; paint(); if (t < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  };
  range.addEventListener('input', () => { cancelAnimationFrame(anim); paint(); $('#scrubTag').style.opacity = 0; });
  $$('.tabs [data-set]').forEach(b => b.addEventListener('click', () => {
    $$('.tabs [data-set]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    load(b.dataset.set); if (!reduced) play();
  }));
  load('pour');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !played) { played = true; play(); io.disconnect(); } }), { threshold: .5 });
    io.observe(host);
  }
})();

/* ---------- التنقل بين الصفحات ---------- */
const VIEWS = ['home', 'rolls', 'story', 'order'];
const ANCHORS = { faq: 'order', payment: 'order', 'checkout-area': 'order', pour: 'home', unbox: 'home', split: 'home', moods: 'home', gallery: 'home', jana: 'home', 'first-drop': 'home' };
const TITLES = { home: "J'S — حاجة حلوة صغيرة تعدّل المود كله", rolls: "المنيو — J'S", story: "حكايتنا — J'S", order: "اطلب دلوقتي — J'S" };
let currentView = null;
function show(view) {
  $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
  $$('[data-nav]').forEach(a => a.dataset.nav === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  currentView = view; if (TITLES[view]) document.title = TITLES[view];
  $('#mbar').classList.toggle('hide', view === 'order'); document.body.classList.toggle('has-mbar', view !== 'order');
  observeReveals(); rebounce();
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1)), prev = currentView;
  if (h === 'main') { $('#main').focus(); return; }
  const prod = P.find(p => p.slug === h);
  if (prod) { show('product'); renderDetail(prod); observeReveals(); window.scrollTo(0, 0); return; }
  if (ANCHORS[h]) { if (currentView !== ANCHORS[h]) show(ANCHORS[h]); requestAnimationFrame(() => { const el = document.getElementById(h); el && el.scrollIntoView({ block: 'start' }); }); return; }
  show(VIEWS.includes(h) ? h : 'home');
  if (prev !== null || h) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
$('[data-skip]').addEventListener('click', e => { e.preventDefault(); $('#main').focus(); });

const revealObs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
function observeReveals() { $$('.view.active .reveal:not(.in)').forEach(el => revealObs ? revealObs.observe(el) : el.classList.add('in')); }

/* ---------- ملاحظة صاحبة البراند (بتتقفل من config.js) ---------- */
function renderSetup() {
  if (!C.showSetupNotice) return;
  const miss = [];
  if (!C.social.instagramUrl) miss.push('لينك إنستجرام — <code>social.instagramUrl</code>');
  if (!C.delivery.eta) miss.push('ميعاد التوصيل (لو أكيد بس) — <code>delivery.eta</code>');
  if (!C.founder.photo) miss.push('صورة المؤسسة — <code>founder.photo</code>');
  const ph = Object.keys(MEDIA).filter(isRender).length; if (ph) miss.push(`${ph} صور للبوكس لسه رندر 3D — <code>photos</code>`);
  P.forEach(p => { if (!p.details.allergens) miss.push(`الحساسية لـ ${esc(nm(p))} — <code>details.allergens</code>`); });
  if (!miss.length) return;
  $('#setupSum').textContent = `ناقص ${miss.length} حاجات`;
  $('#setupBox').innerHTML = `<p style="margin:0">عدّلي <code>js/config.js</code>:</p><ul>${miss.map(m => `<li>${m}</li>`).join('')}</ul><button class="btn cream" type="button" id="setupHide" style="margin-top:10px;min-height:40px">اخفيها</button>`;
  $('#setupHide').addEventListener('click', () => { $('#setup').hidden = true; });
  $('#setup').hidden = false;
}

/* ---------- البداية ---------- */
$('#year').textContent = new Date().getFullYear();
renderMenu(); renderFounder(); renderDrop(); renderFaq(); renderInstagram(); renderAreaField(); renderGallery(); renderMoods(); renderSplit();
restoreDraft(); paintDelivery(); renderCart(); renderSetup();
route();
}
