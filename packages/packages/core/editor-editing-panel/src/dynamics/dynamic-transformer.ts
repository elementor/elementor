import { createTransformer } from '@elementor/editor-canvas';
import { isTransformable, type Props, type PropType } from '@elementor/editor-props';

import { DynamicTagsManagerNotFoundError } from './errors';
import { isDynamicTagSupported } from './utils';

type Dynamic = {
	name?: string;
	settings?: Props;
};

const SRC_PROP_TYPE_KEYS = [ 'image-src', 'svg-src' ];

export const dynamicTransformer = createTransformer< Dynamic >( ( value, { propType, renderContext } ) => {
	if ( ! value?.name || ! isDynamicTagSupported( value.name ) ) {
		return propType?.default ?? null;
	}

	const renderPostId = ( renderContext as { currentPostId?: number } | undefined )?.currentPostId;

	const dynamicValue = getDynamicValue( value.name, simpleTransform( value?.settings ?? {} ), renderPostId );

	if ( dynamicValue instanceof Promise ) {
		return dynamicValue.then( ( resolved ) => wrapDynamicUrl( resolved, propType ) );
	}

	return wrapDynamicUrl( dynamicValue, propType );
} );

/**
 * Dynamic tags of the URL category resolve into a plain string, while the image & SVG props
 * expect an `{ id, url }` structure. Wrapping the string back into the prop type it is bound
 * to lets the matching transformer resolve it into a usable src.
 * @param value
 * @param propType
 */
function wrapDynamicUrl( value: unknown, propType?: PropType ) {
	if ( typeof value !== 'string' || ! value || propType?.kind !== 'union' ) {
		return value;
	}

	const srcPropTypeKey = SRC_PROP_TYPE_KEYS.find( ( key ) => key in propType.prop_types );

	return srcPropTypeKey ? { $$type: srcPropTypeKey, value: { url: value } } : value;
}

// Temporary naive transformation until we'll have a `backendTransformer` that
// will replace the `dynamicTransformer` client implementation.
function simpleTransform( props: Props ) {
	const transformed = Object.entries( props ).map( ( [ settingKey, settingValue ] ) => {
		const value = isTransformable( settingValue ) ? settingValue.value : settingValue;

		return [ settingKey, value ] as const;
	} );

	return Object.fromEntries( transformed );
}

function getDynamicValue( name: string, settings: Record< string, unknown >, renderPostId?: number ) {
	const { dynamicTags } = window.elementor ?? {};

	if ( ! dynamicTags ) {
		throw new DynamicTagsManagerNotFoundError();
	}

	const getTagValue = () => {
		const tag = dynamicTags.createTag( 'v4-dynamic-tag', name, settings );

		if ( ! tag ) {
			return null;
		}

		if ( renderPostId ) {
			tag.editorRenderPostId = renderPostId;
		}

		return dynamicTags.loadTagDataFromCache( tag ) ?? null;
	};

	const tagValue = getTagValue();

	if ( tagValue !== null ) {
		return tagValue;
	}

	return new Promise( ( resolve ) => {
		dynamicTags.refreshCacheFromServer( () => {
			resolve( getTagValue() );
		} );
	} );
}
