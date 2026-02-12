import * as React from 'react';
import { videoSrcPropTypeUtil } from '@elementor/editor-props';
import { UploadIcon } from '@elementor/icons';
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack, Typography } from '@elementor/ui';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

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

	const renderMediaContent = () => {
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

		return (
			<Typography variant="caption" color="text.secondary">
				{ __( 'No video selected', 'elementor' ) }
			</Typography>
		);
	};

	return (
		<ControlActions>
			<Card variant="outlined">
				<CardMedia
					sx={ {
						height: 100,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'action.hover',
					} }
				>
					{ renderMediaContent() }
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
