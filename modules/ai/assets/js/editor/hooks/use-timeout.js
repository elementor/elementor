import { useEffect, useState, useRef } from 'react';

export const useTimeout = ( delay ) => {
	const [ isTimeout, setIsTimeout ] = useState( false );
	const timeoutIdRef = useRef( null );

	const turnOffTimeout = () => {
		clearTimeout( timeoutIdRef.current );
		setIsTimeout( false );
	};

	useEffect( () => {
		timeoutIdRef.current = setTimeout( () => {
			setIsTimeout( true );
		}, delay );

		return () => {
			clearTimeout( timeoutIdRef.current );
		};
	}, [ delay ] );

	return [ isTimeout, turnOffTimeout ];
};
