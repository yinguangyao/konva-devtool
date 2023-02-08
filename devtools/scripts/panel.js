// execute the script in inspectWindow
const executeScriptInInspectWindow = (script) => {
  return new Promise(function (resolve, reject) {
    chrome.devtools.inspectedWindow.eval(script, (result, exception) => {
      if (exception) {
        reject(exception);
      } else {
        resolve(result);
      }
    });
  });
};

// execute the function in inspectWindow
const executeFuntionInInspectWindow = (func, args) => {
  return executeScriptInInspectWindow(
    `(${func.toString()}).apply(window, ${JSON.stringify(args)})`
  );
};

function getGlobalInstances () {
  const instances = window.__canvas_instances__;
  const map = {};
  const getCanvasRootGroup = (canvas) => {
    if (canvas.getRoot) {
      return canvas.getRoot().getChildren();
    } else if (canvas.getChildren) {
      return canvas.getChildren();
    }

    return [];
  };

  window.__canvas_instances__.globalMap = map;

  let konvaInfo = [];
  function getKonvaInstance (instance, hash) {
    const ga = {};
    if (instance.getChildren && instance.getChildren()) {
      // 过滤掉 visible false 的 shape
      ga.children = instance.getChildren().filter(child => child.visible()).map(function (p) {
        return getKonvaInstance(p, hash);
      });
    }
    // 创建一个 hash 值，和 shape 关联起来
    if (!instance.__dev_hash) {
      ga.hash = Math.random().toString(16).slice(-8);
      instance.__dev_hash = ga.hash;
    } else {
      ga.hash = instance.__dev_hash;
    }
    instance.ancestor = hash;
    map[ga.hash] = instance;
    ga.id = instance._id || instance.get('_id');
    // 目前 konva 里面只有 type，没有 name
    ga.name = ga.type = instance.className || instance.nodeType || 'group';
    ga.attrs = instance.getAttrs() || instance.attrs;
    return ga;
  }

  if (instances && instances.length) {
    konvaInfo = instances.map(function (instance) {
      const hash = instance.hash || Math.random().toString(16).slice(-8);
      const ga = {
        type: 'renderer',
        name: 'renderer',
        nodeType: 'renderer',
        hash,
        children: getCanvasRootGroup(instance).map((e) => getKonvaInstance(e, hash)),
        memory: window.performance.memory.usedJSHeapSize,
        fps: window.__fps_value
      };
      instance.hash = ga.hash;
      map[ga.hash] = instance;
      return ga;
    });
  } else {
    konvaInfo.length = 0;
  }

  return konvaInfo;
}

// check if the canvas is alive
function checkCanvasByHash (hash) {
  const isExist = !!window.__canvas_instances__.map((e) => e.hash).includes(hash);
  return isExist;
}

// create div based on id
function createBoxUsingId (bbox, id, color) {
  const el = document.createElement('div');
  el.classList.add('konva_devtool_rect');

  const canvasRoot = window.__canvas_root__ || document.querySelector('.konvajs-content');
  if (!canvasRoot) {
    return;
  }
  const wrapBoundClient = canvasRoot.getBoundingClientRect();
  window[id] = el;

  document.body.appendChild(el);
  Object.assign(el.style, {
    position: 'absolute',
    width: `${bbox.width}px`,
    height: `${bbox.height}px`,
    top: `${bbox.y + wrapBoundClient.y}px`,
    left: `${bbox.x + wrapBoundClient.x}px`,
    background: color || 'rgba(135, 59, 244, 0.5)',
    border: '2px dashed rgb(135, 59, 244)',
    boxSizing: 'border-box',
    zIndex: '10000'
  });
}

function removeBoxUsingId (id) {
  if (window[id]) {
    window[id].remove();
  }
}

function removeAllBox () {
  const elements = document.getElementsByClassName('konva_devtool_rect');
  [].forEach.apply(elements, [
    function (e) {
      e.remove();
    }
  ]);
}

function getElemetBBoxByHash (hash) {
  let targetEl = window.__canvas_instances__.globalMap[hash];

  if (!targetEl) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }

  const rect = {
    x: targetEl.x(),
    y: targetEl.y(),
    width: targetEl.width(),
    height: targetEl.height()
  };

  while (targetEl.parent) {
    rect.x += targetEl.parent.x() || 0;
    rect.y += targetEl.parent.y() || 0;
    targetEl = targetEl.parent;
  }

  return rect;
}

function getElementAttrByHash (hash) {
  return window.__canvas_instances__.globalMap[hash].getAttrs();
}

function setElementAttrByHash (hash, name, value) {
  return window.__canvas_instances__.globalMap[hash].setAttr(name, value);
}

function setKElementByHash (hash) {
  window.$gElemet = hash ? window.__canvas_instances__.globalMap[hash] : undefined;
}

function consoleElementByHash (hash, desc) {
  window.console.log(
    desc || '<Click To Expand>',
    window.__canvas_instances__.globalMap[hash]
  );
}

function setRect (bbox, id, color) {
  executeFuntionInInspectWindow(removeAllBox).finally(() => {
    executeFuntionInInspectWindow(createBoxUsingId, [bbox, id, color]);
  });
}

