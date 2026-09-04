import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { iconPropTypeUtil, svgSrcPropTypeUtil, urlPropTypeUtil } from '@elementor/editor-props';
import { Box, Card, CardOverlay, Popover, Stack, styled, usePopupState } from '@elementor/ui';
import { type OpenOptions, useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { EnableUnfilteredModal } from '../components/enable-unfiltered-modal';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { useUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';
import { getIconLibraryAnchor } from './icon-library/get-icon-library-anchor';
import { ICON_LIBRARY_POPOVER_WIDTH, IconLibraryPopover } from './icon-library/icon-library-popover';
import { createIconPropValue } from './open-icon-library';
import { SVG_MEDIA_CONTROL_CONTAINER_TEST_ID, SvgMediaOverlay } from './svg-media-overlay';
import { SvgMediaPreview } from './svg-media-preview';

const TILE_SIZE = 8;
const TILE_WHITE = 'transparent';
const TILE_BLACK = '#c1c1c1';
export const TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${ TILE_BLACK } 25%, ${ TILE_WHITE } 0, ${ TILE_WHITE } 75%, ${ TILE_BLACK } 0, ${ TILE_BLACK })`;

const StyledCard = styled( Card )`
	position: relative;
	background-color: white;
	background-image: ${ TILES_GRADIENT_FORMULA }, ${ TILES_GRADIENT_FORMULA };
	background-size: ${ TILE_SIZE }px ${ TILE_SIZE }px;
	background-position:
		0 0,
		${ TILE_SIZE / 2 }px ${ TILE_SIZE / 2 }px;
	border: none;
`;

const PREVIEW_ICON_COLOR = '#000000';

const StyledCardMediaContainer = styled( Stack )`
	position: relative;
	height: 140px;
	object-fit: contain;
	padding: 5px;
	justify-content: center;
	align-items: center;
	background-color: rgba( 255, 255, 255, 0.37 );
	color: ${ PREVIEW_ICON_COLOR };
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
	const iconLibraryPopoverState = usePopupState( { variant: 'popover' } );
	const controlContainerRef = useRef< HTMLDivElement >( null );
	const buttonGroupRef = useRef< HTMLDivElement >( null );
	const [ iconLibraryAnchor, setIconLibraryAnchor ] = useState< ReturnType< typeof getIconLibraryAnchor > >( null );
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

	const closeIconLibrary = () => {
		iconLibraryPopoverState.close();
		setIconLibraryAnchor( null );
	};

	const handleIconLibrarySelect = ( icon: { value: string; library: string } ) => {
		setIconValue( createIconPropValue( icon.value, icon.library ) );
		closeIconLibrary();
	};

	const openIconLibraryPopover = ( event: React.MouseEvent< HTMLElement > ) => {
		const anchor = getIconLibraryAnchor(
			controlContainerRef.current?.getBoundingClientRect(),
			buttonGroupRef.current?.getBoundingClientRect()
		);

		if ( ! anchor ) {
			return;
		}

		setIconLibraryAnchor( anchor );
		iconLibraryPopoverState.open( event );
	};

	useEffect( () => {
		if ( ! iconLibraryPopoverState.isOpen ) {
			return;
		}

		const updateAnchor = () => {
			const nextAnchor = getIconLibraryAnchor(
				controlContainerRef.current?.getBoundingClientRect(),
				buttonGroupRef.current?.getBoundingClientRect()
			);

			if ( nextAnchor ) {
				setIconLibraryAnchor( nextAnchor );
			}
		};

		window.addEventListener( 'resize', updateAnchor );

		return () => {
			window.removeEventListener( 'resize', updateAnchor );
		};
	}, [ iconLibraryPopoverState.isOpen ] );

	const iconLibraryWidth = iconLibraryAnchor?.width ?? ICON_LIBRARY_POPOVER_WIDTH;

	return (
		<Stack gap={ 1 } aria-label="SVG Control">
			<EnableUnfilteredModal open={ unfilteredModalOpenState } onClose={ onCloseUnfilteredModal } />
			{ showIconLibrary && iconLibraryAnchor ? (
				<Popover
					disableScrollLock
					open={ iconLibraryPopoverState.isOpen }
					onClose={ closeIconLibrary }
					anchorReference="anchorPosition"
					anchorPosition={ { top: iconLibraryAnchor.top, left: iconLibraryAnchor.left } }
					anchorOrigin={ { vertical: 'top', horizontal: 'left' } }
					transformOrigin={ { vertical: 'top', horizontal: 'left' } }
					marginThreshold={ 0 }
					PaperProps={ {
						sx: {
							width: iconLibraryWidth,
							minWidth: iconLibraryWidth,
							maxWidth: iconLibraryWidth,
							m: 0,
						},
					} }
				>
					<IconLibraryPopover
						open={ iconLibraryPopoverState.isOpen }
						selectedIconClass={ selectedIconClass }
						selectedIconLibrary={ selectedIconLibrary }
						onSelect={ handleIconLibrarySelect }
						onClose={ closeIconLibrary }
						width={ iconLibraryWidth }
					/>
				</Popover>
			) : null }
			<Box
				ref={ controlContainerRef }
				data-testid={ SVG_MEDIA_CONTROL_CONTAINER_TEST_ID }
				sx={ { width: '100%' } }
			>
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
							<SvgMediaOverlay
								isAdmin={ isAdmin }
								showIconLibrary={ showIconLibrary }
								buttonGroupRef={ buttonGroupRef }
								onSelectSvg={ () => handleClick( MODE_BROWSE ) }
								onUpload={ () => handleClick( MODE_UPLOAD ) }
								onOpenIconLibrary={ openIconLibraryPopover }
								infotipTitle={ __( "Sorry, you can't upload that file yet.", 'elementor' ) }
								infotipDescription={
									<>
										{ __(
											'To upload them anyway, ask the site administrator to enable unfiltered',
											'elementor'
										) }
										<br />
										{ __( 'file uploads.', 'elementor' ) }
									</>
								}
							/>
						</CardOverlay>
					</StyledCard>
				</ControlActions>
			</Box>
		</Stack>
	);
} );
