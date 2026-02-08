(() => {
  const setLinks = Array.from(document.querySelectorAll('.set-nav a'));
  const sets = Array.from(document.querySelectorAll('.set'));
  const search = document.getElementById('search');
  const toggleQ1 = document.getElementById('toggleQ1');
  const expandCurrent = document.getElementById('expandCurrent');

  let currentSetEl = sets[0];

  function setActiveLink(setId){
    setLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + setId));
  }

  function openAllInSet(setEl){
    const details = Array.from(setEl.querySelectorAll('details'));
    details.forEach(d => d.open = true);
  }

  function closeAllExcept(setEl){
    sets.forEach(s => {
      if (s !== setEl){
        const details = Array.from(s.querySelectorAll('details'));
        details.forEach(d => d.open = false);
      }
    });
  }

  // Sidebar click: smooth scroll + open current set
  setLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      currentSetEl = target;
      setActiveLink(targetId);

      // Make it fast during exam: collapse other sets, open this one
      closeAllExcept(target);
      openAllInSet(target);

      // Focus main content for keyboard users
      const content = document.getElementById('content');
      content && content.focus({ preventScroll: true });
    });
  });

  // Toggle Q1 visibility
  toggleQ1.addEventListener('click', () => {
    const hidden = document.body.classList.toggle('q1-hidden');
    document.body.classList.toggle('q1-visible', !hidden);
    toggleQ1.setAttribute('aria-pressed', String(!hidden));
  });

  // Expand all in current set
  expandCurrent.addEventListener('click', () => {
    if (!currentSetEl) currentSetEl = sets[0];
    openAllInSet(currentSetEl);
  });

  // Copy buttons
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('button.copy');
    if (!btn) return;
    const sel = btn.getAttribute('data-copy');
    const el = document.querySelector(sel);
    if (!el) return;

    const text = el.innerText;
    try{
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = 'Kopieret!';
      setTimeout(() => btn.textContent = old, 900);
    }catch{
      // fallback: select text
      const range = document.createRange();
      range.selectNodeContents(el);
      const selObj = window.getSelection();
      selObj.removeAllRanges();
      selObj.addRange(range);
      btn.textContent = 'Markeret';
      setTimeout(() => btn.textContent = 'Kopiér', 900);
    }
  });

  // Search filter (sidebar + content)
  function applySearch(q){
    const query = q.trim().toLowerCase();
    const hasQuery = query.length > 0;

    sets.forEach(setEl => {
      const text = setEl.innerText.toLowerCase();
      const match = !hasQuery || text.includes(query);
      setEl.style.display = match ? '' : 'none';
    });

    setLinks.forEach(a => {
      const targetId = a.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      const visible = target && target.style.display !== 'none';
      a.parentElement.style.display = visible ? '' : 'none';
    });
  }

  search.addEventListener('input', () => applySearch(search.value));

  // Scroll spy: highlight current set
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length === 0) return;
    const top = visible[0].target;
    currentSetEl = top;
    setActiveLink(top.id);
  }, { threshold: [0.2, 0.35, 0.5] });

  sets.forEach(s => observer.observe(s));

  // Initial state: open set 1 only
  closeAllExcept(sets[0]);
  openAllInSet(sets[0]);
  setActiveLink('set-1');
})();