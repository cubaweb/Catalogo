document.addEventListener('submit', function (event) {
  var message = event.target.dataset && event.target.dataset.confirm;
  if (message && !window.confirm(message)) {
    event.preventDefault();
  }
});

document.addEventListener('click', function (event) {
  var button = event.target.closest('[data-back]');
  if (button) {
    window.history.length > 1 ? window.history.back() : (window.location.href = '/');
  }
});

document.addEventListener(
  'error',
  function (event) {
    var element = event.target;
    if (element.tagName === 'IMG' && element.closest('.poster')) {
      element.remove();
    }
  },
  true
);
