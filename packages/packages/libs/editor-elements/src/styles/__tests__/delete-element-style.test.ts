import { createMockElement, createMockStyleDefinition } from 'test-utils';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../../sync/get-container';
import { updateElementSettings } from '../../sync/update-element-settings';
import { ELEMENT_STYLE_CHANGE_EVENT } from '../consts';
import { deleteElementStyle } from '../delete-element-style';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../sync/get-container' );
jest.mock( '../../sync/update-element-settings' );

describe( 'deleteElementStyle', () => {
	it( 'should delete an element style and notify the changes', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( {
			id: 'style-1',
			props: { testProp: 'testValue' },
		} );

		const style2 = createMockStyleDefinition( {
			id: 'style-2',
			props: { testProp: 'testValue' },
		} );

		const element = createMockElement( {
			model: {
				id: 'test-element-id',
				styles: {
					[ style1.id ]: style1,
					[ style2.id ]: style2,
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ style1.id, style2.id ],
				},
			},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );

		const listener = jest.fn();

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, listener );

		// Act.
		deleteElementStyle( 'test-element-id', style2.id );

		// Assert.
		expect( element.model.get( 'styles' ) ).toStrictEqual( {
			[ style1.id ]: style1,
		} );

		expect( updateElementSettings ).toHaveBeenNthCalledWith( 1, {
			id: 'test-element-id',
			props: {
				classes: {
					$$type: 'classes',
					value: [ style1.id ],
				},
			},
			withHistory: false,
		} );

		expect( listener ).toHaveBeenCalledTimes( 1 );

		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );
} );
