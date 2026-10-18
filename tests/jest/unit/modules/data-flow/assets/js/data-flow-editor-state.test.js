import { parseStaticState, resolveScopeChain } from 'elementor/modules/data-flow/assets/js/data-flow-editor-state';

const PAGE_STATE = { start: 5, title: 'Page' };

describe( 'parseStaticState', () => {
	it.each( [
		{ raw: '{"count": 1}', expected: { count: 1 } },
		{ raw: { count: 2 }, expected: { count: 2 } },
		{ raw: '[1, 2]', expected: {} },
		{ raw: 'not json', expected: {} },
		{ raw: undefined, expected: {} },
	] )( 'should parse $raw as $expected', ( { raw, expected } ) => {
		// Act
		const state = parseStaticState( raw );

		// Assert
		expect( state ).toEqual( expected );
	} );
} );

describe( 'resolveScopeChain', () => {
	it( 'should let inner container params shadow page state and read bindings from outer scopes', () => {
		// Arrange
		const chain = [
			{ stateParams: [ { key: 'count', type: 'number', default: '{{state.start}}' } ] },
			{ stateParams: [ { key: 'title', type: 'string', default: 'Inner' } ] },
		];

		// Act
		const state = resolveScopeChain( chain, PAGE_STATE );

		// Assert
		expect( state ).toEqual( { start: 5, count: 5, title: 'Inner' } );
	} );

	it( 'should let a binding read an earlier param of the same scope', () => {
		// Arrange
		const chain = [
			{
				stateParams: [
					{ key: 'start', type: 'number', default: 10 },
					{ key: 'count', type: 'number', default: '{{state.start}}' },
				],
			},
		];

		// Act
		const state = resolveScopeChain( chain, PAGE_STATE );

		// Assert
		expect( state ).toMatchObject( { start: 10, count: 10 } );
	} );

	it( 'should apply instance values to component params and skip the component root params', () => {
		// Arrange
		const componentParams = [
			{ key: 'label', type: 'string', default: 'Count' },
			{ key: 'count', type: 'number', default: 0 },
		];
		const chain = [
			{ componentParams, state: { label: 'Likes', unknown: 'ignored' } },
			{ stateParams: componentParams },
		];

		// Act
		const state = resolveScopeChain( chain, PAGE_STATE );

		// Assert
		expect( state ).toEqual( { ...PAGE_STATE, label: 'Likes', count: 0 } );
	} );

	it( 'should ignore params without a key', () => {
		// Arrange
		const chain = [ { stateParams: [ { key: '', type: 'string', default: 'x' } ] } ];

		// Act
		const state = resolveScopeChain( chain, PAGE_STATE );

		// Assert
		expect( state ).toEqual( PAGE_STATE );
	} );
} );
