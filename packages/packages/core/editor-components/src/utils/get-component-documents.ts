import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceProp } from '../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from './component-document-data';
import { isComponentInstance } from './is-component-instance';

export type ComponentDocumentsMap = Map< number, Document >;

type ProcessedCache = Map< number, Promise< Document | null > >;

export async function getComponentDocuments(
	elements: V1ElementData[],
	cache: ProcessedCache = new Map()
): Promise< ComponentDocumentsMap > {
	const componentIds = await getComponentIds( elements, cache );

	return getDocumentsMap( componentIds, cache );
}

async function getComponentIds( elements: V1ElementData[], cache: ProcessedCache ): Promise< number[] > {
	const results = await Promise.all(
		elements.map( async ( { widgetType, elType, elements: childElements, settings } ) => {
			const ids: number[] = [];

			if ( isComponentInstance( { widgetType, elType } ) ) {
				const componentId = ( settings?.component_instance as ComponentInstanceProp )?.value?.component_id
					.value;

				if ( ! componentId ) {
					return ids;
				}

				ids.push( componentId );

				if ( ! cache.has( componentId ) ) {
					cache.set( componentId, getComponentDocumentData( componentId ) );
				}

				const doc = await cache.get( componentId );
				childElements = doc?.elements;
			}

			if ( childElements?.length ) {
				const childIds = await getComponentIds( childElements, cache );
				ids.push( ...childIds );
			}

			return ids;
		} )
	);

	return [ ...new Set( results.flat() ) ];
}

async function getDocumentsMap( ids: number[], cache: ProcessedCache ): Promise< ComponentDocumentsMap > {
	const documents = await Promise.all(
		ids.map( async ( id ) => {
			const document = await cache.get( id );

			if ( ! document ) {
				return null;
			}

			return [ id, document ];
		} )
	);

	return new Map( documents.filter( ( document ): document is [ number, Document ] => document !== null ) );
}
