// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle< TArgs extends any[] >( fn: ( ...args: TArgs ) => void, wait: number ) {
	let timer: ReturnType< typeof setTimeout > | null = null;

	const cancel = () => {
		if ( ! timer ) {
			return;
		}

		clearTimeout( timer );
		timer = null;
	};

	const flush = ( ...args: TArgs ) => {
		cancel();

		fn( ...args );
	};

	const run = ( ...args: TArgs ) => {
		if ( timer ) {
			return;
		}

		fn( ...args );

		timer = setTimeout( () => {
			timer = null;
		}, wait );
	};

	const pending = () => !! timer;

	run.flush = flush;
	run.cancel = cancel;
	run.pending = pending;

	return run;
}
