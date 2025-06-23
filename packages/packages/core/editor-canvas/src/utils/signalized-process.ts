// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = ( ...args: any[] ) => any;

type SignalizedProcess< TNextArg = never > = {
	then: < TReturn >(
		cb: ( arg: TNextArg, signal: AbortSignal ) => TReturn
	) => SignalizedProcess< Awaited< TReturn > >;

	execute: () => Promise< void >;
};

export function signalizedProcess< TNextArg = never >(
	signal: AbortSignal,
	steps: AnyFn[] = []
): SignalizedProcess< TNextArg > {
	return {
		then: ( cb ) => {
			steps.push( cb );

			return signalizedProcess( signal, steps );
		},

		execute: async () => {
			let lastResult: TNextArg | undefined;

			for ( const step of steps ) {
				if ( signal.aborted ) {
					break;
				}

				lastResult = await step( lastResult, signal );
			}
		},
	};
}
