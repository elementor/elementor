import { RuleTester } from '@typescript-eslint/rule-tester';

import { noReactNamespace } from '../no-react-namespace';

const ruleTester = new RuleTester( {
	languageOptions: {
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
} );

ruleTester.run( 'no-react-namespace', noReactNamespace, {
	valid: [
		'const Component = () => { const [state, setState] = useState(); };',

		'const Component = () => { const value = Namespace.useHook(); };',

		'const MemoComponent = React.memo(Component)',
	],

	invalid: [
		{
			code: 'const Component = () => { const [state, setState] = React.useState(); };',
			errors: [
				{
					messageId: 'noReactNamespace',
					data: {
						hookName: 'useState',
					},
					line: 1,
					column: 53,
					endColumn: 69,
				},
			],
		},
	],
} );
