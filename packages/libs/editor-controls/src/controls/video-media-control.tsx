import * as React from 'react';
import { videoSrcPropTypeUtil } from '@elementor/editor-props';
import { UploadIcon } from '@elementor/icons';
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack } from '@elementor/ui';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { TILES_GRADIENT_FORMULA } from './svg-media-control';

const PLACEHOLDER_IMAGE = window.elementorCommon?.config?.urls?.assets + '/shapes/play-triangle.svg';

export const VideoMediaControl = createControl( () => {
	const { value, setValue } = useBoundProp( videoSrcPropTypeUtil );
	const { id, url } = value ?? {};

	const { data: attachment, isFetching } = useWpMediaAttachment( id?.value || null );
	const videoUrl = attachment?.url ?? url?.value ?? null;

	const { open } = useWpMediaFrame( {
		mediaTypes: [ 'video' ],
		multiple: false,
		selected: id?.value || null,
		onSelect: ( selectedAttachment ) => {
			setValue( {
				id: {
					$$type: 'video-attachment-id',
					value: selectedAttachment.id,
				},
				url: null,
			} );
		},
	} );

	return (
		<ControlActions>
			<Card variant="outlined">
				<CardMedia
					sx={ {
						height: 140,
						backgroundColor: 'white',
						backgroundSize: '8px 8px',
						backgroundPosition: '0 0, 4px 4px',
						backgroundRepeat: 'repeat',
						backgroundImage: `${ TILES_GRADIENT_FORMULA }, ${ TILES_GRADIENT_FORMULA }`,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					} }
				>
					<VideoPreview isFetching={ isFetching } videoUrl={ videoUrl } />
				</CardMedia>
				<CardOverlay>
					<Stack gap={ 1 }>
						<Button
							size="tiny"
							color="inherit"
							variant="outlined"
							onClick={ () => open( { mode: 'browse' } ) }
						>
							{ __( 'Select video', 'elementor' ) }
						</Button>
						<Button
							size="tiny"
							variant="text"
							color="inherit"
							startIcon={ <UploadIcon /> }
							onClick={ () => open( { mode: 'upload' } ) }
						>
							{ __( 'Upload', 'elementor' ) }
						</Button>
					</Stack>
				</CardOverlay>
			</Card>
		</ControlActions>
	);
} );

const VideoPreview = ( { isFetching = false, videoUrl }: { isFetching?: boolean; videoUrl?: string } ) => {
	if ( isFetching ) {
		return <CircularProgress />;
	}

	if ( videoUrl ) {
		return (
			<video
				src={ videoUrl }
				muted
				preload="metadata"
				style={ {
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					pointerEvents: 'none',
				} }
			/>
		);
	}
	return <img src={ PLACEHOLDER_IMAGE } alt="No video selected" />;
};
