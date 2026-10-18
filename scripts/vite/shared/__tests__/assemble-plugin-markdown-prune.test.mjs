import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	MARKDOWN_PRUNE_PATTERNS,
	matchesOrderedPatterns,
} from '../../assemble-plugin.mjs';

describe( 'matchesOrderedPatterns (MARKDOWN_PRUNE_PATTERNS)', () => {
	it( 'keeps MCP static-resources markdown', () => {
		assert.equal(
			matchesOrderedPatterns(
				'modules/mcp/static-resources/abilities/foo.md',
				MARKDOWN_PRUNE_PATTERNS,
			),
			false,
		);
	} );

	it( 'prunes markdown outside MCP static-resources', () => {
		assert.equal(
			matchesOrderedPatterns( 'modules/other/foo.md', MARKDOWN_PRUNE_PATTERNS ),
			true,
		);
	} );

	it( 'prunes root README.md', () => {
		assert.equal(
			matchesOrderedPatterns( 'README.md', MARKDOWN_PRUNE_PATTERNS ),
			true,
		);
	} );

	it( 'prunes MCP markdown outside static-resources', () => {
		assert.equal(
			matchesOrderedPatterns( 'modules/mcp/notes.md', MARKDOWN_PRUNE_PATTERNS ),
			true,
		);
	} );
} );
