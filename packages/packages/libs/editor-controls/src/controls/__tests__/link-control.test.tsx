import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { getLinkInLinkRestriction, type LinkInLinkRestriction, selectElement } from '@elementor/editor-elements';
import { httpService } from '@elementor/http-client';
import { useSessionStorage } from '@elementor/session';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { LinkControl } from '../link-control';

const propType = createMockPropType( {
	kind: 'object',
	shape: {
		enabled: createMockPropType( { kind: 'object' } ),
		destination: createMockPropType( {
			kind: 'union',
			prop_types: {
				url: createMockPropType( { kind: 'plain' } ),
				number: createMockPropType( { kind: 'plain' } ),
			},
		} ),
		label: createMockPropType( { kind: 'object' } ),
		isTargetBlank: createMockPropType( { kind: 'object' } ),
	},
} );

jest.mock( '@elementor/session' );

jest.mock( '@elementor/editor-elements' );

const globalProps = {
	context: { elementId: '1' },
	allowCustomValues: true,
	queryOptions: {
		requestParams: {},
		endpoint: '',
	},
};

const baseProps = {
	bind: 'link',
	setValue: jest.fn(),
	propType,
	value: null,
};

const ajaxResponse = {
	value: [
		{
			id: 'val1',
			value: 'val1',
			label: 'Val 1',
		},
	],
};

const restrictionTestCases: [ LinkInLinkRestriction, string ][] = [
	[ { shouldRestrict: true, reason: 'ancestor', elementId: null }, 'from its parent container' ],
	[ { shouldRestrict: true, reason: 'descendant', elementId: null }, 'from the elements inside of it' ],
];

const restrictionCtaTestCases: LinkInLinkRestriction[] = [
	{
		shouldRestrict: true,
		reason: 'ancestor',
		elementId: '123456',
	},
	{
		shouldRestrict: true,
		reason: 'descendant',
		elementId: '123456',
	},
];

