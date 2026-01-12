import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { type ComponentId } from '../../types';
import { selectStyles, slice } from '../store';

export async function loadComponentsStyles( componentIds: number[] ) {
	if ( ! componentIds.length ) {
		return;
	}

	const knownComponents = selectStyles( getState() );
	const unknownComponentIds = componentIds.filter( ( id ) => ! knownComponents[ id ] );

	if ( ! unknownComponentIds.length ) {
		return;
	}

	await addComponentStyles( unknownComponentIds );
}

async function addComponentStyles( ids: ComponentId[] ) {
	const newComponents = await loadStyles( ids );

	addStyles( newComponents );
}

async function loadStyles( ids: number[] ): Promise< [ number, V1ElementData ][] > {
	return Promise.all( ids.map( async ( id ) => [ id, await apiClient.getComponentConfig( id ) ] ) );
}

function addStyles( data: ( readonly [ ComponentId, V1ElementData ] )[] ) {
	const styles = Object.fromEntries(
		data.map( ( [ componentId, componentData ] ) => [ componentId, extractStyles( componentData ) ] )
	);

	dispatch( slice.actions.addStyles( styles ) );
}

function extractStyles( element: V1ElementData ): Array< StyleDefinition > {
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}
