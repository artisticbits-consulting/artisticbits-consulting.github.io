(() => {
  const list = document.querySelector('[data-service-list]');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.service-item'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = Boolean(window.gsap);

  const setImmediate = (item) => {
    items.forEach((entry) => {
      const active = entry === item;
      const button = entry.querySelector('.service-toggle');
      const panel = entry.querySelector('.service-detail');
      entry.classList.toggle('is-active', active);
      button.setAttribute('aria-expanded', String(active));
      panel.hidden = !active;
      if (active && hasGsap) gsap.set(panel, { clearProps: 'height,opacity,visibility' });
    });
  };

  const activate = (item) => {
    const current = items.find((entry) => entry.classList.contains('is-active'));
    if (current === item) return;

    const animate = hasGsap && !reducedMotion;
    if (current) {
      const oldPanel = current.querySelector('.service-detail');
      const oldButton = current.querySelector('.service-toggle');
      current.classList.remove('is-active');
      oldButton.setAttribute('aria-expanded', 'false');
      if (animate) {
        gsap.killTweensOf(oldPanel);
        gsap.to(oldPanel, {
          height: 0,
          autoAlpha: 0,
          duration: 0.32,
          ease: 'power2.inOut',
          onComplete: () => {
            oldPanel.hidden = true;
            gsap.set(oldPanel, { clearProps: 'height,opacity,visibility' });
          },
        });
      } else {
        oldPanel.hidden = true;
      }
    }

    const button = item.querySelector('.service-toggle');
    const panel = item.querySelector('.service-detail');
    const image = item.querySelector('.service-visual img');
    item.classList.add('is-active');
    button.setAttribute('aria-expanded', 'true');
    panel.hidden = false;

    if (animate) {
      gsap.killTweensOf(panel);
      gsap.fromTo(panel, { height: 0, autoAlpha: 0 }, {
        height: 'auto',
        autoAlpha: 1,
        duration: 0.48,
        ease: 'power2.inOut',
        clearProps: 'height,opacity,visibility',
      });
      if (image) {
        gsap.killTweensOf(image);
        gsap.fromTo(image, { clipPath: 'inset(0 12% 0 12%)', scale: 1.035 }, {
          clipPath: 'inset(0 0% 0 0%)',
          scale: 1,
          duration: 0.58,
          ease: 'power2.out',
        });
      }
    }
  };

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.service-toggle');
    if (!button || !list.contains(button)) return;
    const item = button.closest('.service-item');
    if (item) activate(item);
  });

  if (hasGsap && window.ScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(items, {
      y: 16,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.055,
      ease: 'power2.out',
      scrollTrigger: { trigger: list, start: 'top 82%', once: true },
    });
  }

  const initial = items.find((item) => item.classList.contains('is-active')) || items[0];
  if (initial) setImmediate(initial);
})();
