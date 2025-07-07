import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CssClassUsageTrigger } from '../components/css-class-usage-trigger';
import * as usageHook from '../hooks/use-css-class-usage-by-id';

jest.mock( '../hooks/use-css-class-usage-by-id' );

const mockUseCssClassUsageByID = usageHook.useCssClassUsageByID as jest.Mock;

const wrapper = ( { children }: { children: React.ReactNode } ) => (
	<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
);

describe( 'CssClassUsageTrigger', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders icon button when total > 0', () => {
		mockUseCssClassUsageByID.mockReturnValue( {
			isLoading: false,
			data: { total: 2 },
		} );

		render( <CssClassUsageTrigger id="css-id" />, { wrapper } );

		expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( /Locator \(2\)/ ) ).toBeInTheDocument(); // Tooltip title
	} );

	it( 'does not open popover when total is 0', async () => {
		mockUseCssClassUsageByID.mockReturnValue( {
			isLoading: false,
			data: { total: 0 },
		} );

		render( <CssClassUsageTrigger id="css-id" />, { wrapper } );

		const button = screen.getByRole( 'button' );
		fireEvent.click( button );

		await waitFor( () => {
			expect( screen.queryByLabelText( 'css-class-usage-popover' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'opens popover when total > 0 and icon is clicked', async () => {
		mockUseCssClassUsageByID.mockReturnValue( {
			isLoading: false,
			data: {
				total: 2,
				content: [
					{ pageId: 'page1', total: 1, elements: [ 'el-1' ], title: 'Title1' },
					{ pageId: 'page2', total: 1, elements: [ 'el-2' ], title: 'Title2' },
				],
			},
		} );

		render( <CssClassUsageTrigger id="css-id" />, { wrapper } );

		const button = screen.getByRole( 'button' );
		fireEvent.click( button );

		await waitFor( () => {
			expect( screen.getByTestId( 'css-class-usage-popover' ) ).toBeInTheDocument();
		} );
	} );
} );
