import { stringPropTypeUtil } from '@elementor/editor-props';

import { isKeyVisible } from '../query-filter-repeater-control';

describe( 'QueryFilterRepeaterControl - isKeyVisible', () => {
	it( 'returns true when no rule is provided', () => {
		expect( isKeyVisible( undefined, { source: stringPropTypeUtil.create( 'post' ) } ) ).toBe( true );
	} );

	it( 'returns false when rule exists but settings are null', () => {
		expect( isKeyVisible( { path: [ 'source' ], in: [ 'post' ] }, null ) ).toBe( false );
	} );

	it( 'returns true when sibling setting matches one of the allowed values', () => {
		const settings = { source: stringPropTypeUtil.create( 'related' ) };

		expect( isKeyVisible( { path: [ 'source' ], in: [ 'related' ] }, settings ) ).toBe( true );
	} );

	it( 'returns false when sibling setting does not match any allowed value', () => {
		const settings = { source: stringPropTypeUtil.create( 'page' ) };

		expect( isKeyVisible( { path: [ 'source' ], in: [ 'post', 'related' ] }, settings ) ).toBe( false );
	} );

	it( 'returns false when the path segment is missing from settings', () => {
		expect( isKeyVisible( { path: [ 'missing' ], in: [ 'post' ] }, { source: null } ) ).toBe( false );
	} );
} );
