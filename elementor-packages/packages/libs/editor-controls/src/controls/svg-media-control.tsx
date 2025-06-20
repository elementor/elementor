import * as React from 'react';
import { useState } from 'react';
import { imageSrcPropTypeUtil } from '@elementor/editor-props';
import { UploadIcon } from '@elementor/icons';
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack, styled } from '@elementor/ui';
import { type OpenOptions, useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { EnableUnfilteredModal } from '../components/enable-unfiltered-modal';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';

const TILE_SIZE = 8;
const TILE_WHITE = 'transparent';
const TILE_BLACK = '#c1c1c1';
const TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${ TILE_BLACK } 25%, ${ TILE_WHITE } 0, ${ TILE_WHITE } 75%, ${ TILE_BLACK } 0, ${ TILE_BLACK })`;

const StyledCard = styled( Card )`
	background-color: white;
	background-image: ${ TILES_GRADIENT_FORMULA }, ${ TILES_GRADIENT_FORMULA };
	background-size: ${ TILE_SIZE }px ${ TILE_SIZE }px;
	background-position:
		0 0,
		${ TILE_SIZE / 2 }px ${ TILE_SIZE / 2 }px;
	border: none;
`;

const StyledCardMediaContainer = styled( Stack )`
	position: relative;
	height: 140px;
	object-fit: contain;
	padding: 5px;
	justify-content: center;
	align-items: center;
	background-color: rgba( 255, 255, 255, 0.37 );
`;

const MODE_BROWSE: OpenOptions = { mode: 'browse' };
const MODE_UPLOAD: OpenOptions = { mode: 'upload' };

export const SvgMediaControl = createControl( () => {
	const { value, setValue } = useBoundProp( imageSrcPropTypeUtil );
	const { id, url } = value ?? {};
	const { data: attachment, isFetching } = useWpMediaAttachment( id?.value || null );
	const src = attachment?.url ?? url?.value ?? null;
	const { data: allowSvgUpload } = useUnfilteredFilesUpload();
	const [ unfilteredModalOpenState, setUnfilteredModalOpenState ] = useState( false );

	const { open } = useWpMediaFrame( {
		mediaTypes: [ 'svg' ],
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

	const onCloseUnfilteredModal = ( enabled: boolean ) => {
		setUnfilteredModalOpenState( false );

		if ( enabled ) {
			open( MODE_UPLOAD );
		}
	};

	const handleClick = ( openOptions?: OpenOptions ) => {
		if ( ! allowSvgUpload && openOptions === MODE_UPLOAD ) {
			setUnfilteredModalOpenState( true );
		} else {
			open( openOptions );
		}
	};

	return (
		<Stack gap={ 1 }>
			<EnableUnfilteredModal open={ unfilteredModalOpenState } onClose={ onCloseUnfilteredModal } />
			<ControlFormLabel> { __( 'SVG', 'elementor' ) } </ControlFormLabel>
			<ControlActions>
				<StyledCard variant="outlined">
					<StyledCardMediaContainer>
						{ isFetching ? (
							<CircularProgress role="progressbar" />
						) : (
							<CardMedia
								component="img"
								image={ src }
								alt={ __( 'Preview SVG', 'elementor' ) }
								sx={ { maxHeight: '140px', width: '50px' } }
							/>
						) }
					</StyledCardMediaContainer>
					<CardOverlay
						sx={ {
							'&:hover': {
								backgroundColor: 'rgba( 0, 0, 0, 0.75 )',
							},
						} }
					>
						<Stack gap={ 1 }>
							<Button
								size="tiny"
								color="inherit"
								variant="outlined"
								onClick={ () => handleClick( MODE_BROWSE ) }
							>
								{ __( 'Select SVG', 'elementor' ) }
							</Button>
							<Button
								size="tiny"
								variant="text"
								color="inherit"
								startIcon={ <UploadIcon /> }
								onClick={ () => handleClick( MODE_UPLOAD ) }
							>
								{ __( 'Upload', 'elementor' ) }
							</Button>
						</Stack>
					</CardOverlay>
				</StyledCard>
			</ControlActions>
		</Stack>
	);
} );
