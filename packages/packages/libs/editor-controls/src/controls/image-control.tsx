import * as React from 'react';
import { imagePropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { type MediaType } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';
import { ImageMediaControl } from './image-media-control';
import { SelectControl } from './select-control';

type ImageControlProps = {
	sizes: { label: string; value: string }[];
};

export const ImageControl = createControl( ( { sizes }: ImageControlProps ) => {
	const propContext = useBoundProp( imagePropTypeUtil );

	return (
		<PropProvider { ...propContext }>
			<Stack gap={ 1.5 }>
				<ControlLabel>{ __( 'Image', 'elementor' ) }</ControlLabel>
				<ImageSrcControl />
				<Grid container gap={ 1.5 } alignItems="center" flexWrap="nowrap">
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Resolution', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 } sx={ { overflow: 'hidden' } }>
						<ImageSizeControl sizes={ sizes } />
					</Grid>
				</Grid>
			</Stack>
		</PropProvider>
	);
} );

const ImageSrcControl = () => {
	const { data: allowSvgUpload } = useUnfilteredFilesUpload();
	const mediaTypes: MediaType[] = allowSvgUpload ? [ 'image', 'svg' ] : [ 'image' ];

	return (
		<PropKeyProvider bind={ 'src' }>
			<ImageMediaControl mediaTypes={ mediaTypes } />
		</PropKeyProvider>
	);
};

const ImageSizeControl = ( { sizes }: { sizes: ImageControlProps[ 'sizes' ] } ) => {
	return (
		<PropKeyProvider bind={ 'size' }>
			<SelectControl options={ sizes } />
		</PropKeyProvider>
	);
};
