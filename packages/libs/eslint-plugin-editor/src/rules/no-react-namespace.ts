import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

type Options = [];

type MessageIds = 'noReactNamespace';

type ReactHookNode = TSESTree.CallExpression & {
	callee: {
		property: TSESTree.Identifier;
	};
};

export const noReactNamespace = ESLintUtils.RuleCreator.withoutDocs< Options, MessageIds >( {
	meta: {
		type: 'layout',
		docs: {
			description: 'Disallow using `React.useHook`.',
		},
		messages: {
			noReactNamespace: 'Do not use `React.{{hookName}}`. Import the hook directly.',
		},
		schema: [],
	},

	defaultOptions: [],

	create( context ) {
		return {
			'CallExpression[callee.object.name="React"][callee.property.name=/use[A-Z]/]'( node: ReactHookNode ) {
				context.report( {
					node,
					messageId: 'noReactNamespace',
					data: {
						hookName: node.callee.property.name,
					},
				} );
			},
		};
	},
} );
