import * as React from 'react';
import { imagePropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { type MediaType } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';
import { ImageMediaControl } from './image-media-control';
import { SelectControl } from './select-control';

type ImageControlProps = {
	sizes: { label: string; value: string }[];
	resolutionLabel?: string;
	showMode?: 'all' | 'media' | 'sizes';
};

export const ImageControl = createControl(
	( { sizes, resolutionLabel = __( 'Image resolution', 'elementor' ), showMode = 'all' }: ImageControlProps ) => {
		const propContext = useBoundProp( imagePropTypeUtil );

		const { data: allowSvgUpload } = useUnfilteredFilesUpload();
		const mediaTypes: MediaType[] = allowSvgUpload ? [ 'image', 'svg' ] : [ 'image' ];

		return (
			<PropProvider { ...propContext }>
				<Stack gap={ 1.5 }>
					{ [ 'all', 'media' ].includes( showMode ) ? (
						<PropKeyProvider bind={ 'src' }>
							<ControlFormLabel>{ __( 'Image', 'elementor' ) }</ControlFormLabel>
							<ImageMediaControl mediaTypes={ mediaTypes } />
						</PropKeyProvider>
					) : null }
					{ [ 'all', 'sizes' ].includes( showMode ) ? (
						<PropKeyProvider bind={ 'size' }>
							<Grid container gap={ 1.5 } alignItems="center" flexWrap="nowrap">
								<Grid item xs={ 6 }>
									<ControlFormLabel>{ resolutionLabel }</ControlFormLabel>
								</Grid>
								<Grid item xs={ 6 } sx={ { overflow: 'hidden' } }>
									<SelectControl options={ sizes } />
								</Grid>
							</Grid>
						</PropKeyProvider>
					) : null }
				</Stack>
			</PropProvider>
		);
	}
);
