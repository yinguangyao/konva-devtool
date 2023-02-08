// forward the message sent by inspectWindow
window.addEventListener('showShape', function (e) {
  chrome.runtime.sendMessage({
    type: 'showShape',
    detail: e.detail
  });
});

window.addEventListener('closeHover', function (e) {
  chrome.runtime.sendMessage({
    type: 'closeHover',
    detail: e.detail
  });
});
