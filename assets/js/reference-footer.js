(() => {
  const footer = document.querySelector('[data-site-footer]');
  if (!footer) return;

  const year = new Date().getFullYear();
  const yearElement = footer.querySelector('[data-current-year]');
  if (yearElement) {
    yearElement.textContent = String(year);
    yearElement.dateTime = String(year);
  }

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const context = gsap.context(() => {
      const entrance = { trigger: footer, start: 'top 78%', once: true };
      gsap.from(footer.querySelectorAll('.footer-title-line > span'), {
        yPercent: 108,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: entrance,
      });
      gsap.from([footer.querySelector('.footer-subcopy'), footer.querySelector('.footer-cta')], {
        y: 18,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: entrance,
      });
      gsap.from([footer.querySelector('.footer-contact'), ...footer.querySelectorAll('.footer-nav a')], {
        y: 14,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.055,
        ease: 'power2.out',
        scrollTrigger: entrance,
      });
      gsap.from(footer.querySelector('.footer-bottom'), {
        autoAlpha: 0,
        duration: 0.45,
        scrollTrigger: entrance,
      });
    }, footer);

    return () => context.revert();
  });

  window.addEventListener('pagehide', () => media.revert(), { once: true });
})();
