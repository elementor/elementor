export {};

declare global {
	namespace jest {
		interface Matchers< R > {
			toHaveErrored( expectedMessage?: string | RegExp ): R;
			toHaveWarned( expectedMessage?: string | RegExp ): R;
		}
	}
}

type Msg = string | RegExp;

function makeConsoleMatcher( methodName: 'error' | 'warn' ) {
	return function toHaveConsoleCalled(
		this: jest.MatcherContext,
		receivedSpy: jest.SpyInstance,
		expectedMessage?: Msg
	) {
		const matcherName = methodName === 'error' ? 'toHaveErrored' : 'toHaveWarned';
		const name = methodName === 'error' ? 'console.error' : 'console.warn';

		if ( ! receivedSpy || typeof ( receivedSpy as any ).mock === 'undefined' ) {
			return {
				pass: false,
				message: () =>
					`${ this.utils.matcherHint(
						`.${ matcherName }`
					) }\n\nExpected a Jest spy (e.g. jest.spyOn(console, '${ methodName }')).`,
			};
		}

		const calls: unknown[][] = ( receivedSpy as any ).mock.calls || [];
		const sawAnyCall = calls.length > 0;

		const matchesMessage =
			expectedMessage === undefined
				? true
				: calls.some( ( args ) =>
						args.some( ( arg ) => {
							const s = String( arg );
							return typeof expectedMessage === 'string'
								? s.includes( expectedMessage )
								: expectedMessage instanceof RegExp
								? expectedMessage.test( s )
								: false;
						} )
				  );

		const pass = sawAnyCall && matchesMessage;

		const printedCalls = () =>
			calls
				.map( ( args ) => `(${ args.map( ( a ) => this.utils.printExpected( a ) ).join( ', ' ) })` )
				.join( '\n' );

		return {
			pass,
			message: () => {
				if ( pass ) {
					return `Expected ${ name } not to have been called${
						expectedMessage ? ` with ${ expectedMessage }` : ''
					}, but it was.`;
				}
				if ( ! sawAnyCall ) {
					return `Expected ${ name } to have been called, but it was not.`;
				}
				return `Expected ${ name } to have been called with ${ expectedMessage }, but saw:\n${ printedCalls() }`;
			},
		};
	};
}

expect.extend( {
	toHaveErrored: makeConsoleMatcher( 'error' ),
	toHaveWarned: makeConsoleMatcher( 'warn' ),
} );
