import { useEffect, useReducer } from 'react';

import { useStyle } from '../contexts/style-context';

export const useStylesRerender = () => {
	const { provider } = useStyle();
	const [ , reRender ] = useReducer( ( p ) => ! p, false );

	useEffect( () => provider?.subscribe( reRender ), [ provider ] );
};
