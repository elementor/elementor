import { useState } from 'react';
import {
	type ElementStateParam,
	type ElementStateValues,
	getElementState,
	getElementStateParams,
	updateElementState,
	updateElementStateParams,
} from '@elementor/editor-elements';

export const useElementStateParams = ( elementId: string ) => {
	const [ stateParams, setStateParams ] = useState< ElementStateParam[] >( () => getElementStateParams( elementId ) );

	const saveStateParams = ( nextStateParams: ElementStateParam[] ) => {
		setStateParams( nextStateParams );
		updateElementStateParams( { elementId, stateParams: nextStateParams } );
	};

	return {
		stateParams,
		updateStateParam: ( index: number, changes: Partial< ElementStateParam > ) =>
			saveStateParams(
				stateParams.map( ( param, paramIndex ) => ( paramIndex === index ? { ...param, ...changes } : param ) )
			),
	};
};

export const useElementStateValues = ( elementId: string ) => {
	const [ state, setState ] = useState< ElementStateValues >( () => getElementState( elementId ) );

	const saveState = ( nextState: ElementStateValues ) => {
		setState( nextState );
		updateElementState( { elementId, state: nextState } );
	};

	return {
		state,
		setValue: ( key: string, value: unknown ) => saveState( { ...state, [ key ]: value } ),
		clearValue: ( key: string ) => {
			const { [ key ]: _cleared, ...nextState } = state;

			saveState( nextState );
		},
	};
};
