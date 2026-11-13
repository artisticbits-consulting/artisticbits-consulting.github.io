(() => {
  const stack = document.querySelector('[data-project-stack]');
  if (!stack || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const cards = Array.from(stack.querySelectorAll('[data-project-card]'));
  const stage = stack.querySelector('.project-stack-stage');
  if (cards.length < 2 || !stage) return;

  const media = gsap.matchMedia();
  media.add('(min-width: 651px) and (prefers-reduced-motion: no-preference)', () => {
    stack.classList.add('is-enhanced');
    cards.forEach((card, index) => {
      card.style.zIndex = String(index + 1);
      card.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      card.inert = index !== 0;
      card.classList.toggle('is-project-current', index === 0);
    });

    gsap.set(cards, { yPercent: 112, scale: 1, transformOrigin: '50% 0%' });
    gsap.set(cards[0], { yPercent: 0 });
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: stack,
        pin: stage,
        pinSpacing: true,
        start: () => `top top+=${Math.max(70, document.querySelector('.site-header')?.offsetHeight || 70)}`,
        end: () => `+=${(cards.length - 1) * Math.max(window.innerHeight * 0.78, 520)}`,
        scrub: 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    cards.slice(1).forEach((card, offset) => {
      const index = offset + 1;
      const point = offset;
      timeline.to(cards.slice(0, index), {
        yPercent: (_, targetIndex) => -2.2 * (index - targetIndex),
        scale: (_, targetIndex) => 1 - 0.018 * (index - targetIndex),
        duration: 1,
        ease: 'none',
      }, point);
      timeline.to(card, { yPercent: 0, scale: 1, duration: 1, ease: 'none' }, point);
    });

    const updateCurrentCard = () => {
      const activeIndex = Math.min(cards.length - 1, Math.floor(timeline.progress() * (cards.length - 1) + 0.001));
      cards.forEach((card, index) => {
        const active = index === activeIndex;
        card.classList.toggle('is-project-current', active);
        card.setAttribute('aria-hidden', active ? 'false' : 'true');
        card.inert = !active;
      });
    };
    timeline.eventCallback('onUpdate', updateCurrentCard);
    updateCurrentCard();

    return () => {
      stack.classList.remove('is-enhanced');
      cards.forEach((card) => {
        card.removeAttribute('aria-hidden');
        card.inert = false;
        card.classList.remove('is-project-current');
        card.style.removeProperty('z-index');
        card.style.removeProperty('transform');
      });
    };
  });
})();
