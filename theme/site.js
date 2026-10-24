// Wide tables, code blocks and diagrams scroll inside their own box. When one overflows,
// make it keyboard-scrollable and add a short hint so the hidden part isn't missed.
(function () {
  var selector = '.table-scroll, .diagram, .prose pre';
  var labels = { 'table-scroll': 'Table', diagram: 'Diagram' };

  function update() {
    document.querySelectorAll(selector).forEach(function (el) {
      var over = el.scrollWidth > el.clientWidth + 1;
      var next = el.nextElementSibling;
      var hint = next && next.classList.contains('scroll-hint') ? next : null;
      el.classList.toggle('is-overflowing', over);
      if (over) {
        el.tabIndex = 0;
        el.setAttribute('role', 'region');
        el.setAttribute('aria-label', labels[el.classList[0]] || 'Code');
        if (!hint) {
          hint = document.createElement('p');
          hint.className = 'scroll-hint';
          hint.setAttribute('aria-hidden', 'true');
          hint.textContent = 'Scroll sideways to see more →';
          el.after(hint);
        }
      } else {
        el.removeAttribute('tabindex');
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
        if (hint) hint.remove();
      }
    });
  }

  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  });
  document.addEventListener('diagrams:rendered', update);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update);
  else update();
  if (document.fonts) document.fonts.ready.then(update);
})();
