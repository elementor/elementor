import { debounce } from '../debounce';

describe( 'debounce', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	it( 'should debounce a function', () => {
		// Arrange.
		let value = 0;

		const fn = () => value++;

		// Act.
		const debouncedFn = debounce( fn, 100 );

		debouncedFn();
		debouncedFn();
		debouncedFn();

		jest.runAllTimers();

		// Assert.
		expect( value ).toBe( 1 );
	} );

	it( 'should cancel a debounced function', () => {
		// Arrange.
		let value = 0;

		const fn = () => value++;

		// Act.
		const debouncedFn = debounce( fn, 100 );

		debouncedFn();

		debouncedFn.cancel();

		jest.runAllTimers();

		// Assert.
		expect( value ).toBe( 0 );
		expect( debouncedFn.pending() ).toBe( false );
	} );

	it( 'should flush a debounced function', () => {
		// Arrange.
		let value = 0;

		const fn = () => value++;

		// Act.
		const debouncedFn = debounce( fn, 100 );

		debouncedFn();

		debouncedFn.flush();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		jest.runAllTimers();

		// Assert - Ensure the timer was cancelled.
		expect( value ).toBe( 1 );
	} );

	it( 'should determine if the function is pending', () => {
		// Arrange.
		const debouncedFn = debounce( () => null, 100 );

		// Assert.
		expect( debouncedFn.pending() ).toBe( false );

		// Act.
		debouncedFn();

		// Assert.
		expect( debouncedFn.pending() ).toBe( true );

		// Act.
		jest.runAllTimers();

		// Assert.
		expect( debouncedFn.pending() ).toBe( false );
	} );
} );
