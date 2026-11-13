(() => {
  const canvas = document.querySelector('.hero-wave-canvas');
  if (!canvas) return;

  const HeroWaveAnimation = target => {
    const context = target.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) return () => {};

    const host = target.closest('.hero-wave');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 650px)');
    const rootStyle = getComputedStyle(document.documentElement);
    const readHex = (value, fallback) => {
      const color = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1] || fallback;
      const full = color.length === 3 ? color.split('').map(char => char + char).join('') : color;
      return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16));
    };
    const lime = readHex(rootStyle.getPropertyValue('--lime'), 'b9ff43');
    const limeDeep = readHex(rootStyle.getPropertyValue('--lime-deep'), '8bc52e');
    const rgba = (color, alpha) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    const tuning = {
      desktopLines: 22,
      mobileLines: 13,
      desktopDpr: 2,
      mobileDpr: 1.5,
      desktopSampleSpacing: 3.8,
      mobileSampleSpacing: 5,
      baseSpeed: .27,
      speedVariation: .19,
      baseAmplitude: .014,
      amplitudeVariation: .025,
      glowBlur: 5,
      crispBlur: 2
    };

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lines = [];
    let frameId = 0;
    let active = true;
    let destroyed = false;
    const startedAt = performance.now();

    const makeLines = () => {
      const count = mobile.matches ? tuning.mobileLines : tuning.desktopLines;
      lines = Array.from({ length: count }, (_, index) => {
        const normalized = index / (count - 1);
        const seed = Math.sin((index + 1) * 78.233) * 43758.5453;
        const random = seed - Math.floor(seed);
        return {
          normalized,
          phase: index * 2.399963,
          frequency: .82 + random * .44,
          speed: .35 + random * .65,
          amplitude: .72 + random * .56,
          opacity: .32 + random * .3,
          soft: index % 5 === 0
        };
      });
    };

    const resize = () => {
      const bounds = target.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile.matches ? tuning.mobileDpr : tuning.desktopDpr);
      target.width = Math.round(width * pixelRatio);
      target.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      makeLines();
      render(performance.now());
    };

    const render = now => {
      if (!width || !height) return;
      const elapsed = (now - startedAt) / 1000;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      const sampleSpacing = mobile.matches ? tuning.mobileSampleSpacing : tuning.desktopSampleSpacing;
      const samples = Math.min(360, Math.ceil(width / sampleSpacing));

      lines.forEach((line, index) => {
        const startY = height * .5 + (line.normalized - .5) * 12;
        const endY = height * (.055 + line.normalized * .89);
        const phase = line.phase - elapsed * (tuning.baseSpeed + line.speed * tuning.speedVariation);
        const amplitude = height * (tuning.baseAmplitude + line.amplitude * tuning.amplitudeVariation);
        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, rgba(limeDeep, .25));
        gradient.addColorStop(.3, rgba(lime, .55));
        gradient.addColorStop(.68, rgba(limeDeep, .8));
        gradient.addColorStop(1, rgba(lime, .34));

        context.beginPath();
        for (let sample = 0; sample <= samples; sample += 1) {
          const xRatio = sample / samples;
          const x = xRatio * width;
          const spread = xRatio * xRatio * (3 - 2 * xRatio);
          const baseY = startY + (endY - startY) * spread;
          const envelope = Math.pow(Math.sin(Math.PI * xRatio), .45);
          const wavePhase = xRatio * (3.1 + line.frequency * 2.7) + phase;
          const wave = Math.sin(wavePhase)
            + .27 * Math.sin(xRatio * 12.4 - elapsed * (tuning.baseSpeed + .04) + line.phase * .73)
            + .11 * Math.sin(xRatio * 21.7 - elapsed * (tuning.baseSpeed - .08) + line.phase * 1.31);
          const y = baseY + wave * amplitude * envelope;
          if (sample === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.globalAlpha = line.opacity;
        context.strokeStyle = gradient;
        context.lineWidth = line.soft ? 1.35 : .85;
        context.shadowColor = rgba(lime, .62);
        context.shadowBlur = line.soft ? tuning.glowBlur : (index % 4 === 1 ? tuning.crispBlur : 0);
        context.stroke();
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const stop = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const tick = now => {
      frameId = 0;
      if (destroyed || !active || document.hidden) return;
      render(now);
      if (!reducedMotion.matches) frameId = requestAnimationFrame(tick);
    };
    const resume = () => {
      stop();
      if (!active || document.hidden || destroyed) return;
      if (reducedMotion.matches) render(performance.now());
      else frameId = requestAnimationFrame(tick);
    };
    const onResize = () => {
      const previousMobile = mobile.matches;
      resize();
      if (previousMobile !== mobile.matches) makeLines();
      resume();
    };
    const onMotionChange = () => resume();
    const onVisibilityChange = () => resume();

    let resizeObserver;
    let intersectionObserver;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(target);
    }
    if ('IntersectionObserver' in window && host) {
      intersectionObserver = new IntersectionObserver(entries => {
        active = entries.some(entry => entry.isIntersecting);
        resume();
      }, { rootMargin: '80px' });
      intersectionObserver.observe(host);
    }
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener?.('change', onMotionChange);
    mobile.addEventListener?.('change', onResize);

    resize();
    resume();

    return () => {
      destroyed = true;
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener?.('change', onMotionChange);
      mobile.removeEventListener?.('change', onResize);
    };
  };

  const dispose = HeroWaveAnimation(canvas);
  window.addEventListener('pagehide', dispose, { once: true });
})();
