import { Slice } from '../store';
import { dispatch } from '@elementor/store';
import { ExtendedWindow, ProDocument, ProV1Document } from '../types';
import { commandEndEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

export function syncStore( slice: Slice ) {
	syncInitialization( slice );
	syncOnDocumentOpen( slice );
}

function syncInitialization( slice: Slice ) {
	const { init } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const documentsManager = getV1DocumentsManager();

			const entities = Object.entries( documentsManager.documents )
				.reduce( ( acc: Record<string, ProDocument>, [ id, document ] ) => {
					acc[ id ] = normalizeV1Document( document );

					return acc;
				}, {} );

			dispatch( init( { entities } ) );
		}
	);
}

function syncOnDocumentOpen( slice: Slice ) {
	const { addDocument } = slice.actions;

	listenTo(
		commandEndEvent( 'editor/documents/open' ),
		() => {
			const documentsManager = getV1DocumentsManager();
			const currentDocument = normalizeV1Document( documentsManager.getCurrent() );

			dispatch( addDocument( currentDocument ) );
		}
	);
}

export function getV1DocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function normalizeV1Document( documentData: ProV1Document ): ProDocument {
	return {
		id: documentData.id,
		locationKey: documentData.config.theme_builder?.settings?.location || null,
	};
}
