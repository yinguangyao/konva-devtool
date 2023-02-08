// 使用 .js 格式，便于添加注释说明
module.exports = {
  // 不使用缩进符，而使用空格
  useTabs: false,
  tabWidth: 2,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 公司 esLint 规范要求是 120, 对齐
  printWidth: 120,
  // 行尾需要有分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 末尾需要有逗号
  trailingComma: 'es5',
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
};
