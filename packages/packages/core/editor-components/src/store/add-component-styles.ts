import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { getComponentIds } from '../utils/get-component-ids';
import { load } from './component-config';
import { selectData, slice } from './components-styles-store';

type ComponentId = number;

export async function addComponentStyles( ids: ComponentId[] ) {
	if ( ids.length === 0 ) {
		return;
	}

	const knownComponents = selectData( getState() );

	const newComponents = await loadComponents( ids.filter( ( id ) => ! knownComponents[ id ] ) );

	addStyles( newComponents );

	const componentIds = newComponents.flatMap( ( [ , data ] ) => getComponentIds( data.elements ?? [] ) );

	if ( componentIds.length ) {
		addComponentStyles( Array.from( new Set( componentIds ) ) );
	}
}

async function loadComponents( ids: number[] ) {
	return Promise.all( ids.map( async ( id ) => [ id, await load( id ) ] as const ) );
}

function addStyles( data: ( readonly [ ComponentId, V1ElementData ] )[] ) {
	const styles = Object.fromEntries(
		data.map( ( [ componentId, componentData ] ) => [ componentId, extractStyles( componentData ) ] )
	);

	dispatch( slice.actions.add( styles ) );
}

function extractStyles( element: V1ElementData ): Array< StyleDefinition > {
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}
