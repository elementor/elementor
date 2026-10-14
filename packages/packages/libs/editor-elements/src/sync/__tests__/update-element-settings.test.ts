import { updateElementSettings } from '@elementor/editor-elements';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

describe( 'updateElementSettings', () => {
	it( 'should update element settings with history', () => {
		// Arrange.
		const element = { id: 'test-element-id' };
		const props = { testProp: 'test-value' };

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === element.id ? ( element as never ) : null;
		} );

		// Act.
		updateElementSettings( {
			id: element.id,
			props,
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith( 'document/elements/settings', {
			container: element,
			settings: props,
		} );
	} );

	it( 'should update element settings without history', () => {
		// Arrange.
		const element = { id: 'test-element-id' };
		const props = { testProp: 'test-value' };

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === element.id ? ( element as never ) : null;
		} );

		// Act.
		updateElementSettings( {
			id: element.id,
			props,
			withHistory: false,
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container: element,
				settings: props,
			},
			{ internal: true }
		);
	} );
} );
