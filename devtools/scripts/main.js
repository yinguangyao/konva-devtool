let panelInstance;
let interval = null;

chrome.devtools.network.onNavigated.addListener(function () {
});

createPanelInstance();

interval = setInterval(createPanelInstance, 1000);

function createPanelInstance () {
  if (panelInstance) {
    return;
  }
  // 初始化开发者工具实例
  chrome.devtools.inspectedWindow.eval(
    '!!(window.__canvas_instances__ && window.__canvas_instances__.length)',
    function (gConnected, err) {
      if (!gConnected) {
        return;
      }

      clearInterval(interval);

      panelInstance = chrome.devtools.panels.create(
        'Konva DevTool',
        'icons/32.png',
        'panel.html',
        function (panel) {
          panel.onHidden.addListener(function () {
            chrome.devtools.inspectedWindow.eval(`(function() {
            var elements = document.getElementsByClassName('k_devtool_rect');
            [].forEach.apply(elements, [function (e) {
              e.remove();
            }]);
            if (window['__hover__']) {
              window['__hover__'].remove();
            }
            // var customEvent = new CustomEvent('closeHover', {});
            // window.dispatchEvent(customEvent);
          })()`);
          });
        }
      );

      chrome.runtime.sendMessage({
        isKonva: true,
        disabled: false
      });
    }
  );
}
