import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ElementStateParam, type ElementStateValues, type V1ElementModelProps } from './types';

const STATE_PARAMS_KEY = 'state_params';
const STATE_KEY = 'state';

export function getElementStateParams( elementId: ElementID ): ElementStateParam[] {
	return getContainer( elementId )?.model?.get( STATE_PARAMS_KEY ) ?? [];
}

export function getElementState( elementId: ElementID ): ElementStateValues {
	return getContainer( elementId )?.model?.get( STATE_KEY ) ?? {};
}

export const updateElementStateParams = ( {
	elementId,
	stateParams,
}: {
	elementId: ElementID;
	stateParams: ElementStateParam[];
} ) => setModelValue( elementId, STATE_PARAMS_KEY, stateParams );

export const updateElementState = ( { elementId, state }: { elementId: ElementID; state: ElementStateValues } ) =>
	setModelValue( elementId, STATE_KEY, state );

function setModelValue< K extends typeof STATE_PARAMS_KEY | typeof STATE_KEY >(
	elementId: ElementID,
	key: K,
	value: V1ElementModelProps[ K ]
) {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	element.model.set( key, value );

	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
}
