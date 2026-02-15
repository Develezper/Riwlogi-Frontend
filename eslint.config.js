export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        DOMParser: "readonly",
        NodeFilter: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        location: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-debugger": "error",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
      "eqeqeq": ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
