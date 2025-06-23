import * as React from 'react';
import { imageSrcPropTypeUtil } from '@elementor/editor-props';
import { UploadIcon } from '@elementor/icons';
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack } from '@elementor/ui';
import { type MediaType, useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type ImageMediaControlProps = {
	mediaTypes?: MediaType[];
};

export const ImageMediaControl = createControl( ( { mediaTypes = [ 'image' ] }: ImageMediaControlProps ) => {
	const { value, setValue } = useBoundProp( imageSrcPropTypeUtil );
	const { id, url } = value ?? {};

	const { data: attachment, isFetching } = useWpMediaAttachment( id?.value || null );
	const src = attachment?.url ?? url?.value ?? null;

	const { open } = useWpMediaFrame( {
		mediaTypes,
		multiple: false,
		selected: id?.value || null,
		onSelect: ( selectedAttachment ) => {
			setValue( {
				id: {
					$$type: 'image-attachment-id',
					value: selectedAttachment.id,
				},
				url: null,
			} );
		},
	} );

	return (
		<ControlActions>
			<Card variant="outlined">
				<CardMedia image={ src } sx={ { height: 150 } }>
					{ isFetching ? (
						<Stack justifyContent="center" alignItems="center" width="100%" height="100%">
							<CircularProgress />
						</Stack>
					) : (
						<></>
					) }
				</CardMedia>
				<CardOverlay>
					<Stack gap={ 1 }>
						<Button
							size="tiny"
							color="inherit"
							variant="outlined"
							onClick={ () => open( { mode: 'browse' } ) }
						>
							{ __( 'Select image', 'elementor' ) }
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
