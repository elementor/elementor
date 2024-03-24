import * as React from 'react';

const FocusOutContext = React.createContext( {} );

export function FocusOutListener( { children, listener, onFocusOut } ) {
	const { indicatorRef, reset, disable, runAction } = listener;

	React.useEffect( () => {
		reset();

		return () => {
			disable();
		};
	}, [] );

	return (
		<>
			{ children }

			<input
				style={ {
					width: 0,
					height: 0,
					padding: 0,
					margin: 0,
					outline: 0,
					border: 0,
					opacity: 0,
				} }
				onFocus={ disable }
				onBlur={ () => runAction( onFocusOut ) }
				ref={ indicatorRef }
			/>
		</>
	);
}

export function useFocusOutListener() {
	const focusOutTimeout = React.useRef( null );
	const indicatorRef = React.useRef( null );

	const reset = () => indicatorRef.current?.focus();
	const disable = () => clearTimeout( focusOutTimeout.current );
	const runAction = ( callback ) => {
		focusOutTimeout.current = setTimeout( callback, 250 );
	};

	return {
		indicatorRef,
		reset,
		disable,
		runAction,
	};
}
