import { createTransformer } from '@elementor/editor-canvas';
import { isTransformable, type Props } from '@elementor/editor-props';

import { DynamicTagsManagerNotFoundError } from './errors';
import { type ExtendedWindow } from './types';

type Dynamic = {
	name?: string;
	settings?: Props;
};

export const dynamicTransformer = createTransformer( ( value: Dynamic ) => {
	if ( ! value.name ) {
		return null;
	}

	return getDynamicValue( value.name, simpleTransform( value.settings ?? {} ) );
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

function getDynamicValue( name: string, settings: Record< string, unknown > ) {
	const extendedWindow = window as unknown as ExtendedWindow;
	const { dynamicTags } = extendedWindow.elementor ?? {};

	if ( ! dynamicTags ) {
		throw new DynamicTagsManagerNotFoundError();
	}

	const getTagValue = () => {
		const tag = dynamicTags.createTag( 'v4-dynamic-tag', name, settings );

		if ( ! tag ) {
			return null;
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
