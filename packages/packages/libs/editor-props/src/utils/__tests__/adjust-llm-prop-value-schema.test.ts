import { adjustLlmPropValueSchema } from '../adjust-llm-prop-value-schema';

describe( 'adjustLlmPropValueSchema', () => {
	it( 'normalizes escaped-html values to a plain string', () => {
		// Arrange.
		const value = {
			$$type: 'escaped-html',
			value: '<strong>Hello</strong>',
		};

		// Act.
		const result = adjustLlmPropValueSchema( value );

		// Assert.
		expect( result ).toEqual( {
			$$type: 'escaped-html',
			value: '<strong>Hello</strong>',
		} );
	} );

	it( 'converts html-v3 content to escaped-html when forceKey is escaped-html', () => {
		// Arrange.
		const value = {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: '<em>Title</em>' },
				children: [ { id: 'child-1' } ],
			},
		};

		// Act.
		const result = adjustLlmPropValueSchema( value, { forceKey: 'escaped-html' } );

		// Assert.
		expect( result ).toEqual( {
			$$type: 'escaped-html',
			value: '<em>Title</em>',
		} );
	} );

	it( 'converts legacy html-v3-shaped values when forceKey is escaped-html', () => {
		// Arrange.
		const value = {
			$$type: 'escaped-html',
			value: {
				content: { $$type: 'string', value: 'Legacy title' },
				children: [],
			},
		};

		// Act.
		const result = adjustLlmPropValueSchema( value, { forceKey: 'escaped-html' } );

		// Assert.
		expect( result ).toEqual( {
			$$type: 'escaped-html',
			value: 'Legacy title',
		} );
	} );
} );
