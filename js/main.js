/* =========================================================================
   SolarMax Energia — JS principal (vanilla, sem dependências)
   Todas as premissas e textos editáveis estão em js/config.js
   ========================================================================= */
(() => {
  'use strict';

  const C = window.SITE_CONFIG;
  const S = C.simulator;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilitários ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const num = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const brlCompact = (v) => (v >= 1e6 ? `R$ ${num(v / 1e6, 1)} mi` : v >= 1e3 ? `R$ ${num(v / 1e3)} mil` : BRL.format(v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const waLink = (msg) => `https://wa.me/${C.contact.whatsapp}?text=${encodeURIComponent(msg || C.texts.whatsappDefault)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* =======================================================================
     1. Aplica a configuração na página
     ======================================================================= */
  function applyConfig() {
    $$('[data-cfg]').forEach((el) => {
      const v = get(C, el.dataset.cfg);
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-wa]').forEach((a) => (a.href = waLink()));
    $$('[data-tel]').forEach((a) => (a.href = `tel:${C.contact.phoneTel}`));
    $$('[data-mail]').forEach((a) => (a.href = `mailto:${C.contact.email}`));
    $$('[data-social]').forEach((a) => {
      const url = C.social[a.dataset.social];
      if (url) a.href = url;
      else a.closest('li').remove();
    });
    if (C.brand.logoUrl) {
      $$('.logo__mark').forEach((m) => { m.classList.add('has-img'); m.innerHTML = `<img src="${esc(C.brand.logoUrl)}" alt="" />`; });
    }
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* Imagem quebrada → placeholder elegante (evita "buracos" no layout) */
  const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><radialGradient id="g" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#FFB800" stop-opacity=".5"/><stop offset="1" stop-color="#0B1426"/></radialGradient></defs><rect width="400" height="300" fill="#0B1426"/><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="170" r="34" fill="#FFB800"/></svg>`
  );
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && !img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.removeAttribute('srcset');
      img.src = PLACEHOLDER;
    }
  }, true);

  /* =======================================================================
     2. Header (blur ao rolar) + menu mobile
     ======================================================================= */
  function initHeader() {
    const header = $('#header');
    const toggle = $('#menuToggle');
    const nav = $('#nav');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { header.classList.toggle('is-scrolled', window.scrollY > 20); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* =======================================================================
     3. Animações de entrada + contadores
     ======================================================================= */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  function initCounters() {
    const els = $$('[data-count]');
    const render = (el, v) => {
      el.textContent = `${el.dataset.prefix || ''}${num(v, +(el.dataset.decimals || 0))}${el.dataset.suffix || ''}`;
    };
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduceMotion) return render(el, target);
      const dur = 1800;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        render(el, target * easeOut(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return els.forEach(run);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach((el) => { render(el, 0); io.observe(el); });
  }

  /* =======================================================================
     5. SIMULADOR DE ECONOMIA
     ======================================================================= */
  let lastSim = null; // guardado para preencher o formulário / mensagem

  /** Cálculo puro — fácil de testar/ajustar. */
  function calcular(conta, uf, tipoId) {
    const estado = C.states.find((s) => s.uf === uf);
    const tipo = C.propertyTypes.find((t) => t.id === tipoId) || C.propertyTypes[0];
    const hsp = (S.USAR_IRRADIACAO_POR_ESTADO && estado && estado.hsp) || S.IRRADIACAO_MEDIA;
    const tarifa = S.TARIFA_KWH * (tipo.fatorTarifa || 1);

    const consumo = conta / tarifa;                                   // kWh/mês
    const geracaoPorKwp = hsp * S.DIAS_MES * S.EFICIENCIA_SISTEMA;   // kWh/mês por kWp
    const kwpNecessario = consumo / geracaoPorKwp;
    const placas = Math.max(1, Math.ceil((kwpNecessario * 1000) / S.POTENCIA_PAINEL_W));
    const kwp = (placas * S.POTENCIA_PAINEL_W) / 1000;                // potência real (placas inteiras)
    const area = placas * S.AREA_POR_PLACA_M2;
    const econMensal = conta * S.PERCENTUAL_ECONOMIA;
    const econAnual = econMensal * 12;
    const investimento = kwp * S.CUSTO_KWP;

    // Projeção ano a ano com reajuste de tarifa e degradação das placas
    const serieSem = [0];
    const serieCom = [investimento];
    let accSem = 0, accCom = investimento, econ25 = 0, payback = null;
    for (let ano = 1; ano <= S.ANOS_PROJECAO; ano++) {
      const contaAno = conta * 12 * Math.pow(1 + S.REAJUSTE_TARIFA_ANUAL, ano - 1);
      const econAno = contaAno * S.PERCENTUAL_ECONOMIA * Math.pow(1 - S.DEGRADACAO_ANUAL, ano - 1);
      if (payback === null && econ25 + econAno >= investimento) {
        payback = ano - 1 + (investimento - econ25) / econAno;
      }
      econ25 += econAno;
      accSem += contaAno;
      accCom += contaAno - econAno;
      serieSem.push(accSem);
      serieCom.push(accCom);
    }

    const geracaoAnual = kwp * geracaoPorKwp * 12;
    const co2Kg = geracaoAnual * S.FATOR_CO2_KG_KWH * S.ANOS_PROJECAO;
    const arvores = Math.round((geracaoAnual * S.FATOR_CO2_KG_KWH) / S.CO2_POR_ARVORE_KG_ANO);

    return { conta, uf, tipo, consumo, kwp, placas, area, econMensal, econAnual, econ25, investimento, payback, serieSem, serieCom, co2Kg, arvores };
  }

  function initSimulator() {
    const range = $('#billRange');
    const input = $('#billInput');
    const stateSel = $('#simState');
    const cityIn = $('#simCity');
    const typesBox = $('#simTypes');
    if (!range) return;

    // popula selects
    stateSel.innerHTML = C.states.map((s) => `<option value="${s.uf}">${esc(s.name)}</option>`).join('');
    stateSel.value = C.defaultState;
    typesBox.innerHTML = C.propertyTypes.map((t, i) => `
      <label><input type="radio" name="simType" value="${t.id}" ${i === 0 ? 'checked' : ''} /><span>${esc(t.label)}</span></label>`).join('');
    input.min = S.CONTA_MIN; input.max = S.CONTA_MAX; input.value = S.CONTA_PADRAO;

    // slider não-linear (mais precisão nos valores baixos, que são a maioria)
    const toValue = (t) => Math.round((S.CONTA_MIN + (S.CONTA_MAX - S.CONTA_MIN) * Math.pow(t / 1000, 2)) / 10) * 10;
    const toSlider = (v) => Math.round(Math.sqrt((clamp(v, S.CONTA_MIN, S.CONTA_MAX) - S.CONTA_MIN) / (S.CONTA_MAX - S.CONTA_MIN)) * 1000);
    const syncRange = (v) => {
      range.value = toSlider(v);
      range.style.setProperty('--pct', `${range.value / 10}%`);
      range.setAttribute('aria-valuetext', BRL.format(v));
    };

    let pending = false;
    const update = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const conta = clamp(parseFloat(input.value) || S.CONTA_MIN, S.CONTA_MIN, S.CONTA_MAX);
        const tipo = ($('input[name="simType"]:checked') || {}).value;
        lastSim = calcular(conta, stateSel.value, tipo);
        lastSim.cidade = cityIn.value.trim();
        render(lastSim);
      });
    };

    range.addEventListener('input', () => { input.value = toValue(+range.value); syncRange(+input.value); update(); });
    input.addEventListener('input', () => { if (input.value) { syncRange(+input.value); update(); } });
    input.addEventListener('blur', () => { input.value = clamp(+input.value || S.CONTA_MIN, S.CONTA_MIN, S.CONTA_MAX); syncRange(+input.value); update(); });
    stateSel.addEventListener('change', update);
    cityIn.addEventListener('input', () => { if (lastSim) lastSim.cidade = cityIn.value.trim(); });
    typesBox.addEventListener('change', update);

    syncRange(S.CONTA_PADRAO);

    // Gráfico só é desenhado (com animação) quando entra na tela
    const chartEl = $('#chart');
    let chartVisible = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !chartVisible) { chartVisible = true; if (lastSim) drawChart(lastSim, true); }
    }, { threshold: 0.3 }).observe(chartEl);

    function render(r) {
      const fmt = {
        consumo: (v) => `${num(v)} kWh/mês`,
        kwp: (v) => `${num(v, 2)} kWp`,
        placas: (v) => `${num(v)} placas`,
        area: (v) => `${num(v)} m²`,
        econMensal: (v) => BRL.format(v),
        econAnual: (v) => BRL.format(v),
        econ25: (v) => brlCompact(v),
        investimento: (v) => BRL.format(v),
        payback: (v) => (v === null ? `+${S.ANOS_PROJECAO} anos` : `${num(v, 1)} anos`),
        co2: (v) => `${num(v / 1000, 1)} t`,
        arvores: (v) => num(v),
      };
      const values = { ...r, co2: r.co2Kg };
      $$('[data-out]').forEach((el) => {
        const key = el.dataset.out;
        tween(el, values[key], fmt[key]);
      });
      if (chartVisible) drawChart(r, false);
    }

    update();

    // CTA → formulário pré-preenchido
    $('#simCta').addEventListener('click', () => prefillForm(lastSim));
  }

  /* Anima a troca de números nos cards de resultado */
  function tween(el, to, format) {
    if (to === null || to === undefined) { el.textContent = format(null); return; }
    const from = parseFloat(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduceMotion || from === to) { el.textContent = format(to); return; }
    cancelAnimationFrame(el._raf);
    const t0 = performance.now();
    const dur = 500;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = format(from + (to - from) * easeOut(p));
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* Gráfico SVG: gasto acumulado com e sem solar */
  function drawChart(r, animate) {
    const el = $('#chart');
    const W = 640, H = 300, pl = 58, pr = 86, pt = 16, pb = 34;
    const n = r.serieSem.length - 1;
    const max = Math.max(r.serieSem[n], r.serieCom[n]) * 1.08;
    const x = (i) => pl + (i / n) * (W - pl - pr);
    const y = (v) => pt + (1 - v / max) * (H - pt - pb);
    const line = (s) => s.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');

    let grid = '';
    for (let k = 0; k <= 4; k++) {
      const v = (max / 4) * k;
      grid += `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/>`;
      grid += `<text class="axis-label" x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${brlCompact(v)}</text>`;
    }
    for (let a = 0; a <= n; a += 5) {
      grid += `<text class="axis-label" x="${x(a)}" y="${H - 10}" text-anchor="middle">${a === 0 ? 'Hoje' : `${a} anos`}</text>`;
    }

    // rótulos finais sem sobreposição
    let yBad = y(r.serieSem[n]), yGood = y(r.serieCom[n]);
    if (Math.abs(yBad - yGood) < 18) yGood = yBad + 18;

    let payback = '';
    if (r.payback !== null && r.payback <= n) {
      const i = Math.floor(r.payback), f = r.payback - i;
      const pv = r.serieCom[i] + ((r.serieCom[Math.min(n, i + 1)] - r.serieCom[i]) * f);
      const px = pl + (r.payback / n) * (W - pl - pr);
      payback = `<circle class="payback-dot" cx="${px}" cy="${y(pv)}" r="6"/>
        <text class="payback-label" x="${px}" y="${y(pv) - 14}" text-anchor="middle">Payback</text>`;
    }

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="gBad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F87171" stop-opacity=".25"/><stop offset="1" stop-color="#F87171" stop-opacity="0"/></linearGradient>
          <linearGradient id="gGood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22C55E" stop-opacity=".25"/><stop offset="1" stop-color="#22C55E" stop-opacity="0"/></linearGradient>
        </defs>
        ${grid}
        <path class="line line--bad" d="${line(r.serieSem)}"/>
        <path class="line line--good" d="${line(r.serieCom)}"/>
        ${payback}
        <text class="end-label" x="${x(n) + 8}" y="${yBad + 4}" fill="#F87171">${brlCompact(r.serieSem[n])}</text>
        <text class="end-label" x="${x(n) + 8}" y="${yGood + 4}" fill="#22C55E">${brlCompact(r.serieCom[n])}</text>
      </svg>`;

    if (animate && !reduceMotion) {
      $$('.line', el).forEach((p) => {
        const len = p.getTotalLength();
        p.style.setProperty('--len', len);
        p.classList.add('draw');
      });
    }

    const diff = r.serieSem[n] - r.serieCom[n];
    $('#chartSummary').innerHTML = `Em ${n} anos você gastaria <b>${BRL.format(r.serieSem[n])}</b> sem energia solar e
      <b>${BRL.format(r.serieCom[n])}</b> com energia solar (já contando o investimento): <strong>${BRL.format(diff)} a mais no seu bolso</strong>.`;
    el.setAttribute('aria-label', `Gasto acumulado em ${n} anos: ${BRL.format(r.serieSem[n])} sem energia solar e ${BRL.format(r.serieCom[n])} com energia solar.`);
  }

  /* =======================================================================
     6. Abas de segmentos (ARIA tabs com teclado)
     ======================================================================= */
  function initTabs() {
    const tabs = $$('[role="tab"]');
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (e.key in map) {
          e.preventDefault();
          select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
        }
      });
    });
    // CTAs dos segmentos pré-selecionam o tipo de imóvel no formulário
    $$('[data-segment]').forEach((a) => a.addEventListener('click', () => { $('#fType').value = a.dataset.segment; }));
  }

  /* =======================================================================
     7. Portfólio: filtro + lightbox
     ======================================================================= */
  function initProjects() {
    const gallery = $('#gallery');
    const lightbox = $('#lightbox');
    if (!gallery) return;
    const catLabel = { residencial: 'Residencial', comercial: 'Comercial', agro: 'Agronegócio', industrial: 'Industrial' };
    const img = (url, w) => `${url}?w=${w}&auto=format&fit=crop&q=70`;

    gallery.innerHTML = C.projects.map((p, i) => `
      <li class="gallery__item" data-cat="${p.cat}">
        <button class="project" type="button" data-index="${i}" aria-label="Ampliar: ${esc(p.title)}, ${esc(p.city)}">
          <span class="project__img"><img src="${img(p.img, 600)}" srcset="${img(p.img, 400)} 400w, ${img(p.img, 600)} 600w, ${img(p.img, 800)} 800w"
               sizes="(min-width:1100px) 280px, (min-width:900px) 33vw, (min-width:560px) 50vw, 92vw"
               loading="lazy" decoding="async" width="600" height="450" alt="${esc(p.alt)}" /></span>
          <span class="project__info">
            <span class="project__title">${esc(p.title)}</span>
            <span class="project__meta">${esc(p.city)} · ${catLabel[p.cat] || p.cat} · ${num(p.kwp, 1)} kWp</span>
            <span class="project__meta">Economia de <b>${BRL.format(p.saving)}/mês</b></span>
          </span>
        </button>
      </li>`).join('');

    // Filtro
    $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      const f = btn.dataset.filter;
      $$('.gallery__item', gallery).forEach((li) => {
        const show = f === 'todos' || li.dataset.cat === f;
        li.classList.toggle('is-hidden', !show);
        li.classList.remove('is-entering');
        if (show && !reduceMotion) { void li.offsetWidth; li.classList.add('is-entering'); }
      });
    }));

    // Lightbox
    if (!lightbox || typeof lightbox.showModal !== 'function') return;
    let current = 0;
    const visible = () => $$('.gallery__item:not(.is-hidden) .project', gallery).map((b) => +b.dataset.index);
    const show = (i) => {
      current = i;
      const p = C.projects[i];
      const im = $('#lightboxImg');
      im.removeAttribute('data-fallback');
      im.src = img(p.img, 1400);
      im.alt = p.alt;
      $('#lightboxCap').innerHTML = `<strong>${esc(p.title)}</strong><span>${esc(p.city)} · ${num(p.kwp, 1)} kWp · Economia de <b>${BRL.format(p.saving)}/mês</b></span>`;
    };
    const move = (d) => { const list = visible(); const pos = list.indexOf(current); show(list[(pos + d + list.length) % list.length]); };
    let opener = null;
    gallery.addEventListener('click', (e) => {
      const b = e.target.closest('.project');
      if (!b) return;
      opener = b;
      show(+b.dataset.index);
      lightbox.showModal();
    });
    $('[data-prev]', lightbox).addEventListener('click', () => move(-1));
    $('[data-next]', lightbox).addEventListener('click', () => move(1));
    lightbox.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', () => opener && opener.focus());
  }

  /* =======================================================================
     8. Carrossel de depoimentos (scroll-snap + autoplay respeitoso)
     ======================================================================= */
  function initTestimonials() {
    const track = $('#tTrack');
    const dots = $('#tDots');
    if (!track) return;

    track.innerHTML = C.testimonials.map((t, i) => `
      <li class="testimonial" aria-roledescription="slide" aria-label="${i + 1} de ${C.testimonials.length}">
        <div class="testimonial__stars" role="img" aria-label="${t.stars} de 5 estrelas">${'★'.repeat(t.stars)}</div>
        <blockquote>“${esc(t.text)}”</blockquote>
        <div class="testimonial__person">
          <img src="${t.photo}?w=96&h=96&fit=crop&crop=faces&auto=format&q=70" loading="lazy" decoding="async" width="44" height="44" alt="Foto de ${esc(t.name)}" />
          <div><strong>${esc(t.name)}</strong><span>${esc(t.city)} · <span class="testimonial__saving">economiza ${esc(t.saving)}</span></span></div>
        </div>
      </li>`).join('');

    const items = $$('.testimonial', track);
    dots.innerHTML = items.map((_, i) => `<button type="button" aria-label="Ir para o depoimento ${i + 1}"></button>`).join('');
    const dotBtns = $$('button', dots);

    const goTo = (i) => {
      const idx = (i + items.length) % items.length;
      track.scrollTo({ left: items[idx].offsetLeft - track.offsetLeft - 4, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    const currentIndex = () => {
      const left = track.scrollLeft;
      let best = 0, bestDist = Infinity;
      items.forEach((it, i) => { const d = Math.abs(it.offsetLeft - track.offsetLeft - 4 - left); if (d < bestDist) { bestDist = d; best = i; } });
      return best;
    };
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    const updateDots = () => { const c = currentIndex(); dotBtns.forEach((d, i) => d.setAttribute('aria-current', String(i === c))); };

    dotBtns.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    $('#tPrev').addEventListener('click', () => goTo(currentIndex() - 1));
    $('#tNext').addEventListener('click', () => (atEnd() ? goTo(0) : goTo(currentIndex() + 1)));
    let st;
    track.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(updateDots, 80); }, { passive: true });
    updateDots();

    // Autoplay: pausa no hover, foco, fora da tela ou com movimento reduzido
    if (reduceMotion) return;
    let paused = false, inView = false;
    const section = track.closest('section');
    ['pointerenter', 'focusin'].forEach((ev) => section.addEventListener(ev, () => (paused = true)));
    ['pointerleave', 'focusout'].forEach((ev) => section.addEventListener(ev, () => (paused = false)));
    new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.4 }).observe(track);
    setInterval(() => { if (!paused && inView && !document.hidden) atEnd() ? goTo(0) : goTo(currentIndex() + 1); }, 6000);
  }

  /* =======================================================================
     9. Formulário de lead → WhatsApp (+ webhook opcional)
     ======================================================================= */
  function maskPhone(v) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function prefillForm(sim) {
    if (!sim) return;
    const ufName = (C.states.find((s) => s.uf === sim.uf) || {}).uf || '';
    $('#fBill').value = Math.round(sim.conta);
    $('#fCity').value = sim.cidade ? `${sim.cidade} / ${ufName}` : ($('#fCity').value || '');
    $('#fType').value = sim.tipo.id;
    const box = $('#simSummary');
    box.hidden = false;
    box.innerHTML = `<strong>Sua simulação:</strong> sistema de ${num(sim.kwp, 2)} kWp (${sim.placas} placas),
      economia de ${BRL.format(sim.econMensal)}/mês e payback de ${sim.payback === null ? '+25' : num(sim.payback, 1)} anos.`;
    $('#leadForm').dataset.withSim = '1';

    const form = $('#leadForm');
    $('#contato').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => {
      $('#fName').focus({ preventScroll: true });
      form.classList.remove('is-highlight'); void form.offsetWidth; form.classList.add('is-highlight');
    }, reduceMotion ? 0 : 700);
  }

  /** Ponto de integração futura: envia o lead para um webhook/planilha/CRM. */
  function sendLead(payload) {
    if (!C.webhookUrl) return;
    try {
      fetch(C.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true, // garante o envio mesmo abrindo o WhatsApp em seguida
      }).catch(() => {});
    } catch (_) { /* silencioso: o WhatsApp é o canal principal */ }
  }

  function initForm() {
    const form = $('#leadForm');
    if (!form) return;
    const typeSel = $('#fType');
    typeSel.insertAdjacentHTML('beforeend', C.propertyTypes.map((t) => `<option value="${t.id}">${esc(t.label)}</option>`).join(''));

    const phone = $('#fPhone');
    phone.addEventListener('input', () => { phone.value = maskPhone(phone.value); });

    const rules = {
      fName: (v) => (v.trim().length >= 3 ? '' : 'Informe seu nome.'),
      fPhone: (v) => (/^\d{10,11}$/.test(v.replace(/\D/g, '')) ? '' : 'Informe um WhatsApp válido com DDD.'),
      fEmail: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'E-mail inválido.'),
      fCity: (v) => (v.trim().length >= 2 ? '' : 'Informe sua cidade.'),
      fBill: (v) => (parseFloat(v) > 0 ? '' : 'Informe o valor médio da conta.'),
      fType: (v) => (v ? '' : 'Selecione o tipo de imóvel.'),
      fConsent: (_, el) => (el.checked ? '' : 'É preciso concordar para continuar.'),
    };
    const validate = (id) => {
      const el = $('#' + id);
      const msg = rules[id](el.value, el);
      el.setAttribute('aria-invalid', String(!!msg));
      $('#' + id + '-err').textContent = msg;
      return !msg;
    };
    let tried = false;
    Object.keys(rules).forEach((id) => {
      const el = $('#' + id);
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur', () => tried && validate(id));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      tried = true;
      const results = Object.keys(rules).map(validate);
      if (results.includes(false)) {
        const first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        $('#formStatus').textContent = '';
        return;
      }

      const data = {
        nome: $('#fName').value.trim(),
        whatsapp: phone.value,
        email: $('#fEmail').value.trim(),
        cidade: $('#fCity').value.trim(),
        conta: parseFloat($('#fBill').value),
        tipo: typeSel.options[typeSel.selectedIndex].text,
        origem: 'landing-page',
        data: new Date().toISOString(),
      };
      const withSim = form.dataset.withSim === '1' && lastSim;
      if (withSim) {
        data.simulacao = {
          kwp: +lastSim.kwp.toFixed(2), placas: lastSim.placas, area_m2: Math.round(lastSim.area),
          economia_mensal: Math.round(lastSim.econMensal), investimento: Math.round(lastSim.investimento),
          payback_anos: lastSim.payback === null ? null : +lastSim.payback.toFixed(1),
        };
      }

      const lines = [
        `Olá! Gostaria de um orçamento de energia solar.`,
        ``,
        `*Nome:* ${data.nome}`,
        `*WhatsApp:* ${data.whatsapp}`,
        data.email ? `*E-mail:* ${data.email}` : null,
        `*Cidade:* ${data.cidade}`,
        `*Conta média:* ${BRL.format(data.conta)}`,
        `*Tipo de imóvel:* ${data.tipo}`,
      ];
      if (withSim) {
        const s = data.simulacao;
        lines.push('', '*Simulação do site:*',
          `• Sistema: ${num(s.kwp, 2)} kWp (${s.placas} placas)`,
          `• Economia estimada: ${BRL.format(s.economia_mensal)}/mês`,
          `• Investimento estimado: ${BRL.format(s.investimento)}`,
          `• Payback: ${s.payback_anos === null ? '+25' : num(s.payback_anos, 1)} anos`);
      }
      const url = waLink(lines.filter((l) => l !== null).join('\n'));

      sendLead(data);
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url; // bloqueador de pop-up
      $('#formStatus').textContent = 'Pronto! Abrimos o WhatsApp com seus dados. É só enviar a mensagem.';
    });
  }

  /* =======================================================================
     10. Diálogos, tooltip do WhatsApp
     ======================================================================= */
  function initDialogs() {
    const privacy = $('#privacy');
    $$('[data-open-privacy]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      if (privacy.showModal) privacy.showModal();
    }));
    $$('dialog [data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    privacy.addEventListener('click', (e) => { if (e.target === privacy) privacy.close(); });

    // mostra o tooltip do botão flutuante uma vez, alguns segundos após carregar
    const wa = $('.wa-float');
    setTimeout(() => { wa.classList.add('show-tip'); setTimeout(() => wa.classList.remove('show-tip'), 4000); }, 5000);
  }

  /* ---------- Inicialização ---------- */
  applyConfig();
  initHeader();
  initReveal();
  initCounters();
  initSimulator();
  initTabs();
  initProjects();
  initTestimonials();
  initForm();
  initDialogs();
})();
