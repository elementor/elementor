import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { type PopupState } from '@elementor/ui';

import { UrlPopover } from '../url-popover';

const createMockPopupState = ( isOpen: boolean = true, anchorEl?: Element ) => ( {
	isOpen,
	open: jest.fn(),
	close: jest.fn(),
	toggle: jest.fn(),
	setOpen: jest.fn(),
	anchorEl,
	setAnchorEl: jest.fn(),
	popupId: 'test-popup',
	variant: 'popover',
} as unknown as PopupState );

const createMockAnchorRef = () => ( {
	current: {
		offsetWidth: 200,
	} as HTMLDivElement,
} );

const defaultProps = {
	popupState: createMockPopupState(),
	anchorRef: createMockAnchorRef(),
	restoreValue: jest.fn(),
	value: '',
	onChange: jest.fn(),
	openInNewTab: false,
	onToggleNewTab: jest.fn(),
};

describe( 'UrlPopover', () => {
	let anchorElement: HTMLDivElement;

	beforeEach( () => {
		jest.clearAllMocks();
		anchorElement = document.createElement( 'div' );
		document.body.appendChild( anchorElement );
	} );

	afterEach( () => {
		document.body.removeChild( anchorElement );
	} );

	describe( 'Rendering', () => {
		it( 'should render TextField with placeholder', () => {
			// Arrange.
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );

			// Assert.
			expect( screen.getByPlaceholderText( 'Type a URL' ) ).toBeInTheDocument();
		} );

		it( 'should render ToggleButton for opening in new tab', () => {
			// Arrange.
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'Open in a new tab' } ) ).toBeInTheDocument();
		} );

		it( 'should display the provided value in TextField', () => {
			// Arrange.
			const testUrl = 'https://elementor.com';
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
				value: testUrl,
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );

			// Assert.
			expect( screen.getByDisplayValue( testUrl ) ).toBeInTheDocument();
		} );

		it( 'should handle empty value', () => {
			// Arrange.
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
				value: '',
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );
			const input = screen.getByPlaceholderText( 'Type a URL' );

			// Assert.
			expect( input ).toHaveValue( '' );
		} );
	} );

	describe( 'Interactions', () => {
		it( 'should call onChange when typing in TextField', () => {
			// Arrange.
			const mockOnChange = jest.fn();
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
				onChange: mockOnChange,
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );
			const input = screen.getByPlaceholderText( 'Type a URL' );
			fireEvent.change( input, { target: { value: 'https://test.com' } } );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call onToggleNewTab when clicking the toggle button', () => {
			// Arrange.
			const mockOnToggleNewTab = jest.fn();
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
				onToggleNewTab: mockOnToggleNewTab,
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );
			const toggleButton = screen.getByRole( 'button', { name: 'Open in a new tab' } );
			fireEvent.click( toggleButton );

			// Assert.
			expect( mockOnToggleNewTab ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should show toggle button as selected when openInNewTab is true', () => {
			// Arrange.
			const props = {
				...defaultProps,
				popupState: createMockPopupState( true, anchorElement ),
				openInNewTab: true,
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );
			const toggleButton = screen.getByRole( 'button', { name: 'Open in a new tab' } );

			// Assert.
			expect( toggleButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'should call restoreValue and close when popover closes', () => {
			// Arrange.
			const mockRestoreValue = jest.fn();
			const mockPopupState = createMockPopupState( true, anchorElement );
			const props = {
				...defaultProps,
				restoreValue: mockRestoreValue,
				popupState: mockPopupState,
			};

			// Act.
			renderWithTheme( <UrlPopover { ...props } /> );
			const popover = screen.getByRole( 'presentation' );
			fireEvent.keyDown( popover, { key: 'Escape' } );

			// Assert.
			expect( mockRestoreValue ).toHaveBeenCalledTimes( 1 );
			expect( mockPopupState.close ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
