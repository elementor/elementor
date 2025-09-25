import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { getComponentIds } from '../utils/get-component-ids';
import { load } from './component-config';
import { selectData, slice } from './components-styles-store';

type InitialDocumentId = number;

export async function addComponentStyles( ids: InitialDocumentId[] ) {
	if ( ids.length === 0 ) {
		return;
	}

	const data = selectData( getState() );

	const newDocumentsConfigs = await Promise.all(
		ids.filter( ( id ) => ! data[ id ] ).map( async ( id ) => [ id, await load( id ) ] as const )
	);

	const styles = Object.fromEntries(
		newDocumentsConfigs.map( ( [ id, config ] ) => [ id, extractStyles( config ) ] )
	);

	dispatch( slice.actions.add( styles ) );

	const otherComponentIds = newDocumentsConfigs.flatMap( ( [ , config ] ) =>
		getComponentIds( config.elements ?? [] )
	);

	if ( otherComponentIds.length ) {
		addComponentStyles( Array.from( new Set( otherComponentIds ) ) );
	}
}

function extractStyles( element: V1ElementData ): Array< StyleDefinition > {
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}
