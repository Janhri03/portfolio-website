/* Editorial motion: shared timing, distinct scenes, progressive enhancement. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = $('.nav-links');
  const toggle = $('.nav-toggle');
  const links = $$('.nav-link');
  const projects = $$('.project-item');
  const intro = $('.page-intro');
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  let menuTimeline;
  let menuOpen = false;
  let opening;
  let openingFinished = false;
  let media;
  let toastTimer;
  let activeLink = links[0];
  let pointerCleanup = () => {};

  function finishOpening() {
    openingFinished = true;
    root.classList.remove('motion-pending');
    intro.hidden = true;
    clearTimeout(window.motionSafetyTimer);
    try { sessionStorage.setItem('zh-intro-seen', '1'); } catch (_) { /* Storage is optional. */ }
  }

  function menuState(open, restoreFocus = false) {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    nav.classList.toggle('show', open);
    if (matchMedia('(max-width: 768px)').matches) nav.inert = !open;
    if (menuTimeline && !reduced.matches) {
      if (open) menuTimeline.play();
      else menuTimeline.reverse();
    }
    if (restoreFocus) toggle.focus();
  }

  toggle.setAttribute('aria-controls', 'portfolio-navigation');
  nav.id = 'portfolio-navigation';
  toggle.addEventListener('click', () => menuState(!menuOpen));
  links.forEach(link => link.addEventListener('click', () => menuState(false)));
  document.addEventListener('keydown', event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') menuState(false, true);
    if (event.key === 'Tab') {
      const items = [toggle, ...links];
      const index = items.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && index === items.length - 1) { event.preventDefault(); toggle.focus(); }
    }
  });

  // One shared indicator travels between the existing navigation links.
  const indicator = document.createElement('li');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.append(indicator);
  function placeIndicator(link = activeLink, immediate = false) {
    if (!link || matchMedia('(max-width: 768px)').matches) return;
    const parent = nav.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const values = { x: rect.left - parent.left, scaleX: rect.width, duration: immediate ? 0 : 0.32, ease: 'power3.out', overwrite: true };
    if (gsap && !reduced.matches) gsap.to(indicator, values);
    else indicator.style.transform = `translateX(${values.x}px) scaleX(${rect.width})`;
  }
  function setActive(id) {
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) { activeLink = link; link.setAttribute('aria-current', 'location'); }
      else link.removeAttribute('aria-current');
    });
    placeIndicator();
  }
  links.forEach(link => {
    link.addEventListener('mouseenter', () => placeIndicator(link));
    link.addEventListener('focus', () => placeIndicator(link));
    link.addEventListener('mouseleave', () => placeIndicator());
    link.addEventListener('blur', () => placeIndicator());
  });

  // Active state also works when animation dependencies are unavailable.
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  $$('section[id]').forEach(section => sectionObserver.observe(section));

  async function copyEmail() {
    const email = 'janhri03@gmail.com';
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(email); copied = true; }
    } catch (_) { /* Fall back below. */ }
    if (!copied) {
      const area = document.createElement('textarea');
      area.value = email;
      area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(area);
      const previous = document.activeElement;
      area.select();
      try { copied = document.execCommand('copy'); } catch (_) { /* Show address instead. */ }
      area.remove();
      previous?.focus({ preventScroll: true });
    }
    const toast = $('#toast');
    toast.textContent = copied ? 'EMAIL COPIED' : email;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    const label = $('.contact-label', $('.copy-email'));
    if (label && copied) {
      label.textContent = 'Copied';
      setTimeout(() => { label.textContent = 'Email'; }, 2200);
    }
  }
  $$('.copy-email').forEach(button => button.addEventListener('click', copyEmail));

  // Each composition has its own rhythm. These are abstract project visuals,
  // built from the existing artwork, not representations of a product screen.
  function createProjectMotion(visual, kind) {
    const q = selector => $(selector, visual);
    const qa = selector => $$(selector, visual);
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.1, defaults: { ease: 'power2.inOut' } });
    if (kind === 'gorhim') {
      tl.to(q('.gorhim-brand'), { xPercent: 4, duration: 2.2 }, 0)
        .fromTo(qa('.gorhim-menu span'), { y: 12, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.28 }, 0.15)
        .fromTo(qa('.gorhim-line'), { scaleX: 0.35 }, { scaleX: 1, duration: 1.6, stagger: 0.2 }, 0.2)
        .to(q('.gorhim-circle'), { scale: 1.08, duration: 2 }, 0.3)
        .to(q('.gorhim-brand'), { xPercent: 0, duration: 1.8 }, 2.2)
        .to(q('.gorhim-circle'), { scale: 1, duration: 1.7 }, 2.3);
    } else if (kind === 'ferrari') {
      tl.fromTo(qa('.speed-lines i'), { xPercent: 130, scaleX: 0.2, opacity: 0 }, { xPercent: -170, scaleX: 1, opacity: 0.6, duration: 0.75, stagger: 0.18, ease: 'power3.in' }, 0)
        .to(q('.ferrari-big-type'), { xPercent: -5, duration: 1.1, ease: 'power3.out' }, 0.1)
        .to(qa('.ferrari-crosshair'), { rotation: 180, duration: 1.2, stagger: 0.2 }, 0.3)
        .fromTo(qa('.ferrari-spec span'), { x: 12, opacity: 0.3 }, { x: 0, opacity: 1, duration: 0.25, stagger: 0.1 }, 0.5)
        .to(q('.ferrari-car'), { xPercent: 2, duration: 0.9 }, 0.6)
        .to([q('.ferrari-car'), q('.ferrari-big-type')], { xPercent: 0, duration: 1.2 }, 1.8);
    } else if (kind === 'story') {
      tl.fromTo(q('.story-path-one'), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .fromTo(q('.choice-one'), { opacity: 0.25, x: -8 }, { opacity: 1, x: 0, duration: 0.7 }, 0.65)
        .to(q('.story-center'), { scale: 1.8, duration: 0.4, yoyo: true, repeat: 1 }, 0.7)
        .fromTo(q('.story-path-two'), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 1.4)
        .fromTo(q('.choice-two'), { opacity: 0.25, x: -8 }, { opacity: 1, x: 0, duration: 0.7 }, 2.1)
        .to(q('.story-question'), { xPercent: -2, duration: 1.2, yoyo: true, repeat: 1 }, 0.4);
    } else if (kind === 'ai') {
      tl.fromTo(q('.document-one'), { xPercent: -8, rotation: -12 }, { xPercent: 0, rotation: -8, duration: 1.1 }, 0)
        .fromTo(q('.document-two'), { xPercent: 8, rotation: 12 }, { xPercent: 0, rotation: 7, duration: 1.1 }, 0.2)
        .fromTo(q('.scan-band'), { yPercent: -160, opacity: 0 }, { yPercent: 220, opacity: 0.8, duration: 1.6, ease: 'none' }, 0.4)
        .to(q('.ai-core'), { scale: 1.08, duration: 0.45, repeat: 1, yoyo: true }, 1.5)
        .fromTo(qa('.ai-document div'), { scaleX: 0.3, opacity: 0.2 }, { scaleX: 1, opacity: 1, duration: 0.5, stagger: 0.08 }, 1.7);
    } else if (kind === 'aya') {
      tl.to(q('.phone-back'), { xPercent: -5, rotation: -14, duration: 1.6 }, 0)
        .to(q('.phone-front'), { xPercent: 5, rotation: 10, duration: 1.6 }, 0.15)
        .fromTo(qa('.aya-wave i'), { scaleY: 0.25 }, { scaleY: 1, duration: 0.45, stagger: 0.075, yoyo: true, repeat: 3 }, 0.4)
        .to(q('.dating-orbit'), { rotation: -5, duration: 2.4 }, 0)
        .to(q('.phone-back'), { xPercent: 0, rotation: -11, duration: 1.3 }, 2.2)
        .to(q('.phone-front'), { xPercent: 0, rotation: 7, duration: 1.3 }, 2.2);
    } else if (kind === 'corsa') {
      tl.fromTo(qa('.equalizer span'), { scaleY: 0.2 }, { scaleY: 1, duration: 0.42, stagger: 0.07, yoyo: true, repeat: 5 }, 0)
        .fromTo(q('.corsa-progress div'), { scaleX: 0.12 }, { scaleX: 1, duration: 4, ease: 'none' }, 0)
        .to(q('.corsa-record'), { rotation: 360, duration: 6, ease: 'none' }, 0)
        .to(q('.corsa-interface'), { y: -3, duration: 1.1, yoyo: true, repeat: 1 }, 0.5);
    }
    tl.timeScale(0.7);
    return tl;
  }

  const dialog = $('.project-dialog');
  let selectedProject = null;
  let detailMotion = null;
  let detailTransition = null;
  let detailClosing = false;
  let detailGhost = null;
  const detailArt = $('.detail-art', dialog);
  const closeButton = $('.detail-close', dialog);
  const signalDetail = () => document.dispatchEvent(new Event('project-detail-state'));
  const canAnimateDetail = () => gsap && !reduced.matches;

  function sharedArtwork(from, to, done) {
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ghost = from.cloneNode(true);
    ghost.classList.add('detail-ghost');
    ghost.removeAttribute('id');
    ghost.style.cssText = `position:fixed;left:${b.left}px;top:${b.top}px;width:${b.width}px;height:${b.height}px;min-height:0;aspect-ratio:auto;z-index:10;pointer-events:none;transform-origin:0 0`;
    dialog.append(ghost);
    detailGhost = ghost;
    gsap.set(to, { visibility: 'hidden' });
    return gsap.fromTo(ghost, { x: a.left-b.left, y: a.top-b.top, scaleX: a.width/b.width, scaleY: a.height/b.height }, {
      x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: 'power4.inOut',
      onComplete: () => { ghost.remove(); detailGhost = null; gsap.set(to, { visibility: 'visible' }); done?.(); }
    });
  }

  function finishDetailClose() {
    detailMotion?.kill(); detailMotion = null;
    detailGhost?.remove(); detailGhost = null;
    dialog.close();
    document.body.classList.remove('project-detail-open');
    if (gsap) {
      gsap.set('main, .site-header', { clearProps: 'transform,opacity' });
      gsap.set('.detail-copy > *, .detail-header', { clearProps: 'transform,opacity,clipPath' });
      gsap.set(dialog, { clearProps: 'opacity' });
    }
    selectedProject?.querySelector('.project-open').focus({ preventScroll: true });
    selectedProject = null;
    detailClosing = false;
    signalDetail();
  }

  function closeDetail(immediate = false) {
    if (!dialog.open) return;
    if (detailClosing && !immediate) return;
    detailClosing = true;
    detailTransition?.kill();
    detailGhost?.remove(); detailGhost = null;
    detailMotion?.pause();
    if (immediate || !canAnimateDetail()) { finishDetailClose(); return; }
    gsap.set(detailArt.firstElementChild, { visibility: 'visible' });
    detailTransition = gsap.timeline({ onComplete: finishDetailClose });
    detailTransition.to('.detail-copy > *, .detail-header', { y: 12, opacity: 0, duration: 0.22, stagger: 0.02 }, 0)
      .to('main, .site-header', { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.12);
    const target = $('.project-visual', selectedProject);
    // Reverse the same visual into the grid while the page stays at its scroll position.
    const source = detailArt.firstElementChild;
    const a = source.getBoundingClientRect();
    const page = $('main');
    const pageTransform = page.style.transform;
    page.style.transform = 'none';
    const b = target.getBoundingClientRect();
    page.style.transform = pageTransform;
    const ghost = source.cloneNode(true);
    ghost.classList.add('detail-ghost');
    ghost.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;min-height:0;aspect-ratio:auto;z-index:10;pointer-events:none;transform-origin:0 0`;
    dialog.append(ghost); detailGhost = ghost;
    gsap.set(source, { visibility: 'hidden' });
    detailTransition.to(ghost, { x: b.left-a.left, y: b.top-a.top, scaleX: b.width/a.width, scaleY: b.height/a.height, duration: 0.55, ease: 'power4.inOut' }, 0.1)
      .to(dialog, { opacity: 0, duration: 0.18 }, 0.55);
  }

  function openDetail(project) {
    if (dialog.open) return;
    selectedProject = project;
    $('#detail-title').textContent = project.dataset.projectName;
    const description = $('.project-description', project).textContent.replace(/\s+/g, ' ').trim();
    const contribution = $('.project-contribution', project)?.textContent.replace(/\s+/g, ' ').trim();
    $('#detail-description').textContent = contribution ? description.replace(contribution, '').trim() : description;
    const contributionField = $('.detail-contribution', dialog);
    contributionField.hidden = !contribution;
    contributionField.lastElementChild.textContent = contribution || '';
    $('.detail-category').textContent = $('.project-category', project).textContent.trim();
    $('.detail-technologies > div').textContent = $('.project-technologies', project).textContent.replace(/\s+/g, ' ').trim();
    $('.detail-repository').href = project.dataset.repo;
    const visual = $('.project-visual', project).cloneNode(true);
    visual.removeAttribute('style');
    visual.setAttribute('aria-hidden', 'true');
    $$('.art-depth', visual).forEach(layer => layer.style.transform = 'none');
    detailArt.replaceChildren(visual);
    dialog.dataset.kind = project.dataset.kind;
    document.body.classList.add('project-detail-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    signalDetail();
    if (!canAnimateDetail()) return;
    detailMotion = createProjectMotion(visual, project.dataset.kind);
    detailMotion.timeScale(0.8);
    detailTransition = gsap.timeline();
    detailTransition.to('main, .site-header', { scale: 0.975, opacity: 0.35, duration: 0.65, ease: 'power3.out' }, 0)
      .fromTo('.detail-header', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45 }, 0.25)
      .fromTo('.detail-copy > *', { y: 35, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65, stagger: 0.08, ease: 'power3.out' }, 0.4);
    detailTransition.add(sharedArtwork($('.project-visual', project), visual, () => detailMotion?.play()), 0);
  }
  projects.forEach(project => $('.project-open', project).addEventListener('click', () => openDetail(project)));
  closeButton.addEventListener('click', () => closeDetail());
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDetail(); });
  window.addEventListener('resize', () => { if (dialog.open) closeDetail(true); });
  reduced.addEventListener('change', () => { if (dialog.open) closeDetail(true); });
  document.addEventListener('visibilitychange', () => {
    if (detailMotion && dialog.open) document.hidden ? detailMotion.pause() : detailMotion.play();
  });


  // Native dialog keeps this information usable when the motion library is unavailable.
  const minorDialog = $('#minor-dialog');
  const minorExplore = $('.minor-explore');
  const minorClose = $('.minor-close');
  const minorPreview = $('.minor-preview');
  let minorTransition = null, minorGhost = null, minorClosing = false;
  let minorTransfer = null;
  const minorMotion = () => !!gsap && !reduced.matches;
  function stopMinorTransfer() {
    minorTransfer?.kill(); minorTransfer = null;
    if (gsap) gsap.set('.minor-packet, .minor-transmission span', { clearProps: 'transform,opacity' });
  }
  function transferMinor(connection) {
    if (!minorMotion() || !connection) return;
    stopMinorTransfer();
    const wire = $('.minor-wire', connection), packet = $('.minor-packet', wire);
    const labels = $$('.minor-transmission span', connection);
    minorTransfer = gsap.timeline({ onComplete: () => {
      gsap.set(packet, { clearProps: 'transform,opacity' });
      gsap.set(labels, { clearProps: 'transform,opacity' });
    } });
    minorTransfer.fromTo(packet, { x: 0, opacity: 0 }, { x: () => wire.clientWidth - 6, opacity: 1, duration: 0.85, ease: 'power2.inOut' })
      .to(packet, { opacity: 0, duration: 0.2 }, 0.75);
    if (labels.length) minorTransfer.fromTo(labels, { y: 5, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.18 }, 0.15);
  }
  function finishMinorClose() {
    minorTransition?.kill(); minorTransition = null;
    stopMinorTransfer();
    minorGhost?.remove(); minorGhost = null;
    minorDialog.close(); minorClosing = false;
    document.body.classList.remove('minor-detail-open');
    if (gsap) gsap.set([minorDialog, ...$$('.minor-detail-header, .minor-detail-connection, #minor-detail-title, .minor-detail-copy > section', minorDialog)], { clearProps: 'opacity,transform,clipPath,visibility' });
    minorExplore.focus({ preventScroll: true });
  }
  function morphMinorWire(from, to) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    minorGhost?.remove();
    const ghost = from.cloneNode(true);
    ghost.classList.add('minor-wire-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = 'position:fixed;margin:0;left:'+a.left+'px;top:'+a.top+'px;width:'+a.width+'px;height:'+a.height+'px;z-index:20;pointer-events:none;transform-origin:0 0';
    $('.minor-wire-line', ghost).style.transform = 'none';
    $('.minor-packet', ghost).style.opacity = '0';
    minorDialog.append(ghost); minorGhost = ghost;
    return gsap.to(ghost, { x: b.left-a.left, y: b.top-a.top, scaleX: b.width/a.width, scaleY: b.height/a.height, duration: 0.65, ease: 'power4.inOut', onComplete: () => { ghost.remove(); if (minorGhost === ghost) minorGhost = null; } });
  }
  function closeMinor(immediate = false) {
    if (!minorDialog.open || (minorClosing && !immediate)) return;
    minorClosing = true;
    minorTransition?.kill(); minorGhost?.remove(); minorGhost = null;
    stopMinorTransfer();
    if (immediate || !minorMotion()) { finishMinorClose(); return; }
    minorTransition = gsap.timeline({ onComplete: finishMinorClose })
      .to('.minor-detail-copy > section, #minor-detail-title', { opacity: 0, y: 12, duration: 0.2, stagger: 0.03 }, 0)
      .add(morphMinorWire($('.minor-detail-connection .minor-wire'), $('.minor-preview .minor-wire')), 0.05)
      .to('.minor-detail-connection', { opacity: 0, duration: 0.1 }, 0)
      .to(minorDialog, { opacity: 0, duration: 0.18 }, 0.53);
  }
  minorExplore.addEventListener('click', () => {
    if (minorDialog.open) return;
    stopMinorTransfer();
    document.body.classList.add('minor-detail-open');
    minorDialog.showModal(); minorDialog.scrollTop = 0;
    minorClose.focus({ preventScroll: true });
    if (!minorMotion()) return;
    minorTransition = gsap.timeline();
    minorTransition.fromTo(minorDialog, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
      .add(morphMinorWire($('.minor-preview .minor-wire'), $('.minor-detail-connection .minor-wire')), 0)
      .fromTo('.minor-detail-header', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35 }, 0.2)
      .fromTo('.minor-detail-connection', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.55)
      .fromTo('#minor-detail-title', { yPercent: 105 }, { yPercent: 0, duration: 0.65, ease: 'power4.out' }, 0.35)
      .fromTo('.minor-detail-copy > section', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 }, 0.65)
      .add(() => transferMinor($('.minor-detail-connection')), 0.7);
  });
  minorClose.addEventListener('click', () => closeMinor());
  minorDialog.addEventListener('cancel', e => { e.preventDefault(); closeMinor(); });
  minorDialog.addEventListener('click', e => { if (e.target === minorDialog) closeMinor(); });
  minorExplore.addEventListener('focus', () => transferMinor($('.minor-connection')));
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) minorPreview.addEventListener('pointerenter', () => transferMinor($('.minor-connection')));
  window.addEventListener('resize', () => { if (minorDialog.open) closeMinor(true); stopMinorTransfer(); });
  reduced.addEventListener('change', () => {
    if (minorDialog.open) closeMinor(true);
    stopMinorTransfer();
    if (gsap) gsap.set('.minor-packet, .minor-transmission span', { clearProps: 'transform,opacity' });
  });

  // Preserve original text/elements and semantic headings; masks are structural only.
  function maskHeading(heading) {
    const lines = [];
    [...heading.childNodes].forEach(node => {
      if (!node.textContent.trim()) return;
      const mask = document.createElement('div');
      const line = document.createElement('div');
      mask.className = 'type-mask';
      line.className = 'type-line';
      heading.insertBefore(mask, node);
      line.append(node);
      mask.append(line);
      lines.push(line);
    });
    return lines;
  }

  function staticMode() {
    finishOpening();
    pointerCleanup();
    root.classList.remove('motion-active', 'cursor-enabled');
    $$('.reveal').forEach(element => element.classList.add('show'));
  }
  if (!gsap || !ScrollTrigger) { staticMode(); return; }
  gsap.registerPlugin(ScrollTrigger);

  const hero = $('.hero');
  const title = $('.hero-title');
  const nameLines = $$(':scope > span', title).map(span => {
    span.classList.add('hero-name-mask');
    const line = document.createElement('div');
    line.className = 'hero-name-line';
    line.textContent = span.textContent.trim();
    span.textContent = '';
    span.append(line);
    return line;
  });
  const foreground = title.cloneNode(true);
  foreground.removeAttribute('id');
  foreground.classList.add('hero-foreground');
  foreground.setAttribute('aria-hidden', 'true');
  $('.hero-title-wrap').append(foreground);
  const foregroundLines = $$('.hero-name-line', foreground);
  const accent = document.createElement('div');
  accent.className = 'hero-accent';
  accent.setAttribute('aria-hidden', 'true');
  hero.prepend(accent);

  const headings = new Map();
  $$('.about-copy h2, .projects-intro h2, .project-heading h3, .skills-heading h2, .contact-title').forEach(heading => headings.set(heading, maskHeading(heading)));
  const manifestoLines = $$('.manifesto > p').map(paragraph => {
    const mask = document.createElement('div');
    mask.className = 'manifesto-mask';
    paragraph.before(mask);
    mask.append(paragraph);
    return paragraph;
  });
  // Motion lives on roomy wrappers; lettering itself is never clip-masked.
  const skillLayers = $$('.skill').map(skill => {
    const layer = document.createElement('span');
    layer.className = 'skill-drift';
    skill.before(layer);
    layer.append(skill);
    return layer;
  });
  projects.forEach(project => {
    const visual = $('.project-visual', project);
    visual.setAttribute('aria-hidden', 'true');
    const depth = document.createElement('div');
    depth.className = 'art-depth';
    while (visual.firstChild) depth.append(visual.firstChild);
    visual.append(depth);
    project.dataset.motionProject = project.dataset.kind;
    project.dataset.cursor = 'VIEW PROJECT';
  });
  $$('.hero-scroll, .copy-email').forEach(element => element.dataset.magnetic = 'true');
  const emailButton = $('.copy-email');
  const emailText = [...emailButton.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (emailText) {
    const label = document.createElement('span');
    label.className = 'contact-label';
    emailText.replaceWith(label);
    label.append(emailText);
  }

  // A single event-driven animation frame handles cursor + local artwork depth.
  function setupPointer() {
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    const portrait = $('.hero-portrait');
    let x = 0, y = 0, rx = 0, ry = 0, frame = 0;
    let target = null, bounds = null, heroBounds = null, magnet = null, magnetBounds = null;
    let visible = false;
    const cleanups = [];
    const listen = (element, event, fn) => { element.addEventListener(event, fn); cleanups.push(() => element.removeEventListener(event, fn)); };
    const update = () => {
      frame = 0;
      if (!visible) return;
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      gsap.set(dot, { x, y });
      gsap.set(ring, { x: rx, y: ry });
      if (openingFinished && heroBounds) {
        const nx = (x - heroBounds.left) / heroBounds.width - 0.5;
        const ny = (y - heroBounds.top) / heroBounds.height - 0.5;
        portrait.style.setProperty('--move-x', `${nx * 18}px`);
        portrait.style.setProperty('--move-y', `${ny * 12}px`);
        gsap.set($('.hero-title-wrap'), { x: nx * -7 });
        gsap.set(accent, { x: nx * -12, y: ny * -8 });
      }
      if (target && bounds) {
        const nx = Math.max(-0.5, Math.min(0.5, (x - bounds.left) / bounds.width - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, (y - bounds.top) / bounds.height - 0.5));
        const mechanical = target.dataset.motionProject === 'ferrari';
        gsap.set($('.art-depth', target), { x: nx * (mechanical ? 10 : 5), y: ny * 5 });
        $('.project-visual', target).style.setProperty('--pointer-x', `${(nx + 0.5) * 100}%`);
        $('.project-visual', target).style.setProperty('--pointer-y', `${(ny + 0.5) * 100}%`);
        $('.project-visual', target).style.setProperty('--local-x', `${nx * 18}px`);
        $('.project-visual', target).style.setProperty('--local-y', `${ny * 12}px`);
        target.style.setProperty('--title-shift', `${nx * 7}px`);
      }
      if (magnet && magnetBounds) {
        const mx = x - magnetBounds.left - magnetBounds.width / 2;
        const my = y - magnetBounds.top - magnetBounds.height / 2;
        gsap.set(magnet, { x: Math.max(-8, Math.min(8, mx * 0.12)), y: Math.max(-6, Math.min(6, my * 0.16)) });
      }
      if (Math.abs(rx - x) + Math.abs(ry - y) > 0.1) frame = requestAnimationFrame(update);
    };
    const move = event => {
      x = event.clientX; y = event.clientY;
      if (!visible) { visible = true; rx = x; ry = y; root.classList.add('cursor-enabled'); }
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resetHero = () => {
      heroBounds = null;
      portrait.style.setProperty('--move-x', '0px'); portrait.style.setProperty('--move-y', '0px');
      gsap.to($('.hero-title-wrap'), { x: 0, duration: 0.5, overwrite: true });
      gsap.to(accent, { x: 0, y: 0, duration: 0.5, overwrite: true });
    };
    listen(window, 'pointermove', move);
    listen(hero, 'pointerenter', () => { heroBounds = hero.getBoundingClientRect(); });
    listen(hero, 'pointerleave', resetHero);
    listen(window, 'scroll', () => {
      if (heroBounds) heroBounds = hero.getBoundingClientRect();
      if (target) bounds = $('.project-visual', target).getBoundingClientRect();
      if (magnet) magnetBounds = magnet.getBoundingClientRect();
    });
    const hide = () => { visible = false; root.classList.remove('cursor-enabled'); resetHero(); if (frame) cancelAnimationFrame(frame); frame = 0; };
    listen(document, 'pointerleave', hide);
    listen(window, 'blur', hide);
    listen(document, 'visibilitychange', () => { if (document.hidden) hide(); });
    $$('[data-cursor], a, button').forEach(element => {
      listen(element, 'pointerenter', () => {
        label.textContent = element.dataset.cursor || (element.tagName === 'A' ? 'OPEN' : '');
        ring.classList.add('active');
      });
      listen(element, 'pointerleave', () => { ring.classList.remove('active'); label.textContent = ''; });
    });
    projects.filter(project => project.dataset.motionProject !== 'archive').forEach(project => {
      const visual = $('.project-visual', project);
      listen(project, 'pointerenter', event => {
        target = project; bounds = visual.getBoundingClientRect();
        const fromLeft = event.clientX < bounds.left + bounds.width / 2;
        project.dataset.entry = fromLeft ? 'left' : 'right';
        gsap.killTweensOf($('.art-depth', project));
      });
      listen(project, 'pointerleave', () => {
        target = null; bounds = null; project.style.setProperty('--title-shift', '0px');
        visual.style.setProperty('--local-x', '0px');
        visual.style.setProperty('--local-y', '0px');
        gsap.to($('.art-depth', project), { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: 0.65, ease: 'power3.out', overwrite: true });
      });
    });
    $$('[data-magnetic]').forEach(element => {
      listen(element, 'pointerenter', () => { magnet = element; magnetBounds = element.getBoundingClientRect(); gsap.killTweensOf(element); });
      listen(element, 'pointerleave', () => { magnet = null; magnetBounds = null; gsap.to(element, { x: 0, y: 0, duration: 0.45, ease: 'power3.out', overwrite: true }); });
    });
    return () => {
      hide(); cleanups.forEach(cleanup => cleanup());
      $$('[data-magnetic], .art-depth, .hero-title-wrap, .hero-accent').forEach(element => {
        gsap.killTweensOf(element);
        gsap.set(element, { clearProps: 'transform' });
      });
      projects.forEach(project => {
        project.style.removeProperty('--title-shift');
        const visual = $('.project-visual', project);
        ['--local-x', '--local-y', '--pointer-x', '--pointer-y'].forEach(property => visual.style.removeProperty(property));
      });
      ring.classList.remove('active');
    };
  }

  try {
    media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 1101px) and (min-height: 760px)', mobile: '(max-width: 1100px), (max-height: 759px)', menu: '(max-width: 768px)', gridSingle: '(max-width: 640px)', gridDesktop: '(min-width: 1101px)', reduce: '(prefers-reduced-motion: reduce)', pointer: '(hover: hover) and (pointer: fine) and (min-width: 769px)' }, context => {
      const { desktop, reduce, pointer } = context.conditions;
      menuState(false);
      nav.inert = matchMedia('(max-width: 768px)').matches;
      if (reduce) { staticMode(); return; }
      root.classList.add('motion-active');
      const duration = desktop ? 0.78 : 0.55;
      const ease = 'power3.out';
      // Reset legacy fades: this system owns each reveal's children instead.
      gsap.set('.reveal', { opacity: 1, y: 0 });

      let seen = false;
      try { seen = sessionStorage.getItem('zh-intro-seen') === '1'; } catch (_) { /* Optional. */ }
      const playIntro = !openingFinished && !seen && !location.hash;
      if (!openingFinished && !location.hash) {
        intro.hidden = !playIntro;
        opening = gsap.timeline({ id: 'intro-hero', defaults: { ease }, onComplete: finishOpening });
        gsap.set([...nameLines, ...foregroundLines], { yPercent: 115 });
        gsap.set($('.hero-portrait-frame'), { clipPath: 'polygon(6% 0%, 6% 0%, 0% 96%, 0% 96%)' });
        gsap.set($('.hero-portrait-frame img'), { scale: 1.13 });
        gsap.set(foreground, { opacity: 0.95, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set('.hero-role > *, .hero-meta, .portrait-caption, .hero-bottom > *', { y: 24, opacity: 0 });
        gsap.set(accent, { scaleY: 0, rotation: -12 });
        const start = playIntro ? 0.56 : 0;
        if (playIntro) {
          gsap.set(intro, { display: 'flex', yPercent: 0 });
          opening.fromTo('.intro-title', { yPercent: 110 }, { yPercent: 0, duration: 0.38 }, 0)
            .fromTo('.intro-credit', { yPercent: 120 }, { yPercent: 0, duration: 0.3 }, 0.12)
            .fromTo('.intro-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0.08)
            .to('.intro-title', { yPercent: -115, duration: 0.35, ease: 'power2.in' }, 0.52)
            .to(intro, { yPercent: -101, duration: 0.68, ease: 'power4.inOut' }, 0.54);
        }
        opening.to([nameLines[0], foregroundLines[0]], { yPercent: 0, duration: 0.7 }, start)
          .fromTo([nameLines[1], foregroundLines[1]], { xPercent: 24, yPercent: 115 }, { xPercent: 0, yPercent: 0, duration: 0.8 }, start + 0.12)
          .to($('.hero-portrait-frame'), { clipPath: 'polygon(6% 0%, 100% 4%, 94% 100%, 0% 96%)', duration: 0.82, ease: 'power4.inOut' }, start + 0.2)
          .to($('.hero-portrait-frame img'), { scale: 1.04, duration: 0.9 }, start + 0.2)
          .to(foreground, { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0, duration: 0.55, ease: 'power2.inOut' }, start + 0.65)
          .to(accent, { scaleY: 1, rotation: -5, duration: 0.8 }, start + 0.34)
          .to('.hero-role > *', { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 }, start + 0.74)
          .to('.hero-meta, .portrait-caption', { y: 0, opacity: 1, duration: 0.4, stagger: 0.04 }, start + 0.82)
          .to('.hero-bottom > *', { y: 0, opacity: 1, duration: 0.42, stagger: 0.08 }, start + 0.9);
      } else { finishOpening(); gsap.set(foreground, { opacity: 0 }); }

      // Keep intro bounded even if the user immediately navigates away from the hero.
      const skipOpening = () => { if (opening && !openingFinished) opening.progress(1); };
      links.forEach(link => link.addEventListener('click', skipOpening));

      const revealType = (heading, trigger = heading, options = {}) => {
        const lines = headings.get(heading);
        if (!lines) return;
        return gsap.from(lines, { yPercent: 115, duration, stagger: 0.09, ease, scrollTrigger: { id: options.id || `type-${trigger.closest('section')?.id || 'project'}`, trigger, start: 'top 88%', once: true }, ...options });
      };
      const imageWipe = (element, trigger, id) => gsap.fromTo(element,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: duration + 0.15, ease: 'power4.inOut', scrollTrigger: { id, trigger, start: 'top 86%', once: true } });

      if (desktop) {
        gsap.timeline({ id: 'hero-scroll-depth', scrollTrigger: { id: 'hero-exit', trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } })
          .to(nameLines[0].parentElement, { xPercent: -18, yPercent: -12, ease: 'none' }, 0)
          .to(nameLines[1].parentElement, { xPercent: 14, yPercent: -22, ease: 'none' }, 0)
          .to('.hero-portrait', { y: 75, rotation: 1, ease: 'none' }, 0)
          .to('.hero-role', { y: -35, ease: 'none' }, 0);
      }
      gsap.fromTo('.hero-scroll > span', { y: -3 }, { y: 5, duration: 0.55, repeat: 1, yoyo: true, delay: 2, ease: 'power2.inOut' });
      const marquee = $('.marquee');
      ScrollTrigger.create({ id: 'marquee-visibility', trigger: marquee, start: 'top bottom', end: 'bottom top', onToggle: self => marquee.classList.toggle('motion-running', self.isActive) });

      imageWipe($('.about-photo'), $('.about-photo-wrap'), 'about-photo-wipe');
      revealType($('.about-copy h2'));
      gsap.from('.about-copy .about-eyebrow, .about-lead, .about-small, .about-signature > span', { y: 22, opacity: 0, duration: 0.5, stagger: 0.08, ease, scrollTrigger: { id: 'about-copy', trigger: '.about-copy', start: 'top 75%', once: true } });
      if (desktop) {
        gsap.to('.about-photo img', { yPercent: -6, scale: 1.08, ease: 'none', scrollTrigger: { id: 'about-image-depth', trigger: '.about-layout', start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      }
      gsap.timeline({ id: 'manifesto-beats', scrollTrigger: { id: 'manifesto', trigger: '.manifesto', start: 'top 80%', end: 'bottom 55%', scrub: desktop ? 0.45 : false, once: !desktop } })
        .from(manifestoLines, { yPercent: 120, xPercent: index => index === 1 ? -5 : 3, stagger: 0.22, duration: 0.7, ease });

      // One compact exchange sequence; interactions replay the transfer, not the whole entrance.
      const minorEntrance = gsap.timeline({ id: 'minor-preview', scrollTrigger: {
        id: 'minor-preview', trigger: '.minor-preview', start: 'top 88%', once: true
      }, defaults: { ease: 'power3.out' } });
      minorEntrance.from('.minor-intro h2', { y: 20, clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6 })
        .from('.minor-preview .minor-cities span', { x: i => i ? 12 : -12, opacity: 0, duration: 0.4, stagger: 0.1 }, 0.15)
        .from('.minor-preview .minor-wire-line', { scaleX: 0, duration: 0.65 }, 0.3)
        .from('.minor-preview .minor-node', { scale: 0, duration: 0.25, stagger: 0.12 }, 0.45)
        .add(() => transferMinor($('.minor-connection')), 0.75)
        .from('.minor-status, .minor-explore > span', { y: 8, opacity: 0, duration: 0.35, stagger: 0.06 }, 0.9);
      revealType($('.projects-intro h2'));

      const grid = $('.project-list');
      const projectCleanups = [];
      gsap.fromTo(grid, { '--grid-line': 0 }, { '--grid-line': 1, duration: 0.65, ease: 'power3.inOut', scrollTrigger: { id: 'project-grid-structure', trigger: grid, start: 'top 90%', once: true } });
      const groupSize = innerWidth > 1100 ? 3 : innerWidth > 640 ? 2 : 1;
      let entrance;
      projects.forEach((project, index) => {
        const visual = $('.project-visual', project);
        if (index % groupSize === 0) entrance = gsap.timeline({ id: 'project-grid-group-' + index, scrollTrigger: { id: 'project-grid-group-' + index, trigger: project, start: 'top 87%', once: true } });
        const beat = 0.12 + (index % groupSize) * 0.12;
        entrance.from(visual, { clipPath: 'inset(0% 0% 100% 0%)', y: 25, duration: 0.75, ease: 'power4.inOut' }, beat)
          .from(headings.get($('.project-heading h3', project)), { yPercent: 115, duration: 0.6, stagger: 0.04, ease }, beat + 0.25)
          .from($$('.project-category, .project-grid-meta, .project-open-label', project), { y: 12, opacity: 0, duration: 0.4, stagger: 0.035, ease }, beat + 0.4);
        const motion = createProjectMotion(visual, project.dataset.kind);
        let visible = false;
        const updatePlayback = () => {
          if (visible && !document.hidden && !$('.project-dialog').open) motion.play();
          else motion.pause();
        };
        ScrollTrigger.create({ id: project.dataset.kind + '-ambient', trigger: project, start: 'top bottom', end: 'bottom top', onToggle: self => { visible = self.isActive; updatePlayback(); } });
        const active = () => {
          const energy = { gorhim: 1.1, ferrari: 1.9, story: 1.3, ai: 1.5, aya: 1.15, corsa: 1.6 };
          gsap.to(motion, { timeScale: energy[project.dataset.kind], duration: 0.35 });
          project.classList.add('project-engaged');
        };
        const rest = () => { gsap.to(motion, { timeScale: 0.7, duration: 0.5 }); project.classList.remove('project-engaged'); };
        if (pointer) {
          project.addEventListener('pointerenter', active);
          project.addEventListener('pointerleave', rest);
        }
        project.addEventListener('focusin', active);
        project.addEventListener('focusout', rest);
        document.addEventListener('visibilitychange', updatePlayback);
        document.addEventListener('project-detail-state', updatePlayback);
        projectCleanups.push(() => {
          project.removeEventListener('pointerenter', active); project.removeEventListener('pointerleave', rest);
          project.removeEventListener('focusin', active); project.removeEventListener('focusout', rest);
          document.removeEventListener('visibilitychange', updatePlayback); document.removeEventListener('project-detail-state', updatePlayback);
          gsap.killTweensOf(motion); motion.kill(); project.classList.remove('project-engaged');
        });
      });
      if (desktop) {
        gsap.fromTo('.projects-intro h2', { xPercent: -3 }, { xPercent: 5, ease: 'none', scrollTrigger: { id: 'projects-heading-drift', trigger: '.projects', start: 'top bottom', end: 'top top', scrub: 0.7 } });
        gsap.fromTo('.skills-heading h2', { xPercent: 5 }, { xPercent: -3, ease: 'none', scrollTrigger: { id: 'toolbox-section-transition', trigger: '.skills', start: 'top bottom', end: 'top 20%', scrub: 0.6 } });
      }
      revealType($('.skills-heading h2'));
      gsap.set('.skill', { clearProps: 'clipPath' });
      skillLayers.forEach((layer, index) => {
        gsap.fromTo(layer, {
          x: index % 3 === 0 ? -24 : index % 3 === 1 ? 20 : 0,
          y: index % 2 === 0 ? 65 : -45,
          rotation: index % 2 === 0 ? -4 : 4,
          opacity: 0
        }, {
          x: 0, y: 0, rotation: 0, opacity: 1,
          duration: desktop ? 0.9 + (index % 3) * 0.12 : 0.65,
          delay: (index % 3) * 0.06, ease: 'power4.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { id: 'toolbox-word-' + index, trigger: layer, start: 'top 94%', once: true }
        });
      });
      revealType($('.contact-title'));
      gsap.from('.contact-row > *', { clipPath: 'inset(0% 100% 0% 0%)', x: -18, duration, stagger: 0.1, ease, scrollTrigger: { id: 'contact-links', trigger: '.contact-row', start: 'top 90%', once: true } });
      if (desktop) gsap.fromTo('.contact-background-text', { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { id: 'contact-depth', trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      gsap.from('.site-footer > div', { y: 16, opacity: 0, duration: 0.45, stagger: 0.07, scrollTrigger: { id: 'footer', trigger: '.site-footer', start: 'top bottom', once: true } });
      // Section markers receive a short cut, not the old global fade-up.
      gsap.utils.toArray('.section-marker, .skills-note').forEach((element, index) => gsap.from(element, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.55, ease, scrollTrigger: { id: `editorial-label-${index}`, trigger: element, start: 'top 92%', once: true } }));

      if (matchMedia('(max-width: 768px)').matches) {
        menuTimeline = gsap.timeline({ id: 'mobile-navigation', paused: true })
          .fromTo(nav, { yPercent: -105, visibility: 'hidden' }, { yPercent: 0, visibility: 'visible', duration: 0.55, ease: 'power4.inOut' })
          .fromTo(links, { yPercent: 110, clipPath: 'inset(0% 0% 100% 0%)' }, { yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, stagger: 0.065, ease }, 0.2);
      }
      if (pointer) pointerCleanup = setupPointer();
      placeIndicator(activeLink, true);
      // Refresh in document order so every later section accounts for pin spacing.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        skipOpening();
        projectCleanups.forEach(cleanup => cleanup());
        links.forEach(link => link.removeEventListener('click', skipOpening));
        pointerCleanup(); pointerCleanup = () => {};
        menuTimeline = null;
        root.classList.remove('motion-active', 'cursor-enabled');
        menuState(false);
      };
    });

    // Refresh after fonts/images settle, without blocking the opening timeline.
    const followInitialAnchor = () => {
      if (!location.hash) return;
      const destination = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      destination?.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    document.fonts?.ready.then(() => { ScrollTrigger.refresh(); placeIndicator(activeLink, true); followInitialAnchor(); });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        menuState(false);
        nav.inert = matchMedia('(max-width: 768px)').matches;
        placeIndicator(activeLink, true);
      }, 160);
    });
    window.addEventListener('pagehide', () => { opening?.progress(1); });
    window.addEventListener('pageshow', event => { if (event.persisted) ScrollTrigger.refresh(); });
  } catch (error) {
    console.warn('Motion enhancement unavailable; showing the complete portfolio.', error);
    media?.revert();
    gsap.globalTimeline.getChildren().forEach(animation => animation.revert?.());
    staticMode();
  }
})();
