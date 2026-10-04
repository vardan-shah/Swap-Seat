import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'error',
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'scripts/', '*.js', '*.mjs'],
  }
);
