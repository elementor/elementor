import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useCssClassUsageByID } from '../../../hooks/use-css-class-usage-by-id';
import { CssClassUsageTrigger } from '../components';

jest.mock( '../../../hooks/use-css-class-usage-by-id' );

describe( 'CssClassUsageTrigger', () => {
	it( 'renders locator icon and does not open on click when total is 0', async () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: { total: 0, content: [] },
		} );

		// Act.
		render( <CssClassUsageTrigger id="css-id" onClick={ jest.fn() } /> );

		fireEvent.mouseOver( screen.getByRole( 'button' ) );
		expect( await screen.findByText( 'This class isn’t being used yet.' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'css-class-usage-popover' ) ).not.toBeInTheDocument();
	} );

	it( 'opens popover when total > 0 and icon is clicked', async () => {
		// Arrange.
		jest.mocked( useCssClassUsageByID ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 2,
				content: [
					{ pageId: 'page1', total: 1, elements: [ 'el-1' ], title: 'Title1', type: 'wp-page' },
					{ pageId: 'page2', total: 1, elements: [ 'el-2' ], title: 'Title2', type: 'wp-page' },
				],
			},
		} );

		// Act.
		render( <CssClassUsageTrigger id="css-id" onClick={ jest.fn() } /> );

		const iconButton = screen.getByRole( 'button' );
		expect( iconButton ).toBeInTheDocument();

		fireEvent.click( iconButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'presentation' ) ).toBeInTheDocument();
		} );
	} );
} );
