import { useState } from 'react';

import { type ConflictStrategy } from '../types';

export type DialogState = {
	file: File | null;
	conflictStrategy: ConflictStrategy | null;
};

const initialState: DialogState = {
	file: null,
	conflictStrategy: null,
};

export const useDialogState = () => {
	const [ state, setState ] = useState< DialogState >( initialState );

	const setFile = ( file: File | null ) => setState( ( prev ) => ( { ...prev, file } ) );

	const setConflictStrategy = ( conflictStrategy: ConflictStrategy ) =>
		setState( ( prev ) => ( { ...prev, conflictStrategy } ) );

	return { state, setFile, setConflictStrategy };
};
