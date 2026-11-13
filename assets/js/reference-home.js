(() => {
  const nav = document.querySelector('.section-nav');
  const links = [...document.querySelectorAll('.section-nav a[data-section]')];
  const wire = document.querySelector('.nav-wire');
  const baseWire = document.querySelector('.wire-base');
  const activeWire = document.querySelector('.wire-active');
  const bead = document.querySelector('.nav-rule b');
  const toggle = document.querySelector('.menu-toggle');
  const panels = [...document.querySelectorAll('[data-page-section]')];
  const contentFrame = document.querySelector('.content-frame');
  const sharedAside = document.querySelector('.shared-aside');
  const sidebarLayers = sharedAside ? [...sharedAside.querySelectorAll('.sidebar-content')] : [];
  let currentPanelId = '';
  let wireX = 0;

  const drawWire = x => {
    if (!wire || !baseWire || !activeWire) return;
    const width = nav.clientWidth;
    const center = Math.max(25, Math.min(width - 25, x));
    wire.setAttribute('viewBox', `0 0 ${width} 16`);
    wire.setAttribute('preserveAspectRatio', 'none');
    const curve = `M 0 1 H ${center - 20} C ${center - 10} 1 ${center - 12} 12 ${center} 12 C ${center + 12} 12 ${center + 10} 1 ${center + 20} 1 H ${width}`;
    baseWire.setAttribute('d', curve);
    activeWire.setAttribute('d', `M 0 1 H ${center - 20} C ${center - 10} 1 ${center - 12} 12 ${center} 12`);
  };

  const placeWire = x => {
    wireX = x;
    drawWire(wireX);
    if (bead) bead.style.left = `${wireX - 15}px`;
  };

  const updateWireFromScroll = () => {
    if (!nav || !links.length || !panels.length) return;
    const markerY = window.scrollY + window.innerHeight * 0.36;
    const panelTops = panels.map(panel => panel.getBoundingClientRect().top + window.scrollY);
    let index = panels.findIndex((panel, i) => markerY < (panelTops[i + 1] ?? Infinity));
    if (index < 0) index = panels.length - 1;
    const currentLink = links.find(link => link.dataset.section === panels[index].id);
    const nextLink = links[index + 1];
    const navLeft = nav.getBoundingClientRect().left;
    const centerOf = link => {
      const rect = link.getBoundingClientRect();
      return rect.left + rect.width / 2 - navLeft;
    };
    const from = centerOf(currentLink || links[0]);
    if (!nextLink || markerY <= panelTops[index]) {
      placeWire(from);
      return;
    }
    const span = Math.max(1, panelTops[index + 1] - panelTops[index]);
    const progress = Math.max(0, Math.min(1, (markerY - panelTops[index]) / span));
    const to = centerOf(nextLink);
    placeWire(from + (to - from) * progress);
  };

  const setActive = id => {
    const activeIndex = Math.max(0, links.findIndex(link => link.dataset.section === id));
    links.forEach((link, index) => link.classList.toggle('active', index === activeIndex));
  };

  const updateSidebar = panel => {
    if (!sharedAside) return;
    if (!panel) {
      sharedAside.classList.remove('is-visible');
      return;
    }
    sharedAside.classList.add('is-visible');
    if (panel.id === currentPanelId) return;
    const template = panel.querySelector('.section-aside');
    if (!template || sidebarLayers.length < 2) return;
    const previous = sidebarLayers.find(layer => layer.classList.contains('active'));
    const next = sidebarLayers.find(layer => layer !== previous);
    next.innerHTML = template.innerHTML;
    next.setAttribute('aria-hidden', 'false');
    if (previous) previous.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(() => {
      next.classList.add('active');
      if (previous) previous.classList.remove('active');
    });
    currentPanelId = panel.id;
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('open', !isOpen);
    });
    links.forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const updateActivePanel = () => {
    updateWireFromScroll();
    if (contentFrame && window.scrollY > (panels[0]?.offsetTop || 0) && contentFrame.getBoundingClientRect().bottom <= window.innerHeight) {
      updateSidebar(null);
      return;
    }
    const marker = window.innerHeight * 0.82;
    const activePanel = panels.find(panel => {
      const bounds = panel.getBoundingClientRect();
      return bounds.top <= marker && bounds.bottom > marker;
    });
    if (activePanel) {
      updateSidebar(activePanel);
      setActive(activePanel.id);
    } else if (window.scrollY < (panels[0]?.offsetTop || 0)) {
      updateSidebar(null);
      setActive('work');
    }
  };
  let scheduled = false;
  const schedulePanelUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      updateActivePanel();
      scheduled = false;
    });
  };
  window.addEventListener('scroll', schedulePanelUpdate, { passive: true });
  window.addEventListener('resize', schedulePanelUpdate);
  updateActivePanel();

  const form = document.querySelector('.contact-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Project enquiry from ${data.get('name')}`);
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nBudget: ${data.get('budget') || 'Not specified'}\n\nProject:\n${data.get('project') || ''}`);
    window.location.href = `mailto:hello@artisticbits.com?subject=${subject}&body=${body}`;
  });
})();
