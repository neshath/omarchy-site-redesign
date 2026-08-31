(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const screen = document.querySelector('.terminal__screen');
  const terminalLines = [
    { text: 'omarch@agent:~$', className: 'terminal__prompt' },
    { text: '> plan', className: 'terminal__command' },
    { text: '> build', className: 'terminal__command' },
    { text: '> ship', className: 'terminal__command' },
    { text: '> evolve', className: 'terminal__command' },
  ];

  const renderStaticTerminal = () => {
    if (!screen) return;
    screen.replaceChildren(...terminalLines.map(({ text, className }) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    }));
  };

  const runTerminal = () => {
    if (!screen) return;
    let timer;
    let lineIndex = 0;
    let charIndex = 0;

    const reset = () => {
      window.clearTimeout(timer);
      lineIndex = 0;
      charIndex = 0;
      screen.replaceChildren();
      timer = window.setTimeout(typeNext, 420);
    };

    const typeNext = () => {
      if (lineIndex >= terminalLines.length) {
        timer = window.setTimeout(reset, 2400);
        return;
      }

      const line = terminalLines[lineIndex];
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
  };

  const shouldSkip = (node) => {
    const element = node.parentElement;
    if (!element) return true;
    if (element.closest('.terminal, .pixel-effects, script, style, noscript, svg, [aria-hidden="true"], [data-crt-ignore]')) return true;
    return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'PRE'].includes(element.tagName);
  };

  const wrapVisibleText = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!shouldSkip(node) && node.nodeValue.trim()) textNodes.push(node);
    }

    const characters = [];
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      [...textNode.nodeValue].forEach((character) => {
        if (/\s/.test(character)) {
          fragment.appendChild(document.createTextNode(character));
          return;
        }
        const span = document.createElement('span');
        span.className = 'crt-char';
        span.textContent = character;
        fragment.appendChild(span);
        characters.push(span);
      });
      textNode.replaceWith(fragment);
    });
    return characters;
  };

  const runPageLoop = () => {
    if (reducedMotion) return;
    const characters = wrapVisibleText();
    if (!characters.length) return;

    document.body.classList.add('crt-page');
    const typeDelay = 2;
    const eraseDelay = 1;
    const holdDelay = 4200;
    const blankDelay = 800;

    const erase = () => {
      characters.forEach((character) => character.classList.remove('is-typed'));
      window.setTimeout(type, blankDelay);
    };

    const type = (index = 0) => {
      if (index >= characters.length) {
        window.setTimeout(erase, holdDelay);
        return;
      }
      characters[index].classList.add('is-typed');
      window.setTimeout(() => type(index + 1), typeDelay);
    };

    characters.forEach((character) => character.classList.remove('is-typed'));
    type();
  };

  if (reducedMotion) {
    renderStaticTerminal();
  } else {
    runTerminal();
    window.setTimeout(runPageLoop, 120);
  }
})();
