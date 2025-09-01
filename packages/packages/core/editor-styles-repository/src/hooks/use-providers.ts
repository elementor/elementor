import { useEffect, useReducer } from 'react';

import { stylesRepository } from '../styles-repository';

export function useProviders() {
	const [ , rerender ] = useReducer( ( prev ) => ! prev, false );

	useEffect( () => stylesRepository.subscribe( rerender ), [] );

	return stylesRepository.getProviders();
}
