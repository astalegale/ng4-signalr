module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
	],
	rules: {
		'no-underscore-dangle': 'off',
		'no-console': 'off',
		'no-shadow': 'off',
		'import/prefer-default-export': 'off',
		'import/no-extraneous-dependencies': 'off',
		'import/extensions': 'off',
		'no-param-reassign': 'off',
		'no-plusplus': 'off',
		'no-use-before-define': 'off',
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: [
					'.js',
					'.jsx',
					'.ts',
					'.tsx',
				],
			},
		},
	},
};
