const DEFAULT_TIMEOUT = 100;
export default function debounce( func, timeout = DEFAULT_TIMEOUT ) {
	let timer;
	return ( ...args ) => {
		clearTimeout( timer );
		timer = setTimeout( () => {
			func.apply( this, args );
		}, timeout );
	};
}
