import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'scripts/', '*.js', '*.mjs'],
  }
);
