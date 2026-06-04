import { createTransformer } from '@elementor/editor-canvas';
import { isTransformable, type Props } from '@elementor/editor-props';

import { DynamicTagsManagerNotFoundError } from './errors';
import { isDynamicTagSupported } from './utils';

type Dynamic = {
	name?: string;
	settings?: Props;
};

export const dynamicTransformer = createTransformer< Dynamic >( ( value, { propType, renderContext } ) => {
	if ( ! value?.name || ! isDynamicTagSupported( value.name ) ) {
		return propType?.default ?? null;
	}

	const renderPostId = ( renderContext as { currentPostId?: number } | undefined )?.currentPostId;

	return getDynamicValue( value.name, simpleTransform( value?.settings ?? {} ), renderPostId );
} );

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
		dynamicTags.refreshCacheFromServer(
			() => {
				resolve( getTagValue() );
			},
			{ disableCache: true }
		);
	} );
}
