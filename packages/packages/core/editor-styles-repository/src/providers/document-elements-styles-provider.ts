import { type StyleDefinition } from '@elementor/editor-styles';
import {
	getCurrentDocumentId,
	getElements,
	getElementStyles,
	styleRerenderEvents,
	updateElementStyle,
} from '@elementor/editor-elements';
import { __privateListenTo as listenTo } from '@elementor/editor-v1-adapters';

import { ActiveDocumentMustExistError, InvalidElementsStyleProviderMetaError } from '../errors';
import { type StylesCollection } from '../types';
import { createStylesProvider } from '../utils/create-styles-provider';

export const ELEMENTS_STYLES_PROVIDER_KEY_PREFIX = 'document-elements-';
export const ELEMENTS_STYLES_RESERVED_LABEL = 'local';
const PREGENERATED_LINK_PATTERN = /^local-\d+-(preview|frontend)-[a-zA-Z_-]+-css$/;

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
	isPregeneratedLink: ( { id } ) => PREGENERATED_LINK_PATTERN.test( id ),
	subscribe: ( cb ) => {
		let previousStyles = collectAllElementStyles();
		let scheduledFrame: number | null = null;

		const unsubscribe = listenTo( styleRerenderEvents, () => {
			if ( scheduledFrame !== null ) {
				return;
			}

			scheduledFrame = requestAnimationFrame( () => {
				scheduledFrame = null;
				const currentStyles = collectAllElementStyles();
				const snapshot = previousStyles;
				previousStyles = currentStyles;
				cb( snapshot, currentStyles );
			} );
		} );

		return () => {
			if ( scheduledFrame !== null ) {
				cancelAnimationFrame( scheduledFrame );
				scheduledFrame = null;
			}

			unsubscribe();
		};
	},
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

		updateCustomCss: ( args, meta = {} ) => {
			if ( ! isValidElementsMeta( meta ) ) {
				throw new InvalidElementsStyleProviderMetaError( { context: { meta } } );
			}

			updateElementStyle( {
				elementId: meta.elementId,
				styleId: args.id,
				meta: args.meta,
				custom_css: args.custom_css.raw ? args.custom_css : null,
				props: {},
			} );
		},
	},
} );

function isValidElementsMeta( meta: Record< string, unknown > ): meta is ElementsMeta {
	return 'elementId' in meta && typeof meta.elementId === 'string' && !! meta.elementId;
}

function collectAllElementStyles(): StylesCollection {
	const collection: StylesCollection = {};

	for ( const element of getElements() ) {
		const styles = element.model.get( 'styles' ) ?? {};

		for ( const style of Object.values( styles ) as StyleDefinition[] ) {
			collection[ style.id ] = style;
		}
	}

	return collection;
}
