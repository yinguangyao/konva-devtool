export const buildTreeData = (data = {}, isRoot) => {
  const node = {
    title: data.type,
    type: data.type === 'group' ? 'group' : 'shape',
    key: data.hash,
    name: data.name,
    id: data.id,
    hash: data.hash,
    count: data.count,
    num: data.children?.length || 0,
    attrs: data.attrs
  };

  if (data.children) {
    node.children = data.children.map((e) => buildTreeData(e));
  }

  if (isRoot) {
    node.type = 'renderer';
    node.title = 'Layer';
    return node;
  }

  return node;
};

export const countTree = (tree) => {
  if (!tree) {
    return 0;
  }
  const count = tree?.children?.reduce((a, b) => a + countTree(b), 1) || 1;
  tree.count = count;
  return count;
};
