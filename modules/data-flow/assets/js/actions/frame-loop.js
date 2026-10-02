const DEFAULT_DT = 1 / 60;

/**
 * One requestAnimationFrame loop shared by every input. A task returns true while it still needs frames,
 * so the loop goes idle once every value has settled.
 */
export function createFrameLoop( requestFrame = ( callback ) => window.requestAnimationFrame( callback ) ) {
	const tasks = new Set();
	let scheduled = false;
	let lastTime = null;

	const schedule = () => {
		if ( scheduled ) {
			return;
		}

		scheduled = true;
		requestFrame( tick );
	};

	function tick( time ) {
		scheduled = false;

		const dt = null === lastTime ? DEFAULT_DT : ( time - lastTime ) / 1000;
		let active = false;

		lastTime = time;

		tasks.forEach( ( task ) => {
			if ( task( dt ) ) {
				active = true;
			}
		} );

		if ( active ) {
			schedule();
			return;
		}

		lastTime = null;
	}

	return {
		add( task ) {
			tasks.add( task );
			schedule();

			return () => tasks.delete( task );
		},
		wake: schedule,
	};
}
