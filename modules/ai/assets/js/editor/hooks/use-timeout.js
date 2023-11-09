import { useEffect, useState } from 'react';

export const useTimeout = ( delay ) => {
	const [ isTimeout, setIsTimeout ] = useState( false );
	const turnOffTimeout = () => setIsTimeout( false );

	useEffect( () => {
		const timeout = setTimeout( () => {
			setIsTimeout( true );
		}, delay );

		return () => {
			clearTimeout( timeout );
		};
	}, [] );

	return [
		isTimeout,
		turnOffTimeout,
	];
};
