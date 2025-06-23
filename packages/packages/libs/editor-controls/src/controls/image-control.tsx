import * as React from 'react';
import { imagePropTypeUtil } from '@elementor/editor-props';
import { Stack } from '@elementor/ui';
import { type MediaType } from '@elementor/wp-media';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';
import { ImageMediaControl } from './image-media-control';
import { SelectControl } from './select-control';

type ImageControlProps = {
	sizes: { label: string; value: string }[];
	showMode?: 'all' | 'media' | 'sizes';
};

export const ImageControl = createControl( ( { sizes, showMode = 'all' }: ImageControlProps ) => {
	const propContext = useBoundProp( imagePropTypeUtil );

	const { data: allowSvgUpload } = useUnfilteredFilesUpload();
	const mediaTypes: MediaType[] = allowSvgUpload ? [ 'image', 'svg' ] : [ 'image' ];

	return (
		<PropProvider { ...propContext }>
			<Stack gap={ 1.5 }>
				{ [ 'all', 'media' ].includes( showMode ) ? (
					<PropKeyProvider bind={ 'src' }>
						<ImageMediaControl mediaTypes={ mediaTypes } />
					</PropKeyProvider>
				) : null }
				{ [ 'all', 'sizes' ].includes( showMode ) ? (
					<PropKeyProvider bind={ 'size' }>
						<SelectControl options={ sizes } />
					</PropKeyProvider>
				) : null }
			</Stack>
		</PropProvider>
	);
} );
