(() => {
  const main = document.querySelector('[data-process-main]');
  if (!main || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const phases = Array.from(main.querySelectorAll('[data-process-phase]'));
  const line = main.querySelector('.timeline-line');
  const fill = main.querySelector('.timeline-progress');
  const markers = line ? Array.from(line.querySelectorAll('i')) : [];
  if (!phases.length || !line || !fill) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = -1;

  const update = (progress) => {
    const bounded = Math.max(0, Math.min(1, progress));
    gsap.set(fill, { scaleY: bounded });
    line.setAttribute('aria-valuenow', String(Math.round(bounded * 100)));

    const first = phases[0].getBoundingClientRect();
    const last = phases[phases.length - 1].getBoundingClientRect();
    const markerY = window.innerHeight * 0.52;
    const firstCenter = first.top + first.height / 2;
    const lastCenter = last.top + last.height / 2;
    const span = firstCenter - lastCenter;
    const phaseProgress = span ? Math.max(0, Math.min(1, (firstCenter - markerY) / span)) : 0;
    const index = Math.min(phases.length - 1, Math.round(phaseProgress * (phases.length - 1)));

    if (index !== current) {
      current = index;
      phases.forEach((phase, phaseIndex) => phase.classList.toggle('is-current', phaseIndex === current));
      markers.forEach((dot, dotIndex) => dot.classList.toggle('is-current', dotIndex === current));
    }
  };

  const progressTrigger = ScrollTrigger.create({
    trigger: main,
    start: 'top center',
    end: 'bottom center',
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
    onLeave: () => update(1),
    onLeaveBack: () => update(0),
  });

  if (!reducedMotion) {
    gsap.from(phases, {
      y: 18,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.09,
      ease: 'power2.out',
      scrollTrigger: { trigger: main, start: 'top 82%', once: true },
    });
  }

  update(progressTrigger.progress);
})();
