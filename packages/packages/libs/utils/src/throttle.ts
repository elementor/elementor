// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle< TArgs extends any[] >(
	fn: ( ...args: TArgs ) => void,
	wait: number,
	shouldExecuteIgnoredCalls: boolean = false
) {
	let timer: ReturnType< typeof setTimeout > | null = null;
	let ignoredExecution: boolean = false;

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
			ignoredExecution = true;
			return;
		}

		fn( ...args );

		timer = setTimeout( () => {
			timer = null;

			if ( ignoredExecution && shouldExecuteIgnoredCalls ) {
				fn( ...args );
			}

			ignoredExecution = false;
		}, wait );
	};

	const pending = () => !! timer;

	run.flush = flush;
	run.cancel = cancel;
	run.pending = pending;

	return run;
}
