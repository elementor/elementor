import * as React from 'react';
import { createMockTrackingModule, mockTracking, renderWithQuery } from 'test-utils';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { fireEvent, screen } from '@testing-library/react';

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn( () => ( {
		userCan: jest.fn().mockReturnValue( { update: true } ),
	} ) ),
} ) );

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

import { ClassManagerButton } from '../class-manager-button';

describe( 'ClassManagerButton', () => {
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'should navigate to the panel on click', () => {
		// Act.
		renderWithQuery( <ClassManagerButton /> );
		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'elementor/toggle-design-system',
				detail: { tab: 'classes' },
			} )
		);
	} );

	it( 'should track classManagerOpened event on click', () => {
		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
	} );

	it( 'should not render the button if the user does not have permission to update classes', () => {
		// Arrange.
		jest.mocked( useUserStylesCapability ).mockReturnValue( {
			userCan: jest.fn().mockReturnValue( { update: false } ),
		} );

		// Act.
		const { container } = renderWithQuery( <ClassManagerButton /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
