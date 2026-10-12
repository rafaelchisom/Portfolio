// Project filters and the footer year. The page works fully without this file.
(function () {
  var chips = document.querySelectorAll('.chip');
  var projects = document.querySelectorAll('.project');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      projects.forEach(function (p) {
        p.hidden = filter !== 'all' && p.dataset.tags.split(' ').indexOf(filter) === -1;
      });
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
