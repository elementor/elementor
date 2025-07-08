import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CssClassUsageTrigger } from '../components';
import { useCssClassUsageByID } from '../hooks';

jest.mock( '../hooks' );

describe( 'CssClassUsageTrigger', () => {
	it( 'renders locator icon and does not open on click when total is 0', () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: { total: 0, content: [] },
		} );

		// Act.
		render( <CssClassUsageTrigger id="css-id" /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( screen.queryByLabelText( 'css-class-usage-popover' ) ).not.toBeInTheDocument();
	} );

	it( 'opens popover when total > 0 and icon is clicked', async () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 2,
				content: [
					{ pageId: 'page1', total: 1, elements: [ 'el-1' ], title: 'Title1' },
					{ pageId: 'page2', total: 1, elements: [ 'el-2' ], title: 'Title2' },
				],
			},
		} );

		// Act.
		render( <CssClassUsageTrigger id="css-id" /> );

		const iconButton = screen.getByRole( 'button', { name: /locator \(2\)/i } );
		expect( iconButton ).toBeInTheDocument();

		fireEvent.click( iconButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'presentation' ) ).toBeInTheDocument();
		} );
	} );
} );
