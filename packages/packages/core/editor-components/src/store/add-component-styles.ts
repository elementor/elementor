import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type DocumentElement, type Element } from '../types';
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

	const styles = newDocumentsConfigs.map(
		( [ id, config ] ) => [ id, extractStyles( config as DocumentElement ) ] as const
	);

	if ( styles.length ) {
		dispatch( slice.actions.add( Object.fromEntries( styles ) ) );
	}

	const otherComponentIds = newDocumentsConfigs.flatMap( ( [ , config ] ) =>
		getComponentIds( config.elements as Element[] )
	);

	if ( otherComponentIds.length ) {
		addComponentStyles( Array.from( new Set( otherComponentIds ) ) );
	}
}

function extractStyles( element: DocumentElement ): Array< StyleDefinition > {
	return [
		...Object.values( element.styles ?? {} ),
		...( ( element.elements ?? [] ) as DocumentElement[] ).flatMap( extractStyles ),
	];
}
