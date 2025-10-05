import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type Element } from '../types';
import { getComponentIds } from '../utils/get-component-ids';
import { selectStyles, slice } from './store';
import { loadStyles } from './thunks';

export async function loadComponentsStyles( elements: Element[] ) {
	const componentIds = Array.from( new Set( getComponentIds( elements ) ) );

	if ( ! componentIds.length ) {
		return;
	}

	const knownComponents = selectStyles( getState() );
	const unknownComponentIds = componentIds.filter( ( id ) => ! knownComponents[ id ] );

	if ( ! unknownComponentIds.length ) {
		return;
	}

	addComponentStyles( unknownComponentIds );
}

export async function addComponentStyles( ids: ComponentId[] ) {
	const newComponents = await loadStyles( ids );

	addStyles( newComponents );

	Object.values( newComponents ).forEach( ( [ , data ] ) => {
		loadComponentsStyles( data.elements as Element[] );
	} );
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
