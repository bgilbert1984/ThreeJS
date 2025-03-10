module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/jsx-runtime",
        "plugin:storybook/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
      "react/prop-types": "off", // Disable prop-types rule
      "@typescript-eslint/no-explicit-any": "warn", //allow any but show warning
      "@typescript-eslint/no-unused-vars": "warn"
    },
  "settings": {  // Add this settings block
    "react": {
      "version": "detect"
    }
  }

}