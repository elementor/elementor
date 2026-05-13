import * as React from 'react';
import { createRef } from 'react';
import { type PopupState } from '@elementor/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TextFieldPopover } from '../text-field-popover';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( key: string ) => key,
} ) );

const createAnchor = () => {
	const anchor = document.createElement( 'div' );
	document.body.appendChild( anchor );
	return anchor;
};

const createMockPopupState = (
	overrides: { isOpen?: boolean; close?: jest.Mock; anchorEl?: HTMLElement | null } = {}
) =>
	( {
		isOpen: false,
		close: jest.fn(),
		open: jest.fn(),
		anchorEl: null,
		...overrides,
	} ) as unknown as PopupState;

describe( 'TextFieldPopover', () => {
	const defaultProps = {
		popupState: createMockPopupState(),
		anchorRef: createRef< HTMLDivElement | null >(),
		onClose: jest.fn(),
		value: '',
		onChange: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'should render with value in text field', () => {
			const anchor = createAnchor();
			const props = {
				...defaultProps,
				value: '10',
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const input = screen.getByRole( 'textbox', { hidden: true } );

			expect( input ).toBeInTheDocument();
			expect( input ).toHaveValue( '10' );
		} );

		it( 'should render header with CSS function title', () => {
			const anchor = createAnchor();
			const props = {
				...defaultProps,
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor } ),
			};

			render( <TextFieldPopover { ...props } /> );

			expect( screen.getByText( 'CSS function' ) ).toBeInTheDocument();
		} );

		test( 'should focus input when opened', async () => {
			const anchor = createAnchor();

			const props = {
				...defaultProps,
				value: '10',
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const input = screen.getByRole( 'textbox', { hidden: true } );

			await waitFor( () => {
				expect( input ).toHaveFocus();
			} );
		} );

		test( 'should not focus input or text field not found when isOpen is false', async () => {
			const anchor = createAnchor();

			const props = {
				...defaultProps,
				value: '10',
				popupState: createMockPopupState( { isOpen: false, anchorEl: anchor } ),
			};

			render( <TextFieldPopover { ...props } /> );

			expect( screen.queryByRole( 'textbox', { hidden: true } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Event Handlers', () => {
		it( 'should call onChange when input value changes', () => {
			const anchor = createAnchor();
			const onChange = jest.fn();

			const props = {
				...defaultProps,
				onChange,
				value: '5',
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const input = screen.getByRole( 'textbox', { hidden: true } );

			fireEvent.change( input, { target: { value: 'calc(100% - 20px)' } } );

			expect( onChange ).toHaveBeenCalledTimes( 1 );
			expect( onChange ).toHaveBeenCalledWith( expect.objectContaining( { type: 'change' } ) );
			expect( ( onChange.mock.calls[ 0 ][ 0 ] as React.ChangeEvent< HTMLInputElement > ).target ).toBeInstanceOf(
				HTMLInputElement
			);
		} );

		it( 'should call onClose and popupState.close when popover close button is clicked', () => {
			const anchor = createAnchor();
			const close = jest.fn();
			const onClose = jest.fn();

			const props = {
				...defaultProps,
				onClose,
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor, close } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const closeButton = screen.getByRole( 'button', { name: 'close', hidden: true } );

			fireEvent.click( closeButton );

			expect( onClose ).toHaveBeenCalledTimes( 1 );
			expect( close ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should close on Enter key', () => {
			const anchor = createAnchor();
			const close = jest.fn();
			const onClose = jest.fn();

			const props = {
				...defaultProps,
				onClose,
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor, close } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const input = screen.getByRole( 'textbox', { hidden: true } );

			fireEvent.keyDown( input, { key: 'Enter' } );

			expect( onClose ).toHaveBeenCalled();
			expect( close ).toHaveBeenCalled();
		} );

		test( 'should close when clicking outside (popover onClose)', () => {
			const anchor = createAnchor();
			const close = jest.fn();
			const onClose = jest.fn();

			const props = {
				...defaultProps,
				onClose,
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor, close } ),
			};

			render( <TextFieldPopover { ...props } /> );

			const modal = screen.getByRole( 'presentation', { hidden: true } );
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,testing-library/no-node-access
			const backdrop = modal.querySelector( '.MuiBackdrop-root' )!;

			fireEvent.click( backdrop );

			expect( onClose ).toHaveBeenCalled();
			expect( close ).toHaveBeenCalled();
		} );
	} );

	describe( 'anchorRef', () => {
		it( 'should not throw when anchorRef.current is null', () => {
			const anchor = createAnchor();
			const props = {
				...defaultProps,
				anchorRef: createRef< HTMLDivElement | null >(),
				popupState: createMockPopupState( { isOpen: true, anchorEl: anchor } ),
			};

			expect( () => render( <TextFieldPopover { ...props } /> ) ).not.toThrow();
		} );
	} );
} );
