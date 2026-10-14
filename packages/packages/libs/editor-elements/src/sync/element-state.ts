import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { getElementTitle } from './get-element-title';
import {
	type ElementStateParam,
	type ElementStateValues,
	type ExtendedWindow,
	type V1ElementModelProps,
} from './types';

const STATE_PARAMS_KEY = 'state_params';
const STATE_KEY = 'state';
const PAGE_STATE_SETTING = 'e_data_flow_static_state';

export type ElementStateScope = {
	elementId: ElementID;
	label: string;
	params: ElementStateParam[];
};

export function getElementStateParams( elementId: ElementID ): ElementStateParam[] {
	return getContainer( elementId )?.model?.get( STATE_PARAMS_KEY ) ?? [];
}

export function getElementState( elementId: ElementID ): ElementStateValues {
	return getContainer( elementId )?.model?.get( STATE_KEY ) ?? {};
}

export function getElementStateParamsInScope( elementId: ElementID ): ElementStateParam[] {
	const params = new Map< string, ElementStateParam >();

	for ( let container = getContainer( elementId ); container; container = container.parent ?? null ) {
		const declared = container.model?.get?.( STATE_PARAMS_KEY ) ?? [];

		declared.forEach( ( param ) => ! params.has( param.key ) && params.set( param.key, param ) );
	}

	getPageStateParams().forEach( ( param ) => ! params.has( param.key ) && params.set( param.key, param ) );

	return [ ...params.values() ];
}

export function getElementStateScopes( elementId: ElementID ): ElementStateScope[] {
	const scopes: ElementStateScope[] = [];

	for ( let container = getContainer( elementId ); container; container = container.parent ?? null ) {
		const params = ( container.model?.get?.( STATE_PARAMS_KEY ) ?? [] ).filter( ( param ) => !! param.exposed );

		if ( params.length ) {
			scopes.push( {
				elementId: container.id,
				label: getElementTitle( container.id ) ?? container.id,
				params,
			} );
		}
	}

	return scopes;
}

function getPageStateParams(): ElementStateParam[] {
	const container = ( window as unknown as ExtendedWindow ).elementor?.documents?.getCurrent?.()?.container;
	const raw = container?.settings?.get?.( PAGE_STATE_SETTING );

	try {
		const parsed = typeof raw === 'string' ? JSON.parse( raw ) : raw;

		return Object.entries( parsed ?? {} ).map( ( [ key, value ] ) => ( {
			key,
			label: key,
			type: typeof value === 'number' ? 'number' : 'string',
			default: value,
		} ) );
	} catch {
		return [];
	}
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
