import { useCallback, useState } from 'react';

export const useAutoEdit = () => {
	const [ autoEditVariableId, setAutoEditVariableId ] = useState< string | undefined >( undefined );

	const startAutoEdit = useCallback( ( variableId: string ) => {
		setAutoEditVariableId( variableId );
	}, [] );

	const handleAutoEditComplete = useCallback( () => {
		setTimeout( () => {
			setAutoEditVariableId( undefined );
		}, 100 );
	}, [] );

	return {
		autoEditVariableId,
		startAutoEdit,
		handleAutoEditComplete,
	};
};
