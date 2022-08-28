module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs', 'only-warn', 'jest'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:sonarjs/recommended',
        'plugin:security/recommended',
        'prettier'
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: 2019
      },
      rules: {
        'sonarjs/prefer-immediate-return': 'off',
        'jest/no-mocks-import': 'off',
        'import/export': 'off'
      }
    }
  ]
};