describe( '<LinkControl />', () => {
	beforeEach( () => {
		jest.mocked( useSessionStorage ).mockReturnValue( [
			{
				value: {
					$$type: 'link',
					value: {
						destination: {
							$$type: 'url',
							value: 'https://url-from-storage.com/',
						},
						isTargetBlank: {
							$$type: 'boolean',
							value: false,
						},
						label: null,
					},
				},
				meta: {
					isEnabled: true,
				},
			},
			jest.fn(),
			jest.fn(),
		] );

		jest.mocked( getLinkInLinkRestriction ).mockReturnValue( {
			shouldRestrict: false,
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render control', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: {
				$$type: 'link',
				value: {
					destination: {
						$$type: 'url',
						value: '',
					},
					isTargetBlank: {
						$$type: 'boolean',
						value: false,
					},
					label: null,
				},
			},
		};

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		// Assert.
		expect( screen.getByText( 'Link' ) ).toBeInTheDocument();

		// Assert.
		expect( screen.getByPlaceholderText( 'test' ) ).toBeInTheDocument();
	} );

	it( 'should be closed when value is null', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: null,
		};

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		// Assert.
		expect( screen.queryByPlaceholderText( 'test' ) ).not.toBeInTheDocument();
	} );

	it( 'should set existing value to null when closing collapsable', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: {
				$$type: 'link',
				value: {
					destination: {
						$$type: 'url',
						value: 'https://url.com/',
					},
					isTargetBlank: {
						$$type: 'boolean',
						value: false,
					},
					label: null,
				},
			},
		};

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Toggle link',
			} )
		);

		// Assert.
		expect( props.setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should be open when value not null, and update new value to input', () => {
		// Arrange.
		const testHref = 'https://elementor.com/';

		const props = {
			...baseProps,
			value: {
				$$type: 'link',
				value: {
					destination: {
						$$type: 'url',
						value: '',
					},
					isTargetBlank: {
						$$type: 'boolean',
						value: false,
					},
					label: null,
				},
			},
		};

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		const hrefInput = screen.getByPlaceholderText( 'test' );
		fireEvent.input( hrefInput, { target: { value: testHref } } );

		// Assert.
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'link',
			value: {
				label: {
					$$type: 'string',
					value: '',
				},
				destination: {
					$$type: 'url',
					value: testHref,
				},
				isTargetBlank: {
					$$type: 'boolean',
					value: false,
				},
			},
		} );
	} );

	it( 'should not update value from session when no session value exists on collapsable open', () => {
		// Arrange.
		jest.mocked( useSessionStorage ).mockReturnValue( [
			{
				value: null,
				meta: {
					isEnabled: false,
				},
			},
			jest.fn(),
			jest.fn(),
		] );

		const props = {
			...baseProps,
			value: null,
		};

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Toggle link',
			} )
		);

		// Assert.
		expect( props.setValue ).not.toHaveBeenCalled();
	} );

	it( 'should restore value from session when opening collapsable and session has value', () => {
		// Arrange.
		const mockSetSessionValue = jest.fn();
		const storedValue = {
			value: {
				destination: {
					$$type: 'url',
					value: 'https://url-from-storage.com/',
				},
				isTargetBlank: {
					$$type: 'boolean',
					value: false,
				},
				label: null,
			},
			meta: {
				isEnabled: false,
			},
		};

		jest.mocked( useSessionStorage ).mockReturnValue( [ storedValue, mockSetSessionValue, jest.fn() ] );

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, baseProps );

		const toggleButton = screen.getByRole( 'button', {
			name: 'Toggle link',
		} );
		fireEvent.click( toggleButton );

		// Assert.
		expect( baseProps.setValue ).toHaveBeenLastCalledWith( {
			$$type: 'link',
			value: {
				destination: {
					$$type: 'url',
					value: 'https://url-from-storage.com/',
				},
				isTargetBlank: {
					$$type: 'boolean',
					value: false,
				},
				label: null,
			},
		} );

		// Check that the session value correct after open collapsable
		expect( mockSetSessionValue ).toHaveBeenCalledWith( {
			value: storedValue.value,
			meta: { isEnabled: true },
		} );
		expect( mockSetSessionValue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should set new value to session and input', () => {
		// Arrange.
		const props = {
			...baseProps,
			value: null,
		};

		const mockSetSessionValue = jest.fn();

		jest.mocked( useSessionStorage ).mockReturnValue( [
			{
				value: null,
				meta: { isEnabled: false },
			},
			mockSetSessionValue,
			jest.fn(),
		] );

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, props );

		const toggleButton = screen.getByRole( 'button', {
			name: 'Toggle link',
		} );
		fireEvent.click( toggleButton );

		const hrefInput = screen.getByPlaceholderText( 'test' );

		// Assert.
		expect( hrefInput ).toBeVisible();

		// Act.
		fireEvent.input( hrefInput, { target: { value: 'Value' } } );

		// Assert.
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'link',
			value: {
				destination: {
					$$type: 'url',
					value: 'Value',
				},
				label: {
					$$type: 'string',
					value: '',
				},
			},
		} );

		expect( mockSetSessionValue ).toHaveBeenCalledWith( {
			value: {
				destination: {
					$$type: 'url',
					value: 'Value',
				},
				label: {
					$$type: 'string',
					value: '',
				},
			},
			meta: { isEnabled: false },
		} );
	} );

	it( 'should function as an autocomplete control when given options', async () => {
		// Arrange.
		jest.mocked( httpService ).mockReturnValue( {
			// @ts-expect-error - We don't need all types for this test
			get,
		} );

		const props = {
			...baseProps,
			value: {
				$$type: 'link',
				value: {
					destination: {
						$$type: 'url',
						value: null,
					},
					isTargetBlank: {
						$$type: 'boolean',
						value: false,
					},
					label: null,
				},
			},
		};

		// Act.
		renderControl(
			<LinkControl
				{ ...globalProps }
				queryOptions={ { requestParams: {}, endpoint: 'example' } }
				placeholder={ 'test' }
				allowCustomValues={ true }
			/>,
			props
		);

		const hrefInput = screen.getByPlaceholderText( 'test' );

		// Assert.
		expect( hrefInput ).toBeVisible();

		// Act.
		fireEvent.input( hrefInput, { target: { value: 'Va' } } );

		await waitFor(
			() => {
				// Assert.
				expect( screen.getByText( 'Val 1' ) ).toBeVisible();
			},
			{ timeout: 600 }
		);
	} );

	it( 'should prevent link enabling when ancestor has anchor', () => {
		// Arrange.
		jest.mocked( getLinkInLinkRestriction ).mockReturnValue( {
			shouldRestrict: true,
			reason: 'ancestor',
			elementId: null,
		} );

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, baseProps );

		const addLinkButton = screen.getByRole( 'button' );
		fireEvent.click( addLinkButton );

		// Assert.
		expect( baseProps.setValue ).not.toHaveBeenCalled();
	} );

	it( 'should prevent link enabling when descendant has anchor', () => {
		// Arrange.
		jest.mocked( getLinkInLinkRestriction ).mockReturnValue( {
			shouldRestrict: true,
			reason: 'descendant',
			elementId: null,
		} );

		// Act.
		renderControl( <LinkControl { ...globalProps } placeholder={ 'test' } />, baseProps );

		const addLinkButton = screen.getByRole( 'button' );
		fireEvent.click( addLinkButton );

		// Assert.
		expect( baseProps.setValue ).not.toHaveBeenCalled();
	} );

	it( 'should not call setValue when opening link collapsible and value is already null', () => {
		// Arrange
		jest.mocked( useSessionStorage ).mockReturnValue( [
			{
				value: null,
				meta: { isEnabled: false },
			},
			jest.fn(),
			jest.fn(),
		] );

		const props = {
			...baseProps,
			value: null,
		};

		// Act
		renderControl( <LinkControl { ...globalProps } placeholder="test" />, props );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Toggle link',
			} )
		);

		// Assert
		expect( props.setValue ).not.toHaveBeenCalled();
	} );

	it( 'should not call setValue when closing link collapsible and value is already null', () => {
		// Arrange
		jest.mocked( useSessionStorage ).mockReturnValue( [
			{
				value: null,
				meta: { isEnabled: true },
			},
			jest.fn(),
			jest.fn(),
		] );

		const props = {
			...baseProps,
			value: null,
		};

		// Act
		renderControl( <LinkControl { ...globalProps } placeholder="test" />, props );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Toggle link',
			} )
		);

		// Assert
		expect( props.setValue ).not.toHaveBeenCalled();
	} );

	test.each( restrictionTestCases )(
		'should display the correct tooltip for restriction state %s',
		async ( restrictionState, expectedInfoTipText ) => {
			// Arrange
			jest.mocked( getLinkInLinkRestriction ).mockReturnValue( restrictionState );

			renderControl( <LinkControl { ...globalProps } placeholder="test" />, baseProps );

			// Act
			const item = screen.getByRole( 'button', { name: 'Toggle link' } );
			fireEvent.mouseOver( item );

			// Assert
			await waitFor( () => {
				screen.getByText( expectedInfoTipText, { exact: false } );
			} );
		}
	);

	test.each( restrictionCtaTestCases )(
		'should select and navigate to correct element when clicking the "take me there" button - %s',
		async ( restrictionState ) => {
			// Arrange
			jest.mocked( getLinkInLinkRestriction ).mockReturnValue( restrictionState );

			// Act.
			renderControl( <LinkControl { ...globalProps } placeholder="test" />, baseProps );

			const openLinkSectionButton = screen.getByRole( 'button', { name: 'Toggle link' } );
			fireEvent.mouseOver( openLinkSectionButton );

			// Assert,
			const takeMeThereButton = await screen.findByText( 'Take me there' );

			// Act.
			fireEvent.click( takeMeThereButton );

			// Assert.
			expect( selectElement ).toHaveBeenCalledWith( restrictionState.elementId );
		}
	);
} );

async function get() {
	return {
		data: {
			data: ajaxResponse,
		},
	};
}
