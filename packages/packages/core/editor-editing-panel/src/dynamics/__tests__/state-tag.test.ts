import { getElementStateScopes } from '@elementor/editor-elements';

import { createStateTagValue, getStateTagGroups, toStatePlaceholder } from '../state-tag';

jest.mock( '@elementor/editor-elements' );

const SCOPE_ID = 'scope-1';
const EXPOSED = { control: 'text', label: '' } as const;

describe( 'state tag', () => {
	it( 'should build a placeholder from plain and transformable settings', () => {
		// Arrange
		const settings = { key: { $$type: 'string', value: 'count' }, prefix: 'Total: ', suffix: '!' };

		// Act
		const placeholder = toStatePlaceholder( settings );

		// Assert
		expect( placeholder ).toBe( 'Total: {{state.count}}!' );
	} );

	it( 'should target the owning scope in the placeholder', () => {
		// Arrange
		const settings = { key: { $$type: 'string', value: 'image' }, scope: { $$type: 'string', value: SCOPE_ID } };

		// Act
		const placeholder = toStatePlaceholder( settings, '.url' );

		// Assert
		expect( placeholder ).toBe( `{{state@${ SCOPE_ID }.image.url}}` );
	} );

	it( 'should group compatible states by their owning element', () => {
		// Arrange
		jest.mocked( getElementStateScopes ).mockReturnValue( [
			{
				elementId: SCOPE_ID,
				label: 'Card',
				params: [
					{ key: 'title', label: 'Title', type: 'string', default: '', exposed: EXPOSED },
					{ key: 'count', label: 'Count', type: 'number', default: 0, exposed: EXPOSED },
				],
			},
			{
				elementId: 'scope-2',
				label: 'Counter',
				params: [ { key: 'total', label: 'Total', type: 'number', default: 0, exposed: EXPOSED } ],
			},
		] );

		// Act
		const groups = getStateTagGroups( 'el', [ 'text' ] );

		// Assert
		expect( groups ).toEqual( [
			{
				id: `element-state::${ SCOPE_ID }`,
				label: 'Card',
				options: [
					{
						label: 'Title',
						value: `element-state::${ SCOPE_ID }::title`,
						group: 'element-state',
						key: 'title',
						scope: SCOPE_ID,
						tagName: 'e-state',
					},
				],
			},
		] );
	} );

	it( 'should create a dynamic value that stores the key and its scope', () => {
		// Arrange
		const option = {
			label: 'Count',
			value: `element-state::${ SCOPE_ID }::count`,
			group: 'element-state',
			key: 'count',
			scope: SCOPE_ID,
			tagName: 'e-state',
		} as const;

		// Act
		const value = createStateTagValue( option );

		// Assert
		expect( value ).toEqual( {
			name: 'e-state',
			group: 'element-state',
			settings: {
				key: { $$type: 'string', value: 'count' },
				scope: { $$type: 'string', value: SCOPE_ID },
				label: 'Count',
			},
		} );
	} );
} );
