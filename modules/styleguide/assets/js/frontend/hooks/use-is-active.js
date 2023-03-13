import { useContext, useEffect, useMemo } from 'react';
import { ActiveElementContext } from '../context/active-element';

const useIsActive = ( source, id, ref ) => {
	const context = useContext( ActiveElementContext );
	const isActive = useMemo( () => {
		return context.isActive( id, source );
	}, [ context.isActive ] );

	useEffect( () => {
		if ( isActive ) {
			ref.current.scrollIntoView( { block: 'center', behavior: 'smooth' } );
		}
	}, [ isActive ] );

	return { isActive };
};

export default useIsActive;
