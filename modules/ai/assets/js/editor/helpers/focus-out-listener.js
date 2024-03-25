import * as React from 'react';

export function FocusOutListener( { children, listener, onFocusOut } ) {
	const { indicatorRef, reset, remove, runAction } = listener;

	React.useEffect( () => {
		reset();

		return remove();
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
					position: 'fixed',
				} }
				onFocus={ remove }
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
	const remove = () => clearTimeout( focusOutTimeout.current );
	const runAction = ( callback ) => {
		focusOutTimeout.current = setTimeout( callback, 250 );
	};

	return {
		indicatorRef,
		reset,
		remove,
		runAction,
	};
}

FocusOutListener.propTypes = {
	children: PropTypes.node,
	listener: PropTypes.object,
	onFocusOut: PropTypes.func,
};
