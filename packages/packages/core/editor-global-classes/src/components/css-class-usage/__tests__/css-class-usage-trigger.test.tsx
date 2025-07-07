import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { fireEvent, render, screen } from '@testing-library/react';

import { CssClassUsageTrigger } from '../components';
import * as usageHook from '../hooks';

jest.mock( '../hooks' );
jest.mock( '../components/css-class-usage-popover', () => ( {
	CssClassUsagePopover: () => <div data-testid="popover" />,
} ) );

const createWrapper = ( children: React.ReactNode ) => {
	const queryClient = new QueryClient();
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
};

describe( 'CssClassUsageTrigger', () => {
	it( 'shows loader when loading', () => {
		jest.spyOn( usageHook, 'useCssClassUsageByID' ).mockReturnValue( {
			isLoading: true,
			data: { total: 0, content: [] },
		} );

		render( createWrapper( <CssClassUsageTrigger id="css-id" /> ) );

		expect( screen.getByLabelText( /loading/i ) ).toBeInTheDocument(); // assumes Loader2Icon has testId (add one if needed)
	} );

	it( 'renders locator icon and does not open on click when total is 0', () => {
		jest.spyOn( usageHook, 'useCssClassUsageByID' ).mockReturnValue( {
			isLoading: false,
			data: { total: 0, content: [] },
		} );

		render( createWrapper( <CssClassUsageTrigger id="css-id" /> ) );

		const iconButton = screen.getByRole( 'button' );
		fireEvent.click( iconButton );

		expect( screen.queryByLabelText( 'css-class-usage-popover' ) ).not.toBeInTheDocument();
	} );

	it( 'opens popover when total > 0 and icon is clicked', () => {
		jest.spyOn( usageHook, 'useCssClassUsageByID' ).mockReturnValue( {
			isLoading: false,
			data: {
				total: 2,
				content: [
					{ pageId: 'page1', total: 1, elements: [ 'el-1' ], title: 'Title1' },
					{ pageId: 'page2', total: 1, elements: [ 'el-2' ], title: 'Title2' },
				],
			},
		} );

		render( createWrapper( <CssClassUsageTrigger id="css-id" /> ) );

		const iconButton = screen.getByRole( 'button', { name: /locator \(2\)/i } );
		expect( iconButton ).toBeInTheDocument();

		fireEvent.click( iconButton );

		// Verify the popover is now rendered using data-testid
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'popover' ) ).toBeInTheDocument();

		// Alternative way using id
		// expect(document.getElementById('css-class-usage-popover')).toBeInTheDocument();
	} );
} );
