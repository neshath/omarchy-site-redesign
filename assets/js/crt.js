(() => {
  const screen = document.querySelector('.terminal__screen');
  if (!screen) return;

  const lines = [
    { text: 'omarch@agent:~$', className: 'terminal__prompt' },
    { text: '> plan', className: 'terminal__command' },
    { text: '> build', className: 'terminal__command' },
    { text: '> ship', className: 'terminal__command' },
    { text: '> evolve', className: 'terminal__command' },
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer;
  let lineIndex = 0;
  let charIndex = 0;

  const renderStatic = () => {
    screen.replaceChildren(...lines.map(({ text, className }) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    }));
  };

  if (reducedMotion) {
    renderStatic();
    return;
  }

  const reset = () => {
    window.clearTimeout(timer);
    lineIndex = 0;
    charIndex = 0;
    screen.replaceChildren();
    timer = window.setTimeout(typeNext, 420);
  };

  const typeNext = () => {
    if (lineIndex >= lines.length) {
      timer = window.setTimeout(reset, 2400);
      return;
    }

    const line = lines[lineIndex];
    let element = screen.lastElementChild;
    if (!element || element.dataset.line !== String(lineIndex)) {
      element = document.createElement('span');
      element.className = line.className;
      element.dataset.line = String(lineIndex);
      screen.appendChild(element);
    }

    element.textContent = line.text.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex >= line.text.length) {
      lineIndex += 1;
      charIndex = 0;
      timer = window.setTimeout(typeNext, lineIndex === 1 ? 320 : 180);
    } else {
      timer = window.setTimeout(typeNext, lineIndex === 0 ? 54 : 76);
    }
  };

  reset();
})();
