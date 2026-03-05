import type * as React from 'react';
import { renderHook } from '@testing-library/react';

import { useSizeUnitKeyboard } from '../use-size-unit-keyboard';

jest.mock( '../../utils/is-extended-unit', () => ( {
	isExtendedUnit: jest.fn(),
} ) );

const isExtendedUnitMock = jest.requireMock( '../../utils/is-extended-unit' ).isExtendedUnit;

type MockKeyboardEvent = {
	key: string;
	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
	preventDefault: jest.Mock;
};

const createKeyDownEvent = (
	key: string,
	overrides: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}
): MockKeyboardEvent => ( {
	key,
	altKey: false,
	ctrlKey: false,
	metaKey: false,
	preventDefault: jest.fn(),
	...overrides,
} );

const asKeyboardEvent = ( e: MockKeyboardEvent ) => e as unknown as React.KeyboardEvent< HTMLInputElement >;

describe( 'useSizeKeyboard', () => {
	const defaultUnits = [ 'px', 'rem', 'em' ] as const;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'return value', () => {
		it( 'should return an object with onUnitKeyDown function', () => {
			// Arrange.
			const onUnitChange = jest.fn();

			// Act.
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);

			// Assert.
			expect( result.current ).toHaveProperty( 'onUnitKeyDown' );
			expect( typeof result.current.onUnitKeyDown ).toBe( 'function' );
		} );
	} );

	describe( 'modifier keys', () => {
		it( 'should not call onUnitChange or preventDefault when altKey is true', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'p', { altKey: true } );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange or preventDefault when ctrlKey is true', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'r', { ctrlKey: true } );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange or preventDefault when metaKey is true', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'e', { metaKey: true } );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'extended unit and numeric key', () => {
		it( 'should call onUnitChange with units[0] when unit is extended( auto ) and key is digit', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( true );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'auto',
					units: [ 'em', 'rem' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '5' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).toHaveBeenCalledTimes( 1 );
			expect( onUnitChange ).toHaveBeenCalledWith( 'em' );
		} );

		it( 'should not call onUnitChange when unit is extended( auto ), key is digit, and units is empty', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( true );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'auto',
					units: [],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '5' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange when unit is extended ( auto ) and key is not numeric', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( true );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'auto',
					units: [ 'px', 'rem' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '.' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should call onUnitChange with units[0] when unit is extended( auto ) and key is "0"', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( true );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'auto',
					units: [ 'px', 'rem' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '0' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).toHaveBeenCalledTimes( 1 );
			expect( onUnitChange ).toHaveBeenCalledWith( 'px' );
		} );

		it( 'should not call onUnitChange when unit is not extended and key is digit', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( false );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '9' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'non-letter and non-% keys', () => {
		it( 'should not call onUnitChange or preventDefault when key is digit and unit is not extended', () => {
			// Arrange.
			isExtendedUnitMock.mockReturnValue( false );
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '7' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange or preventDefault when key is Enter', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'Enter' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange or preventDefault when key is Tab', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'Tab' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should not call onUnitChange or preventDefault when key is ArrowLeft', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'ArrowLeft' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'unit switching by typing', () => {
		it( 'should call preventDefault when key is a letter', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'x' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'should call onUnitChange with matched unit when buffer matches a unit', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( createKeyDownEvent( 'r' ) ) );
			result.current.onUnitKeyDown( asKeyboardEvent( createKeyDownEvent( 'e' ) ) );
			result.current.onUnitKeyDown( asKeyboardEvent( createKeyDownEvent( 'm' ) ) );

			// Assert.
			expect( onUnitChange ).toHaveBeenCalledTimes( 3 );
			expect( onUnitChange ).toHaveBeenNthCalledWith( 1, 'rem' );
			expect( onUnitChange ).toHaveBeenNthCalledWith( 2, 'rem' );
			expect( onUnitChange ).toHaveBeenNthCalledWith( 3, 'rem' );
		} );

		// Why press x cant match
		it( 'should not call onUnitChange when key is letter but no unit matches buffer', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ ...defaultUnits ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'x' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( event.preventDefault ).toHaveBeenCalled();
			expect( onUnitChange ).not.toHaveBeenCalled();
		} );

		it( 'should call onUnitChange with "%" when key is % and % is in units', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ 'px', '%', 'em' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( '%' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).toHaveBeenCalledWith( '%' );
		} );

		it( 'should match single-character unit and call onUnitChange', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ 'px', 'em', 'rem' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'e' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).toHaveBeenCalledWith( 'em' );
		} );

		it( 'should not call onUnitChange when typing letter and units list is empty', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'p' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( event.preventDefault ).toHaveBeenCalled();
			expect( onUnitChange ).not.toHaveBeenCalled();
		} );

		it( 'should not match unit when buffer does not match any unit prefix', () => {
			// Arrange.
			const onUnitChange = jest.fn();
			const { result } = renderHook( () =>
				useSizeUnitKeyboard( {
					unit: 'px',
					units: [ 'px', 'rem' ],
					onUnitChange,
				} )
			);
			const event = createKeyDownEvent( 'z' );

			// Act.
			result.current.onUnitKeyDown( asKeyboardEvent( event ) );

			// Assert.
			expect( onUnitChange ).not.toHaveBeenCalled();
		} );
	} );
} );
