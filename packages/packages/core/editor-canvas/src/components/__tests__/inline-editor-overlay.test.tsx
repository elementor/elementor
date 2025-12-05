import * as React from 'react';
import { getContainer, useElementSetting } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';
import { debounce } from '@elementor/utils';

import { useFloatingOnElement } from '../../hooks/use-floating-on-element';
import { getInlineEditablePropertyName } from '../../utils/inline-editing-utils';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-props' );
jest.mock( '@elementor/utils' );
jest.mock( '@elementor/editor-controls', () => ( {
	InlineEditor: jest.fn( ( { value, setValue } ) => (
		<div aria-label="inline editor container">
			<input aria-label="inline editor" value={ value } onChange={ ( e ) => setValue( e.target.value ) } />
		</div>
	) ),
} ) );
jest.mock( '../../hooks/use-floating-on-element' );
jest.mock( '../../utils/inline-editing-utils' );

describe( '<InlineEditorOverlay />', () => {
	const mockPropertyName = 'title';
	const mockValue = '<p>Test content</p>';

	beforeEach( () => {
		jest.mocked( useFloatingOnElement ).mockReturnValue( {
			floating: {
				setRef: jest.fn(),
				ref: { current: null },
				styles: { position: 'absolute', top: 0, left: 0 },
			},
			isVisible: true,
			context: {} as never,
		} );

		jest.mocked( getContainer ).mockReturnValue( {
			model: {
				get: jest.fn().mockReturnValue( 'e-heading' ),
			},
		} as unknown as ReturnType< typeof getContainer > );

		jest.mocked( getInlineEditablePropertyName ).mockReturnValue( mockPropertyName );

		jest.mocked( useElementSetting ).mockReturnValue( {
			$$type: 'html',
			value: mockValue,
		} );

		jest.mocked( htmlPropTypeUtil.extract ).mockReturnValue( mockValue );

		jest.mocked( htmlPropTypeUtil.create ).mockImplementation( ( value ) => ( {
			$$type: 'html',
			value: typeof value === 'function' ? value( null ) : value,
		} ) );

		const mockDebouncedFn = jest.fn( ( fn: ( ...args: unknown[] ) => void ) => {
			const debouncedFn = ( ...args: unknown[] ) => fn( ...args );
			(
				debouncedFn as typeof debouncedFn & {
					cancel: jest.Mock;
					flush: jest.Mock;
					pending: jest.Mock;
				}
			 ).cancel = jest.fn();
			(
				debouncedFn as typeof debouncedFn & {
					cancel: jest.Mock;
					flush: jest.Mock;
					pending: jest.Mock;
				}
			 ).flush = jest.fn( ( ...args: unknown[] ) => fn( ...args ) );
			(
				debouncedFn as typeof debouncedFn & {
					cancel: jest.Mock;
					flush: jest.Mock;
					pending: jest.Mock;
				}
			 ).pending = jest.fn().mockReturnValue( false );
			return debouncedFn;
		} );
		jest.mocked( debounce ).mockImplementation( mockDebouncedFn as unknown as typeof debounce );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	// it( 'should render InlineEditor when visible', () => {
	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	const input = screen.getByRole( 'textbox', { name: 'inline editor' } );
	// 	expect( input ).toBeInTheDocument();
	// 	expect( input ).toHaveValue( mockValue );
	// } );

	// it( 'should not render when not visible', () => {
	// 	jest.mocked( useFloatingOnElement ).mockReturnValue( {
	// 		floating: {
	// 			setRef: jest.fn(),
	// 			ref: { current: null },
	// 			styles: {},
	// 		},
	// 		isVisible: false,
	// 		context: {} as never,
	// 	} );

	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ false } id={ mockId } /> );

	// 	expect( screen.queryByRole( 'textbox', { name: 'inline editor' } ) ).not.toBeInTheDocument();
	// } );

	// it( 'should get container and property name on mount', () => {
	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	expect( getContainer ).toHaveBeenCalledWith( mockId );
	// 	expect( getInlineEditablePropertyName ).toHaveBeenCalled();
	// } );

	// it( 'should extract value from contentProp using htmlPropTypeUtil', () => {
	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	expect( htmlPropTypeUtil.extract ).toHaveBeenCalledWith( {
	// 		$$type: 'html',
	// 		value: mockValue,
	// 	} );
	// } );

	// it( 'should call updateElementSettings when value changes', async () => {
	// 	const newValue = '<p>New content</p>';
	// 	const mockDebounceFn = jest.fn();
	// 	const debouncedFn = jest.fn( ( fn: ( ...args: unknown[] ) => void ) => {
	// 		mockDebounceFn.mockImplementation( fn );
	// 		return mockDebounceFn;
	// 	} );
	// 	jest.mocked( debounce ).mockImplementation( debouncedFn as unknown as typeof debounce );

	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	const input = screen.getByRole( 'textbox', { name: 'inline editor' } ) as HTMLInputElement;

	// 	await act( async () => {
	// 		input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
	// 		Object.defineProperty( input, 'value', { value: newValue, writable: true } );
	// 	} );

	// 	await act( async () => {
	// 		mockDebounceFn( newValue );
	// 	} );

	// 	expect( updateElementSettings ).toHaveBeenCalledWith( {
	// 		id: mockId,
	// 		props: {
	// 			[ mockPropertyName ]: {
	// 				$$type: 'html',
	// 				value: newValue,
	// 			},
	// 		},
	// 		withHistory: true,
	// 	} );
	// } );

	// it( 'should save &nbsp; when content is empty', async () => {
	// 	const emptyValue = '';
	// 	const mockDebounceFn = jest.fn();
	// 	const debouncedFn = jest.fn( ( fn: ( ...args: unknown[] ) => void ) => {
	// 		mockDebounceFn.mockImplementation( fn );
	// 		return mockDebounceFn;
	// 	} );
	// 	jest.mocked( debounce ).mockImplementation( debouncedFn as unknown as typeof debounce );

	// 	renderWithTheme( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	await act( async () => {
	// 		mockDebounceFn( emptyValue );
	// 	} );

	// 	expect( updateElementSettings ).toHaveBeenCalledWith( {
	// 		id: mockId,
	// 		props: {
	// 			[ mockPropertyName ]: {
	// 				$$type: 'html',
	// 				value: '&nbsp;',
	// 			},
	// 		},
	// 		withHistory: true,
	// 	} );
	// } );

	// it( 'should update and display new value after editing', async () => {
	// 	const initialValue = '<p>Initial content</p>';
	// 	const newValue = '<p>Updated content</p>';

	// 	jest.mocked( useElementSetting ).mockReturnValue( {
	// 		$$type: 'html',
	// 		value: initialValue,
	// 	} );
	// 	jest.mocked( htmlPropTypeUtil.extract ).mockReturnValue( initialValue );

	// 	const mockDebounceFn = jest.fn();
	// 	const debouncedFn = jest.fn( ( fn: ( ...args: unknown[] ) => void ) => {
	// 		mockDebounceFn.mockImplementation( fn );
	// 		return mockDebounceFn;
	// 	} );
	// 	jest.mocked( debounce ).mockImplementation( debouncedFn as unknown as typeof debounce );

	// 	const { rerender } = renderWithTheme(
	// 		<InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } />
	// 	);

	// 	const input = screen.getByRole( 'textbox', { name: 'inline editor' } ) as HTMLInputElement;
	// 	expect( input ).toHaveValue( initialValue );

	// 	await act( async () => {
	// 		mockDebounceFn( newValue );
	// 	} );

	// 	expect( updateElementSettings ).toHaveBeenCalledWith( {
	// 		id: mockId,
	// 		props: {
	// 			[ mockPropertyName ]: {
	// 				$$type: 'html',
	// 				value: newValue,
	// 			},
	// 		},
	// 		withHistory: true,
	// 	} );

	// 	jest.mocked( useElementSetting ).mockReturnValue( {
	// 		$$type: 'html',
	// 		value: newValue,
	// 	} );
	// 	jest.mocked( htmlPropTypeUtil.extract ).mockReturnValue( newValue );

	// 	rerender( <InlineEditorOverlay element={ mockElement } isSelected={ true } id={ mockId } /> );

	// 	const updatedInput = screen.getByRole( 'textbox', { name: 'inline editor' } ) as HTMLInputElement;
	// 	expect( updatedInput ).toHaveValue( newValue );
	// } );
} );
