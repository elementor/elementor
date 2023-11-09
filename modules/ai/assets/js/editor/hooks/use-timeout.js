import { useEffect, useState } from 'react';

export const useTimeout = ( delay ) => {
	const [ isTimeout, setIsTimeout ] = useState( false );

	const timeout = setTimeout( () => {
		setIsTimeout( true );
	}, delay );

	const turnOffTimeout = () => clearTimeout( timeout );

	useEffect( () => {
		return turnOffTimeout;
	}, [] );

	return [
		isTimeout,
		turnOffTimeout,
	];
};
