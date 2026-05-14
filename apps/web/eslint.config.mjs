import tseslint from "typescript-eslint";

// Minimal flat config. Next 16 dropped `next lint`; eslint-config-next's
// legacy extends-bridge produces circular JSON with eslint 9, so we run
// typescript-eslint's recommended set directly. Build + typecheck already
// cover the heavier static-analysis lifting.
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "out/**",
      "build/**",
      "**/*.d.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-debugger": "error",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
