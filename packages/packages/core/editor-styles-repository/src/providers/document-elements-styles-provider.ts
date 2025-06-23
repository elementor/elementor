import {
	getCurrentDocumentId,
	getElements,
	getElementStyles,
	styleRerenderEvents,
	updateElementStyle,
} from '@elementor/editor-elements';
import { __privateListenTo as listenTo } from '@elementor/editor-v1-adapters';

import { ActiveDocumentMustExistError, InvalidElementsStyleProviderMetaError } from '../errors';
import { createStylesProvider } from '../utils/create-styles-provider';

export const ELEMENTS_STYLES_PROVIDER_KEY_PREFIX = 'document-elements-';
export const ELEMENTS_STYLES_RESERVED_LABEL = 'local';

type ElementsMeta = {
	elementId: string;
};

export const documentElementsStylesProvider = createStylesProvider( {
	key: () => {
		const documentId = getCurrentDocumentId();

		if ( ! documentId ) {
			throw new ActiveDocumentMustExistError();
		}

		return `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }${ documentId }`;
	},
	priority: 50,
	subscribe: ( cb ) => listenTo( styleRerenderEvents, cb ),
	actions: {
		all: ( meta = {} ) => {
			let elements = getElements();

			if ( isValidElementsMeta( meta ) ) {
				elements = elements.filter( ( element ) => element.id === meta.elementId );
			}

			return elements.flatMap( ( element ) => Object.values( element.model.get( 'styles' ) ?? {} ) );
		},

		get: ( id, meta = {} ) => {
			if ( ! isValidElementsMeta( meta ) ) {
				throw new InvalidElementsStyleProviderMetaError( { context: { meta } } );
			}

			const styles = getElementStyles( meta.elementId ) ?? {};

			return styles[ id ] ?? null;
		},

		updateProps: ( args, meta = {} ) => {
			if ( ! isValidElementsMeta( meta ) ) {
				throw new InvalidElementsStyleProviderMetaError( { context: { meta } } );
			}

			updateElementStyle( {
				elementId: meta.elementId,
				styleId: args.id,
				meta: args.meta,
				props: args.props,
			} );
		},
	},
} );

function isValidElementsMeta( meta: Record< string, unknown > ): meta is ElementsMeta {
	return 'elementId' in meta && typeof meta.elementId === 'string' && !! meta.elementId;
}
