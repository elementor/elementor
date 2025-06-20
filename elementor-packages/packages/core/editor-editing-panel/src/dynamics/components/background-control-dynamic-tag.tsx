import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	backgroundImageOverlayPropTypeUtil,
	type BackgroundOverlayImagePropType,
	type BackgroundOverlayPropType,
	type ObjectPropType,
	type UnionPropType,
} from '@elementor/editor-props';
import { DatabaseIcon } from '@elementor/icons';

import { useDynamicTag } from '../hooks/use-dynamic-tag';

// Since this is injected, the initial prop provider does not dig into the nested structure of the value.
// We need to synthetically create a type that matches the expected structure of the value.

export const BackgroundControlDynamicTagIcon = () => <DatabaseIcon fontSize="tiny" />;

export const BackgroundControlDynamicTagLabel = ( { value }: { value: BackgroundOverlayPropType } ) => {
	const context = useBoundProp( backgroundImageOverlayPropTypeUtil );

	return (
		<PropProvider { ...context } value={ value.value }>
			<PropKeyProvider bind="image">
				<Wrapper rawValue={ value.value } />
			</PropKeyProvider>
		</PropProvider>
	);
};

const Wrapper = ( { rawValue }: { rawValue: BackgroundOverlayPropType[ 'value' ] } ) => {
	const { propType } = useBoundProp< BackgroundOverlayPropType, UnionPropType >();

	const imageOverlayPropType = propType.prop_types[ 'background-image-overlay' ] as ObjectPropType;
	return (
		<PropProvider propType={ imageOverlayPropType.shape.image } value={ rawValue } setValue={ () => void 0 }>
			<PropKeyProvider bind="src">
				<Content rawValue={ rawValue.image } />
			</PropKeyProvider>
		</PropProvider>
	);
};

const Content = ( { rawValue }: { rawValue: BackgroundOverlayImagePropType } ) => {
	const src = rawValue.value.src;
	const dynamicTag = useDynamicTag( src.value.name || '' );
	return <React.Fragment>{ dynamicTag?.label }</React.Fragment>;
};
