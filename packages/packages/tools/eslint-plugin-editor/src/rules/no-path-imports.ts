import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

type Options = [];

type MessageIds = 'noElementorPathImport' | 'noWordpressPathImport';

export const noPathImports = ESLintUtils.RuleCreator.withoutDocs< Options, MessageIds >( {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow deep path imports from `@elementor` and `@wordpress` packages.',
		},
		messages: {
			noElementorPathImport:
				"Path import of Elementor dependencies is not allowed. Use the package root (e.g. '@elementor/locations' instead of '{{value}}').",
			noWordpressPathImport:
				"Path import of WordPress dependencies is not allowed. Use the package root (e.g. '@wordpress/components' instead of '{{value}}').",
		},
		schema: [],
	},

	defaultOptions: [],

	create( context ) {
		return {
			ImportDeclaration( node: TSESTree.ImportDeclaration ) {
				const value = node.source.value;

				if ( /^@elementor\/.+\/.+/.test( value ) ) {
					context.report( {
						node,
						messageId: 'noElementorPathImport',
						data: { value },
					} );
				} else if ( /^@wordpress\/.+\/.+/.test( value ) ) {
					context.report( {
						node,
						messageId: 'noWordpressPathImport',
						data: { value },
					} );
				}
			},
		};
	},
} );
