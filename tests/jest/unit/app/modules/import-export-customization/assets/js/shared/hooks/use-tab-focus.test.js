import { act, renderHook } from '@testing-library/react';
import { useTabFocus } from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-tab-focus';

describe( 'useTabFocus', () => {
	let addEventListenerSpy;
	let removeEventListenerSpy;

	beforeEach( () => {
		addEventListenerSpy = jest.spyOn( document, 'addEventListener' );
		removeEventListenerSpy = jest.spyOn( document, 'removeEventListener' );
		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'hidden',
			writable: true,
		} );
	} );

	afterEach( () => {
		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	} );

	it( 'should add visibilitychange listener on mount', () => {
		const callback = jest.fn();

		renderHook( () => useTabFocus( callback ) );

		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'visibilitychange', expect.any( Function ) );
	} );

	it( 'should call callback when tab becomes visible', () => {
		const callback = jest.fn();
		let visibilityChangeHandler;

		addEventListenerSpy.mockImplementation( ( event, handler ) => {
			if ( 'visibilitychange' === event ) {
				visibilityChangeHandler = handler;
			}
		} );

		renderHook( () => useTabFocus( callback ) );

		expect( callback ).not.toHaveBeenCalled();

		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'visible',
			writable: true,
		} );

		act( () => {
			visibilityChangeHandler();
		} );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not call callback when tab becomes hidden', () => {
		const callback = jest.fn();
		let visibilityChangeHandler;

		addEventListenerSpy.mockImplementation( ( event, handler ) => {
			if ( 'visibilitychange' === event ) {
				visibilityChangeHandler = handler;
			}
		} );

		renderHook( () => useTabFocus( callback ) );

		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'hidden',
			writable: true,
		} );

		act( () => {
			visibilityChangeHandler();
		} );

		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should remove visibilitychange listener on unmount', () => {
		const callback = jest.fn();

		const { unmount } = renderHook( () => useTabFocus( callback ) );

		unmount();

		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'visibilitychange', expect.any( Function ) );
	} );

	it( 'should use the latest callback when callback reference changes', () => {
		const callback1 = jest.fn();
		const callback2 = jest.fn();
		let visibilityChangeHandler;

		addEventListenerSpy.mockImplementation( ( event, handler ) => {
			if ( 'visibilitychange' === event ) {
				visibilityChangeHandler = handler;
			}
		} );

		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'visible',
			writable: true,
		} );

		const { rerender } = renderHook( ( { cb } ) => useTabFocus( cb ), {
			initialProps: { cb: callback1 },
		} );

		act( () => {
			visibilityChangeHandler();
		} );

		expect( callback1 ).toHaveBeenCalledTimes( 1 );

		rerender( { cb: callback2 } );

		act( () => {
			visibilityChangeHandler();
		} );

		expect( callback1 ).toHaveBeenCalledTimes( 1 );
		expect( callback2 ).toHaveBeenCalledTimes( 1 );
	} );
} );
