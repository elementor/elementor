import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type Element } from '../types';
import { getComponentIds } from '../utils/get-component-ids';
import { load } from './component-config';
import { selectData, slice } from './components-styles-store';

type ComponentId = number;

export async function loadComponentsStyles( elements: Element[] ) {
	const componentIds = Array.from( new Set( getComponentIds( elements ) ) );
	
	if ( ! componentIds.length ) {
		return;
	}
	
	const knownComponents = selectData( getState() );
	const unknownComponentIds = componentIds.filter( ( id ) => ! knownComponents[ id ] );
	
	if ( ! unknownComponentIds.length ) {
		return;
	}

	addComponentStyles( unknownComponentIds );
}

export async function addComponentStyles( ids: ComponentId[] ) {
	const newComponents = await loadComponents( ids );

	addStyles( newComponents );

	Object.values( newComponents ).forEach( ( [ , data ] ) => {
		loadComponentsStyles( data.elements as Element[] );
	} );
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
