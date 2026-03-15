import { notifyElementsRendered } from '../notify-elements-rendered';

describe( 'notifyElementsRendered', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'should dispatch elementor/editor/element-rendered event on window after current call stack', () => {
		// Arrange
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		// Act
		notifyElementsRendered();

		// Assert - not dispatched synchronously
		expect( dispatchSpy ).not.toHaveBeenCalled();

		// Assert - dispatched after setTimeout resolves
		jest.runAllTimers();

		expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );

		const event = dispatchSpy.mock.calls[ 0 ][ 0 ] as CustomEvent;
		expect( event.type ).toBe( 'elementor/editor/element-rendered' );

		dispatchSpy.mockRestore();
	} );
} );
