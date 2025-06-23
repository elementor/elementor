import * as fs from 'node:fs';
import * as path from 'node:path';

import { commitlintPluginEditor } from '@elementor/commitlint-plugin-editor';
import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

export default {
	extends: [ '@commitlint/config-conventional' ],
	plugins: [ commitlintPluginEditor ],
	rules: {
		'editor/require-jira-ticket': [ RuleConfigSeverity.Error, 'always', { prefix: 'ED' } ],

		'editor/require-scope': [
			RuleConfigSeverity.Error,
			'always',
			{
				scopes: getScopes(),
				allowEmpty: true,
				types: [ 'feat', 'fix' ],
			},
		],
	},
} satisfies UserConfig;

function getScopes() {
	const dirs = [
		path.resolve( './packages/core' ),
		path.resolve( './packages/pro' ),
		path.resolve( './packages/libs' ),
		path.resolve( './packages/tools' ),
		path.resolve( './apps' ),
	];

	const scopes = new Set< string >();

	dirs.forEach( ( dir ) => {
		fs.readdirSync( dir ).forEach( ( scope ) => {
			if ( scope.startsWith( '.' ) ) {
				return;
			}

			scopes.add( scope );
		} );
	} );

	return [ ...scopes ];
}
