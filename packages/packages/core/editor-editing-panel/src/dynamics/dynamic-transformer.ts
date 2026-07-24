import { createTransformer } from '@elementor/editor-canvas';
import {
	imageAttachmentIdPropType,
	isTransformable,
	type PropType,
	type Props,
	svgSrcPropTypeUtil,
	urlPropTypeUtil,
} from '@elementor/editor-props';

import { DynamicTagsManagerNotFoundError } from './errors';
import { isDynamicTagSupported } from './utils';

type Dynamic = {
	name?: string;
	settings?: Props;
};

type ImageTagValue = {
	id?: unknown;
	url?: unknown;
};

export const dynamicTransformer = createTransformer< Dynamic >( ( value, { propType, renderContext } ) => {
	if ( ! value?.name || ! isDynamicTagSupported( value.name ) ) {
		return propType?.default ?? null;
	}

	const renderPostId = ( renderContext as { currentPostId?: number } | undefined )?.currentPostId;

	const dynamicValue = getDynamicValue( value.name, simpleTransform( value?.settings ?? {} ), renderPostId );

	if ( dynamicValue instanceof Promise ) {
		return dynamicValue.then( ( resolved ) => maybeWrapAsSvgSrc( resolved, propType ) );
	}

	return maybeWrapAsSvgSrc( dynamicValue, propType );
} );

/**
 * Tags from the image category resolve into an attachment object (`{ id, url }`).
 * When such a tag is bound to an SVG prop, the result is wrapped back into an `svg-src` value,
 * so it will be resolved again by the SVG transformer and rendered as inline SVG markup.
 */
function maybeWrapAsSvgSrc( dynamicValue: unknown, propType?: PropType ) {
	if ( ! isSvgSrcProp( propType ) || ! isImageTagValue( dynamicValue ) ) {
		return dynamicValue;
	}

	const id = Number( dynamicValue.id ) || null;
	const url = typeof dynamicValue.url === 'string' && dynamicValue.url ? dynamicValue.url : null;

	if ( ! id ) {
		return url ? svgSrcPropTypeUtil.create( { id: null, url: urlPropTypeUtil.create( url ) } ) : null;
	}

	return svgSrcPropTypeUtil.create( {
		id: imageAttachmentIdPropType.create( id ),
		url: url ? urlPropTypeUtil.create( url ) : null,
	} );
}

function isSvgSrcProp( propType?: PropType ): boolean {
	return propType?.kind === 'union' && !! propType.prop_types[ svgSrcPropTypeUtil.key ];
}

function isImageTagValue( value: unknown ): value is ImageTagValue {
	return !! value && typeof value === 'object' && ( 'id' in value || 'url' in value );
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