function cleanRect () {
  executeFuntionInInspectWindow(removeAllBox);
}

function showRect (hash, id, color) {
  executeFuntionInInspectWindow(getElemetBBoxByHash, [hash]).then((bbox) => {
    setRect(bbox, id, color);
  });
}

function cleanAllRect () {
  executeFuntionInInspectWindow(removeAllBox);
}

function getAttrs (hash) {
  if (hash) {
    executeFuntionInInspectWindow(setKElementByHash, [hash]);
    return executeFuntionInInspectWindow(getElementAttrByHash, [hash]);
  }
  return executeFuntionInInspectWindow(setKElementByHash, []);
}

function updateAttrs (hash, name, attrs) {
  return executeFuntionInInspectWindow(setElementAttrByHash, [
    hash,
    name,
    attrs
  ]);
}

function consoleEl (hash, desc) {
  return executeFuntionInInspectWindow(consoleElementByHash, [hash, desc]);
}

function checkCanvasAlive (hash) {
  return executeFuntionInInspectWindow(checkCanvasByHash, [hash]).then(
    (res) => {
      if (res) {
        return true;
      } else {
        mountDevTool();
        return false;
      }
    }
  );
}

function getNowCanvasData () {
  return executeFuntionInInspectWindow(getGlobalInstances);
}

function openMainPageListening () {
  window.lastInstance = null;

  window.hoverRectHandler = function (event) {
    const canvasRoot = window.__canvas_root__ || document.querySelector('.konvajs-content');
    if (!canvasRoot) {
      return;
    }

    const canvasClient = canvasRoot.getBoundingClientRect();
    const x = event.clientX - canvasClient.x;
    const y = event.clientY - canvasClient.y;
    const matchShapes = [];

    const isMatch = (instance) => {
      const rect = window.getElemetBBoxByHash(instance.__dev_hash);

      if (rect.x <= x && (rect.x + rect.width) >= x &&
        rect.y <= y && (rect.y + rect.height) >= y &&
        instance.nodeType === 'Shape'
      ) {
        matchShapes.push(instance);
      }
      if (instance && instance.getChildren && instance.getChildren().length > 0) {
        instance.getChildren().forEach(isMatch);
      }
    };

    Object.keys(window.__canvas_instances__.globalMap).forEach(hash => {
      const instance = window.__canvas_instances__.globalMap[hash];
      isMatch(instance);
    });

    const sortMatchShapes = matchShapes.sort((i1, i2) => (i1.width() + i1.height()) - (i2.width() + i2.height()));
    const instance = sortMatchShapes[0];

    if (!instance) {
      return;
    }

    if (window.lastInstance !== instance) {
      window.removeBoxUsingId('__hover__');

      if (window.clickHandler) {
        window.removeEventListener('click', window.clickHandler);
      }

      const rect = {
        x: instance.x(),
        y: instance.y(),
        width: instance.width(),
        height: instance.height()
      };

      let targetInstance = instance;

      while (targetInstance.parent) {
        rect.x += targetInstance.parent.x() || 0;
        rect.y += targetInstance.parent.y() || 0;
        targetInstance = targetInstance.parent;
      }

      window.createBoxUsingId(rect, '__hover__');

      window.clickHandler = function () {
        const customEvent = new CustomEvent('showShape', {
          detail: {
            hash: instance.ancestor,
            key: instance.__dev_hash
          }
        });
        window.dispatchEvent(customEvent);
      };

      window.addEventListener('click', window.clickHandler);
      window.lastInstance = targetInstance;
    }
  };
  window.addEventListener('mousemove', hoverRectHandler);
}

function closeMainPageListening () {
  if (window.__hover__) {
    window.__hover__.remove();
  }
  window.removeEventListener('mousemove', window.hoverRectHandler);
}

function onSwitchPageListening (checked) {
  if (checked) {
    executeFuntionInInspectWindow(openMainPageListening);
  } else {
    executeFuntionInInspectWindow(closeMainPageListening);
  }
}

function injectGlobalScript () {
  const injectScript = (createBoxUsingId, removeBoxUsingId, getElemetBBoxByHash) => {
    window.createBoxUsingId = new Function(`return ${createBoxUsingId}`)();
    window.removeBoxUsingId = new Function(`return ${removeBoxUsingId}`)();
    window.getElemetBBoxByHash = new Function(`return ${getElemetBBoxByHash}`)();
  };

  executeFuntionInInspectWindow(injectScript, [
    createBoxUsingId.toString(),
    removeBoxUsingId.toString(),
    getElemetBBoxByHash.toString()
  ]);
}

injectGlobalScript();

function mountDevTool () {
  getNowCanvasData().then(function (data) {
    const container = document.getElementById('container');
    window.mount(data, container, {
      showRect,
      getAttrs,
      cleanRect,
      updateAttrs,
      consoleEl,
      checkCanvasAlive,
      getNowCanvasData,
      cleanAllRect,
      onSwitchPageListening
    });
  });
}

mountDevTool();
