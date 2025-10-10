import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { CollapsibleContent } from '../collapsible-content';

jest.mock( '@elementor/editor-v1-adapters' );

describe( '<CollapsibleContent />', () => {
	it( 'should be closed by default', () => {
		// Act.
		renderWithTheme(
			<CollapsibleContent>
				<div>Content</div>
			</CollapsibleContent>
		);

		// Assert.
		expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();
	} );

	it( 'should be open when defaultOpen is true', () => {
		// Act.
		renderWithTheme(
			<CollapsibleContent defaultOpen>
				<div>Content</div>
			</CollapsibleContent>
		);

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeVisible();
	} );

	it( 'should toggle the content and change the button text on click', async () => {
		// Act.
		renderWithTheme(
			<CollapsibleContent>
				<div>Content</div>
			</CollapsibleContent>
		);

		fireEvent.click( screen.getByText( 'Show more' ) );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeVisible();

		// Act.
		fireEvent.click( screen.getByText( 'Show less' ) );

		// Assert.
		await waitFor( () => {
			expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'should allow passing a component to the end of the title', () => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockReturnValue( true );

		const EndComponent = () => <span>End</span>;

		// Act.
		renderWithTheme(
			<CollapsibleContent titleEnd={ <EndComponent /> }>
				<div>Content</div>
			</CollapsibleContent>
		);

		// Assert.
		expect( screen.getByText( 'Show more' ) ).toBeInTheDocument();
		expect( screen.getByText( 'End' ) ).toBeInTheDocument();
	} );

	it( 'should allow passing a function to return open-state dependant values for titleEnd', () => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockReturnValue( true );

		// Act.
		renderWithTheme(
			<CollapsibleContent titleEnd={ ( isOpen ) => ( isOpen ? 'Opened' : 'Closed' ) }>
				<div>Content</div>
			</CollapsibleContent>
		);

		// Assert.
		expect( screen.getByText( 'Closed' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Show more' ) );

		expect( screen.getByText( 'Opened' ) ).toBeInTheDocument();
	} );
} );
