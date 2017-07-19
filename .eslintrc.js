module.exports = {
  "ecmaFeatures": {
    "globalReturn": true,
    "jsx": false,
    "modules": true,
  },
  "rules": {
    "strict": 1,
    "no-underscore-dangle": 0,
    "no-unused-vars": 1,
    "curly": 0,
    "no-multi-spaces": 1,
    "key-spacing": 0,
    "no-return-assign": 0,
    "consistent-return": 1,
    "no-shadow": 1,
    "comma-dangle": 0,
    "no-use-before-define": 1,
    "no-empty": 1,
    "new-parens": 1,
    "no-cond-assign": 1,
    "quotes": [2, "single", "avoid-escape"],
    "camelcase": 0,
    "new-cap": [1, { "capIsNew": false }],
    "no-undef": 1,
    "semi": [2, "never"]
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "document": false,
    "escape": false,
    "navigator": false,
    "unescape": false,
    "window": false,
    "describe": true,
    "before": true,
    "it": true,
    "expect": true,
    "sinon": true
  },
  "root": true,
  "plugins": []
}
