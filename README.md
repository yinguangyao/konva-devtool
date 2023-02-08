# konva-devtool
A development and debugging tool for konva.

## usage
You can load the devtools directory as an unpacked extension.

You need to push the layer instance into the global variable `__canvas_instances__`, then devtool will read `layer.children`, traverse and generate a tree.


```js
const layer = new Konva.Layer();

if (!Array.isArray(window.__canvas_instances__)) {
  window.__canvas_instances__ = [];
}

window.__canvas_instances__.push(layer);

const originDestroy = Layer.prototype.destroy;
layer.destroy = function () {
  originDestroy.call(this);
  const index = window.__canvas_instances__.findIndex((instance) => instance === this);
  if (index > -1) {
    window.__canvas_instances__.splice(index, 1);
  }
  return this;
};
```
