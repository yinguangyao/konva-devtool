# konva-devtool
A development and debugging tool for [Konva](https://github.com/konvajs/konva).

## usage
You can load the devtools directory as an unpacked extension.

1. First, you need to clone the project.

```js
git clone git@github.com:yinguangyao/konva-devtool.git
```

2. At the top right, click More Tools.
3. On the right, click Extensions.
4. On the left, click load unpacked.
5. Select the devtools directory of the konva-devtool project


You need to push the layer instance into the global variable `__canvas_instances__`, then devtool will read `layer.children`, traverse and generate a tree.

![install](./assets/install.gif)

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
Then, you can open inspect, select konva dev tool, and you can see the following effect.

![screen](./assets/usage.gif)