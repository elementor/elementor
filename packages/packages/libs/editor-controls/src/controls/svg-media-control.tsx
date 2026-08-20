import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { iconPropTypeUtil, svgSrcPropTypeUtil, urlPropTypeUtil } from '@elementor/editor-props';
import { UploadIcon } from '@elementor/icons';
import { Box, Button, Card, CardMedia, CardOverlay, CircularProgress, Stack, styled, ThemeProvider } from '@elementor/ui';
import { type OpenOptions, useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { ConditionalControlInfotip } from '../components/conditional-control-infotip';
import { EnableUnfilteredModal } from '../components/enable-unfiltered-modal';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';
import {
	createIconPropValue,
	enqueueIconFonts,
	type IconLibrarySelection,
	isSvgLibrarySelection,
	openIconLibrary,
} from './open-icon-library';

const TILE_SIZE = 8;
const TILE_WHITE = 'transparent';
const TILE_BLACK = '#c1c1c1';
const ICON_PREVIEW_FONT_SIZE = 50;
export const TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${ TILE_BLACK } 25%, ${ TILE_WHITE } 0, ${ TILE_WHITE } 75%, ${ TILE_BLACK } 0, ${ TILE_BLACK })`;

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

type SvgMediaControlProps = {
	showIconLibrary?: boolean;
};

export const SvgMediaControl = createControl( ( { showIconLibrary = false }: SvgMediaControlProps ) => {
	const { value: svgValue, setValue: setSvgValue } = useBoundProp( svgSrcPropTypeUtil );
	const { value: iconValue, setValue: setIconValue } = useBoundProp( iconPropTypeUtil );
	const id = svgValue?.id;
	const url = svgValue?.url;
	const { data: attachment, isFetching } = useWpMediaAttachment( id?.value || null );
	const src = attachment?.url ?? url?.value ?? null;
	const { data: allowSvgUpload } = useUnfilteredFilesUpload();
	const [ unfilteredModalOpenState, setUnfilteredModalOpenState ] = useState( false );
	const { isAdmin } = useCurrentUserCapabilities();
	const selectedIconClass =
		showIconLibrary && typeof iconValue?.value?.value === 'string' ? iconValue.value.value : null;
	const selectedIconLibrary =
		showIconLibrary && typeof iconValue?.library?.value === 'string' ? iconValue.library.value : null;

	const { open } = useWpMediaFrame( {
		mediaTypes: [ 'svg' ],
		multiple: false,
		selected: id?.value || null,
		onSelect: ( selectedAttachment ) => {
			setSvgValue( {
				id: {
					$$type: 'image-attachment-id',
					value: selectedAttachment.id,
				},
				url: urlPropTypeUtil.create( selectedAttachment.url ),
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

	const handleIconLibrarySelect = ( icon: IconLibrarySelection ) => {
		if ( ! showIconLibrary ) {
			return;
		}
		if ( isSvgLibrarySelection( icon ) ) {
			setSvgValue( {
				id: icon.value.id
					? {
							$$type: 'image-attachment-id',
							value: icon.value.id,
					  }
					: null,
				url: icon.value.url ? urlPropTypeUtil.create( icon.value.url ) : null,
			} );
			return;
		}

		if ( typeof icon.value === 'string' ) {
			setIconValue( createIconPropValue( icon.value, icon.library ) );
		}
	};

	const infotipProps = {
		title: __( "Sorry, you can't upload that file yet.", 'elementor' ),
		description: (
			<>
				{ __( 'To upload them anyway, ask the site administrator to enable unfiltered', 'elementor' ) }
				<br />
				{ __( 'file uploads.', 'elementor' ) }
			</>
		),
		isEnabled: ! isAdmin,
	};

	return (
		<Stack gap={ 1 } aria-label="SVG Control">
			<EnableUnfilteredModal open={ unfilteredModalOpenState } onClose={ onCloseUnfilteredModal } />
			<ControlActions>
				<StyledCard variant="outlined">
					<StyledCardMediaContainer>
						<SvgMediaPreview
							isFetching={ isFetching }
							src={ src }
							iconClassName={ selectedIconClass }
							iconLibrary={ selectedIconLibrary }
						/>
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
								aria-label="Select SVG"
							>
								{ __( 'Select SVG', 'elementor' ) }
							</Button>
							{ showIconLibrary ? (
								<Button
									size="tiny"
									variant="text"
									color="inherit"
									onClick={ () =>
										openIconLibrary( {
											selected:
												selectedIconClass && selectedIconLibrary
													? { value: selectedIconClass, library: selectedIconLibrary }
													: undefined,
											onSelect: handleIconLibrarySelect,
										} )
									}
									aria-label={ __( 'Icon library', 'elementor' ) }
								>
									{ __( 'Icon library', 'elementor' ) }
								</Button>
							) : null }
							<ConditionalControlInfotip { ...infotipProps }>
								<span>
									<ThemeProvider colorScheme={ isAdmin ? 'light' : 'dark' }>
										<Button
											size="tiny"
											variant="text"
											color="inherit"
											startIcon={ <UploadIcon /> }
											disabled={ ! isAdmin }
											onClick={ () => isAdmin && handleClick( MODE_UPLOAD ) }
											aria-label="Upload SVG"
										>
											{ __( 'Upload', 'elementor' ) }
										</Button>
									</ThemeProvider>
								</span>
							</ConditionalControlInfotip>
						</Stack>
					</CardOverlay>
				</StyledCard>
			</ControlActions>
		</Stack>
	);
} );

function SvgMediaPreview( {
	isFetching,
	src,
	iconClassName,
	iconLibrary,
}: {
	isFetching: boolean;
	src: string | null;
	iconClassName: string | null;
	iconLibrary: string | null;
} ) {
	useEffect( () => {
		if ( iconLibrary ) {
			enqueueIconFonts( iconLibrary );
		}
	}, [ iconLibrary ] );

	if ( isFetching ) {
		return <CircularProgress role="progressbar" />;
	}

	if ( iconClassName ) {
		return (
			<Box
				component="i"
				className={ iconClassName }
				aria-label={ __( 'Preview icon', 'elementor' ) }
				sx={ { fontSize: ICON_PREVIEW_FONT_SIZE } }
			/>
		);
	}

	return (
		<CardMedia
			component="img"
			image={ src }
			alt={ __( 'Preview SVG', 'elementor' ) }
			sx={ { maxHeight: '140px', width: `${ ICON_PREVIEW_FONT_SIZE }px` } }
		/>
	);
}
