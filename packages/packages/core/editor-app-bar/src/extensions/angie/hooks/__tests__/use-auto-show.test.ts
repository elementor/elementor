import { act, renderHook } from '@testing-library/react';

import { CREATE_WIDGET_EVENT } from '../../angie-consts';
import { useAutoShow } from '../use-auto-show';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;

const setAutoShow = ( value: boolean ) => {
	w.elementor = { config: { angie: { autoShow: value } } };
};

describe( 'useAutoShow', () => {
	let dispatchSpy: jest.SpyInstance;

	beforeEach( () => {
		jest.useFakeTimers();
		dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		jest.useRealTimers();
		dispatchSpy.mockRestore();
		delete w.elementor;
	} );

	it( 'should not dispatch any event when autoShow is false', () => {
		setAutoShow( false );

		renderHook( () => useAutoShow() );
		act( () => jest.runAllTimers() );

		expect( dispatchSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not dispatch any event when elementor config is missing', () => {
		renderHook( () => useAutoShow() );
		act( () => jest.runAllTimers() );

		expect( dispatchSpy ).not.toHaveBeenCalled();
	} );

	it( 'should dispatch CREATE_WIDGET_EVENT with auto_show entry_point when autoShow is true', () => {
		setAutoShow( true );

		renderHook( () => useAutoShow() );
		act( () => jest.runAllTimers() );

		expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );

		const event = dispatchSpy.mock.calls[ 0 ][ 0 ] as CustomEvent;

		expect( event.type ).toBe( CREATE_WIDGET_EVENT );
		expect( event.detail ).toEqual( { entry_point: 'auto_show' } );
	} );
} );
