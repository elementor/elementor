import { throttle } from '../throttle';

describe( 'throttle', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	it( 'should execute only once per time window', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;

		const fn = () => value++;

		// Act.
		const throttledFn = throttle( fn, waitTime );

		throttledFn();
		throttledFn();
		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		jest.advanceTimersByTime( 100 );

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		throttledFn();

		// Assert.
		expect( value ).toBe( 2 );

		// Act.
		throttledFn();
		throttledFn();

		// Assert.
		expect( value ).toBe( 2 );
	} );

	it( 'should respect time window boundaries at 99ms, 100ms, and 101ms', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;

		const fn = () => value++;

		// Act.
		const throttledFn = throttle( fn, waitTime );

		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		jest.advanceTimersByTime( 99 );
		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );
		expect( throttledFn.pending() ).toBe( true );

		// Act.
		jest.advanceTimersByTime( 1 );

		// Assert.
		expect( value ).toBe( 1 );
		expect( throttledFn.pending() ).toBe( false );

		// Act.
		throttledFn();

		// Assert.
		expect( value ).toBe( 2 );

		// Act.
		jest.advanceTimersByTime( 101 );

		// Assert.
		expect( value ).toBe( 2 );
		expect( throttledFn.pending() ).toBe( false );

		// Act.
		throttledFn();

		// Assert.
		expect( value ).toBe( 3 );
		expect( throttledFn.pending() ).toBe( true );
	} );

	it( 'should cancel a throttled function', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;

		const fn = () => value++;

		// Act.
		const throttledFn = throttle( fn, waitTime );

		throttledFn();

		throttledFn.cancel();

		jest.runAllTimers();

		// Assert.
		expect( value ).toBe( 1 );
		expect( throttledFn.pending() ).toBe( false );
	} );

	it( 'should flush a throttled function', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;

		const fn = () => value++;

		// Act.
		const throttledFn = throttle( fn, waitTime );

		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		throttledFn.flush();

		// Assert.
		expect( value ).toBe( 2 );

		// Act.
		jest.runAllTimers();

		// Assert.
		expect( value ).toBe( 2 );
	} );

	it( 'should determine if the function is pending', () => {
		// Arrange.
		const waitTime = 100;
		const throttledFn = throttle( () => null, waitTime );

		// Assert.
		expect( throttledFn.pending() ).toBe( false );

		// Act.
		throttledFn();

		// Assert.
		expect( throttledFn.pending() ).toBe( true );

		// Act.
		jest.runAllTimers();

		// Assert.
		expect( throttledFn.pending() ).toBe( false );
	} );

	it( 'should execute ignored calls on timeout when shouldExecuteIgnoredCalls is true', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;
		const fn = () => value++;
		const shouldExecuteIgnoredCalls = true;

		// Act.
		const throttledFn = throttle( fn, waitTime, shouldExecuteIgnoredCalls );

		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		throttledFn();
		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		jest.advanceTimersByTime( 100 );

		// Assert.
		expect( value ).toBe( 2 );
	} );

	it( 'should not execute on timeout when shouldExecuteIgnoredCalls is true but no calls were ignored', () => {
		// Arrange.
		const waitTime = 100;
		let value = 0;
		const fn = () => value++;
		const shouldExecuteIgnoredCalls = true;

		// Act.
		const throttledFn = throttle( fn, waitTime, shouldExecuteIgnoredCalls );

		throttledFn();

		// Assert.
		expect( value ).toBe( 1 );

		// Act.
		jest.advanceTimersByTime( 100 );

		// Assert.
		expect( value ).toBe( 1 );
	} );
} );
