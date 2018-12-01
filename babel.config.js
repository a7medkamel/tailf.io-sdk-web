const presets = [
  "@babel/preset-react",
  "@babel/env"
  // [
  //   "@babel/env",
  //   {
  //     targets: {
  //       edge: "17",
  //       firefox: "60",
  //       chrome: "67",
  //       safari: "11.1",
  //     },
  //     useBuiltIns: "usage",
  //   },
  // ],
];

/*  https://github.com/webpack/webpack/issues/1754 */
const plugins = [
  "@babel/plugin-proposal-class-properties",
  "css-modules-transform"
]

module.exports = { presets, plugins };