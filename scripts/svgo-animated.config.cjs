// SVGO config for animated SVGs produced by mp4-to-svg.py.
//
// removeHiddenElems must be disabled — all frame <g> elements start with
// opacity:0 and SVGO's static analysis would treat them as invisible dead
// nodes, stripping the entire animation down to ~1k.

module.exports = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeHiddenElems: false,
        },
      },
    },
  ],
};
