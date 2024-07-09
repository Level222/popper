import antfu from '@antfu/eslint-config';

export default antfu({
  lessOpinionated: true,
  stylistic: {
    semi: true,
  },
  rules: {
    'curly': ['error', 'all'],
    'style/arrow-parens': ['error', 'always'],
    'style/brace-style': ['error', '1tbs'],
    'style/quote-props': ['error', 'consistent'],
    'ts/consistent-type-definitions': 'off',
    'ts/no-redeclare': 'off',
    'no-undef': 'off',
  },
});
