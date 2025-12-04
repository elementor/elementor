import { isDocumentDirty, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';

import { getComponentDocumentData } from '../../utils/component-document-data';
import { getComponentIds } from '../../utils/get-component-ids';
import { loadComponentsOverridableProps } from './load-components-overridable-props';
import { loadComponentsStyles } from './load-components-styles';

export async function loadComponentsAssets( elements: V1ElementData[] ) {
	const componentIds = await getComponentIds( elements );

	updateDocumentState( componentIds );

	loadComponentsOverridableProps( componentIds );

	return loadComponentsStyles( componentIds );
}

async function updateDocumentState( componentIds: number[] ) {
	const components = ( await Promise.all( componentIds.map( getComponentDocumentData ) ) ).filter(
		( document ) => !! document
	);

	const isDrafted = components.some( isDocumentDirty );

	if ( isDrafted ) {
		setDocumentModifiedStatus( true );
	}
}
