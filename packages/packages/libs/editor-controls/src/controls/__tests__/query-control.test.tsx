import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { httpService } from '@elementor/http-client';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { QueryControl } from '../query-control';

const queryPropType = createMockPropType( {
	kind: 'object',
	shape: {
		id: createMockPropType( { kind: 'plain' } ),
		label: createMockPropType( { kind: 'object' } ),
	},
} );

jest.mock( '@elementor/http-client' );

const baseProps = {
	bind: 'query',
	setValue: jest.fn(),
	propType: queryPropType,
	value: null,
};

const queryOptions = {
	requestParams: { postType: 'post' },
	endpoint: 'wp/v2/posts',
};

const ajaxResponse = {
	value: [
		{
			id: 1,
			value: 'val1',
			label: 'Val 1',
		},
		{
			id: 2,
			value: 'val2',
			label: 'Val 2',
		},
	],
};

const categorizedAjaxResponse = {
	value: [
		{
			id: 'post1',
			value: 'post1',
			label: 'Post 1',
			groupLabel: 'Posts',
		},
		{
			id: 'page1',
			value: 'page1',
			label: 'Page 1',
			groupLabel: 'Pages',
		},
	],
};

describe( '<QueryControl />', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		jest.mocked( httpService ).mockReturnValue( {
			// @ts-expect-error - We don't need all types for this test
			get: getMockImplementation,
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render control with placeholder', () => {
		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			baseProps
		);

		// Assert.
		expect( screen.getByPlaceholderText( 'Search posts...' ) ).toBeInTheDocument();
	} );

	it( 'should handle null value', () => {
		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Assert.
		expect( input ).toHaveValue( '' );
	} );

	it( 'should display existing value', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: {
				$$type: 'query',
				value: {
					id: {
						$$type: 'number',
						value: 123,
					},
					label: {
						$$type: 'string',
						value: 'Existing Post',
					},
				},
			},
		};

		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			props
		);

		const input = screen.getByDisplayValue( 'Existing Post' );

		// Assert.
		expect( input ).toBeInTheDocument();
	} );

	it( 'should fetch and display options when typing', async () => {
		// Act.
		renderControl(
			<QueryControl
				queryOptions={ queryOptions }
				placeholder="Search posts..."
				allowCustomValues={ false }
				minInputLength={ 2 }
			/>,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act.
		fireEvent.input( input, { target: { value: 'Va' } } );

		// Assert.
		await waitFor(
			() => {
				expect( screen.getByText( 'Val 1' ) ).toBeVisible();
			},
			{ timeout: 600 }
		);

		await waitFor(
			() => {
				expect( screen.getByText( 'Val 2' ) ).toBeVisible();
			},
			{ timeout: 600 }
		);
	} );

	it( 'should not fetch options when input length is below minimum', async () => {
		// Act.
		renderControl(
			<QueryControl
				queryOptions={ queryOptions }
				placeholder="Search posts..."
				allowCustomValues={ false }
				minInputLength={ 3 }
			/>,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act.
		fireEvent.input( input, { target: { value: 'Va' } } );

		// Wait for potential debounce
		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

		// Assert.
		expect( httpService ).not.toHaveBeenCalled();

		// Act.
		fireEvent.input( input, { target: { value: 'Val' } } );

		// Wait for potential debounce
		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

		// Assert.
		expect( httpService ).toHaveBeenCalled();
	} );

	it( 'should handle option selection', async () => {
		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act.
		fireEvent.input( input, { target: { value: 'Va' } } );

		// Wait for options to load
		await waitFor( () => {
			expect( screen.getByText( 'Val 1' ) ).toBeVisible();
		} );

		// Select option
		fireEvent.click( screen.getByText( 'Val 1' ) );

		// Assert.
		expect( baseProps.setValue ).toHaveBeenCalledWith( {
			$$type: 'query',
			value: {
				id: {
					$$type: 'number',
					value: 1,
				},
				label: {
					$$type: 'string',
					value: 'Val 1',
				},
			},
		} );
	} );

	it( 'should handle categorized options', async () => {
		// Arrange.
		jest.mocked( httpService ).mockReturnValue( {
			// @ts-expect-error - We don't need all types for this test
			get: getCategorizedMockImplementation,
		} );

		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act.
		fireEvent.input( input, { target: { value: 'Post' } } );

		// Assert.
		await waitFor(
			() => {
				expect( screen.getByText( 'Post 1' ) ).toBeVisible();
			},
			{ timeout: 600 }
		);

		await waitFor(
			() => {
				expect( screen.getByText( 'Page 1' ) ).toBeVisible();
			},
			{ timeout: 600 }
		);
	} );

	it( 'should handle custom values when allowCustomValues is true', () => {
		// Act.
		renderControl(
			<QueryControl
				queryOptions={ queryOptions }
				placeholder="Search posts..."
				allowCustomValues={ true }
				externalValue="Custom URL"
				setExternalValue={ jest.fn() }
			/>,
			baseProps
		);

		const input = screen.getByDisplayValue( 'Custom URL' );

		// Assert.
		expect( input ).toBeInTheDocument();
	} );

	it( 'should call setExternalValue when typing custom text', () => {
		// Arrange.
		const setExternalValue = jest.fn();

		// Act.
		renderControl(
			<QueryControl
				queryOptions={ queryOptions }
				placeholder="Search posts..."
				allowCustomValues={ true }
				setExternalValue={ setExternalValue }
			/>,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act.
		fireEvent.input( input, { target: { value: 'Custom text' } } );

		// Assert.
		expect( setExternalValue ).toHaveBeenCalledWith( 'Custom text' );
		expect( baseProps.setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should debounce API calls', async () => {
		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			baseProps
		);

		const input = screen.getByPlaceholderText( 'Search posts...' );

		// Act - type multiple characters quickly
		fireEvent.input( input, { target: { value: 'T' } } );
		fireEvent.input( input, { target: { value: 'Te' } } );
		fireEvent.input( input, { target: { value: 'Tes' } } );
		fireEvent.input( input, { target: { value: 'Test' } } );

		// Wait for debounce to complete
		await waitFor(
			() => {
				expect( httpService ).toHaveBeenCalledTimes( 1 );
			},
			{ timeout: 600 }
		);
	} );

	it( 'should generate first loaded option from existing value', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: {
				$$type: 'query',
				value: {
					id: {
						$$type: 'number',
						value: 123,
					},
					label: {
						$$type: 'string',
						value: 'Test Post',
					},
				},
			},
		};

		// Act.
		renderControl(
			<QueryControl queryOptions={ queryOptions } placeholder="Search posts..." allowCustomValues={ false } />,
			props
		);

		// Assert.
		expect( screen.getByDisplayValue( 'Test Post' ) ).toBeInTheDocument();
	} );
} );

async function getMockImplementation() {
	return {
		data: {
			data: ajaxResponse,
		},
	};
}

async function getCategorizedMockImplementation() {
	return {
		data: {
			data: categorizedAjaxResponse,
		},
	};
}
