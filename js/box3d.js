/* J'S Big Mood Box — CSS 3D box with 12 rolls. No libraries. */
(function () {
  const ROLL = 'assets/illustrations/roll-top-flat.svg';
  const LOGO = 'assets/brand/wordmark-sticker.svg';
  const SEAL = 'assets/brand/seal.svg';

  function JSBox(host, opts = {}) {
    const o = Object.assign({ maxScale: 1.15, open: false, rx: -30, ry: -32, interactive: true, hint: true, label: "The J'S Big Mood Box with 12 Classic Cinnamon Rolls" }, opts);
    host.classList.add('b3');
    const rolls = Array.from({ length: 12 }, (_, i) => `<div class="b3-roll" data-i="${i}">${[0, 6, 12, 18].map(z => `<i style="--z:${z}"></i>`).join('')}<img src="${ROLL}" alt="" draggable="false"><span class="tagdot"></span></div>`).join('');
    host.innerHTML = `<div class="b3-scene"><div class="b3-scale"><div class="b3-rig">
      <div class="b3-f b3-shadow"></div>
      <div class="b3-f b3-tb b3-bottom b3-in"></div>
      <div class="b3-f b3-tb b3-liner"><div class="b3-rolls">${rolls}</div></div>
      <div class="b3-f b3-fb b3-front b3-out"><div class="band"></div><span>LITTLE TREATS. BIG MOODS.</span></div>
      <div class="b3-f b3-fb b3-back b3-out"><div class="band"></div><span>J'S</span></div>
      <div class="b3-f b3-sd b3-left b3-out side" style="font-size:15px"><div class="band"></div><span>A LITTLE SOMETHING GOOD.</span></div>
      <div class="b3-f b3-sd b3-right b3-out side" style="font-size:15px"><div class="band"></div><span>12 CLASSIC ROLLS</span></div>
      <div class="b3-f b3-fb b3-front-in b3-in"></div>
      <div class="b3-f b3-fb b3-back-in b3-in"></div>
      <div class="b3-f b3-sd b3-left-in b3-in"></div>
      <div class="b3-f b3-sd b3-right-in b3-in"></div>
      <div class="b3-f b3-tb b3-lidhinge"><div class="b3-lid">
        <div class="b3-lid-out"><div class="lidart"><img src="${LOGO}" alt="" draggable="false"><b>THE BIG MOOD BOX</b><small>12 CLASSIC CINNAMON ROLLS</small></div><img class="seal" src="${SEAL}" alt="" draggable="false"></div>
        <div class="b3-lid-in"><span>A LITTLE SOMETHING GOOD.</span></div>
        <div class="b3-lip"></div>
      </div></div>
    </div></div></div>${o.hint ? '<div class="b3-hint">Drag to turn · tap to open</div>' : ''}`;
    const rig = host.querySelector('.b3-rig'), scale = host.querySelector('.b3-scale');
    let rx = o.rx, ry = o.ry, open = !!o.open;
    const apply = () => { rig.style.setProperty('--rx', rx + 'deg'); rig.style.setProperty('--ry', ry + 'deg'); rig.style.setProperty('--open', (open ? 118 : 0) + 'deg'); host.setAttribute('aria-pressed', String(open)); };
    const fit = () => { const w = host.clientWidth || 600; scale.style.setProperty('--k', Math.min(o.maxScale, w / 640).toFixed(3)); };
    const ro = new ResizeObserver(fit); ro.observe(host); fit(); apply();

    if (o.interactive) {
      host.tabIndex = 0;
      host.setAttribute('role', 'button');
      host.setAttribute('aria-label', o.label + (o.help || '. Drag or use arrow keys to turn it; press Enter to open or close the lid.'));
      let sx = 0, sy = 0, bx = 0, by = 0, moved = false, down = false;
      host.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; bx = ry; by = rx; host.setPointerCapture(e.pointerId); });
      host.addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) > 6) { moved = true; host.classList.add('dragging', 'grabbing'); api.onInteract && api.onInteract(); }
        if (moved) { ry = bx + dx * 0.45; rx = Math.max(-75, Math.min(-6, by - dy * 0.3)); apply(); }
      });
      const end = () => { if (!down) return; down = false; host.classList.remove('dragging', 'grabbing'); if (!moved) { open = !open; apply(); api.onInteract && api.onInteract(); } };
      host.addEventListener('pointerup', end); host.addEventListener('pointercancel', () => { down = false; host.classList.remove('dragging', 'grabbing'); });
      host.addEventListener('keydown', e => {
        const k = e.key;
        if (k === 'ArrowLeft') ry -= 12; else if (k === 'ArrowRight') ry += 12; else if (k === 'ArrowUp') rx = Math.max(-75, rx - 8); else if (k === 'ArrowDown') rx = Math.min(-6, rx + 8);
        else if (k === 'Enter' || k === ' ') open = !open; else return;
        e.preventDefault(); apply(); api.onInteract && api.onInteract();
      });
    }
    const api = {
      el: host,
      setOpen(v) { open = !!v; apply(); },
      toggle() { open = !open; apply(); },
      isOpen: () => open,
      view(x, y) { rx = x; ry = y; apply(); },
      spin(by = 90) { ry += by; apply(); },
      setTags(tags) {
        if (tags) host.setAttribute('data-split', ''); else host.removeAttribute('data-split');
        host.querySelectorAll('.b3-roll').forEach((r, i) => { const t = tags && tags[i], d = r.querySelector('.tagdot'); if (t) { d.textContent = t.label; d.style.background = t.color; d.style.color = t.fg; } });
      },
      lift(i, on) { const r = host.querySelectorAll('.b3-roll')[i]; r && r.classList.toggle('lift', on); },
      onInteract: null
    };
    return api;
  }
  window.JSBox = JSBox;
})();
