import * as React from 'react';
import { LibraryIcon, UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled, type SxProps, ThemeProvider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConditionalControlInfotip } from '../components/conditional-control-infotip';

export const SVG_MEDIA_CONTROL_CONTAINER_TEST_ID = 'svg-media-control-container';
export const SVG_MEDIA_ACTION_GROUP_TEST_ID = 'svg-media-action-group';

const SELECT_AREA_WIDTH = 72;
const UPLOAD_AREA_WIDTH = 48;
const SPLIT_BUTTON_MIN_HEIGHT = 32;
const SPLIT_BUTTON_CORNER_RADIUS = '8px';
const SPLIT_BUTTON_FONT_SIZE = '14px';
const ICON_LIBRARY_PADDING = 0.625;

const svgButtonSx = {
	minWidth: 0,
	minHeight: SPLIT_BUTTON_MIN_HEIGHT,
	px: 2,
	fontSize: SPLIT_BUTTON_FONT_SIZE,
	fontWeight: 500,
	lineHeight: 1,
};

const MediaActionGroup = styled( Stack )( {
	display: 'inline-flex',
	flexDirection: 'row',
	alignItems: 'stretch',
	border: '1px solid currentColor',
	borderRadius: SPLIT_BUTTON_CORNER_RADIUS,
	overflow: 'hidden',
	'& .MuiButton-root': {
		border: 'none',
		borderRadius: 0,
		lineHeight: 1,
	},
} );

type SvgMediaOverlayProps = {
	isAdmin: boolean;
	showIconLibrary: boolean;
	buttonGroupRef: React.Ref< HTMLDivElement >;
	onSelectSvg: () => void;
	onUpload: () => void;
	onOpenIconLibrary: ( event: React.MouseEvent< HTMLElement > ) => void;
	infotipTitle: string;
	infotipDescription: React.ReactNode;
};

export const SvgMediaOverlay = ( {
	isAdmin,
	showIconLibrary,
	buttonGroupRef,
	onSelectSvg,
	onUpload,
	onOpenIconLibrary,
	infotipTitle,
	infotipDescription,
}: SvgMediaOverlayProps ) => (
	<Stack alignItems="center" gap={ 1 }>
		<MediaActionGroup ref={ buttonGroupRef } direction="row" data-testid={ SVG_MEDIA_ACTION_GROUP_TEST_ID }>
			<Button
				size="tiny"
				color="inherit"
				variant="text"
				onClick={ onSelectSvg }
				aria-label={ __( 'Select', 'elementor' ) }
				sx={ { ...svgButtonSx, minWidth: SELECT_AREA_WIDTH } }
			>
				{ __( 'Select', 'elementor' ) }
			</Button>
			<Box
				sx={ {
					width: '1px',
					alignSelf: 'stretch',
					bgcolor: 'currentColor',
					flexShrink: 0,
				} }
			/>
			<ConditionalControlInfotip
				title={ infotipTitle }
				description={ infotipDescription }
				isEnabled={ ! isAdmin }
			>
				<Box component="span" sx={ { display: 'flex', width: UPLOAD_AREA_WIDTH } }>
					<UploadControl isAdmin={ isAdmin } onUpload={ onUpload } />
				</Box>
			</ConditionalControlInfotip>
		</MediaActionGroup>
		{ showIconLibrary ? (
			<Button
				size="tiny"
				color="inherit"
				variant="text"
				startIcon={ <LibraryIcon sx={ { height: '18px', width: '16px' } } /> }
				aria-label={ __( 'Icon library', 'elementor' ) }
				onClick={ onOpenIconLibrary }
				sx={ {
					height: '28px',
					p: ICON_LIBRARY_PADDING,
					'.MuiButton-icon': { ml: 0 },
				} }
			>
				<Typography>{ __( 'Icon library', 'elementor' ) }</Typography>
			</Button>
		) : null }
	</Stack>
);

const UploadControl = ( { isAdmin, onUpload }: { isAdmin: boolean; onUpload: () => void } ) => {
	if ( isAdmin ) {
		return <UploadButton sx={ svgButtonSx } onClick={ onUpload } />;
	}

	return (
		<ThemeProvider colorScheme="dark">
			<UploadButton disabled sx={ svgButtonSx } />
		</ThemeProvider>
	);
};

const UploadButton = ( {
	disabled = false,
	sx,
	onClick,
}: {
	disabled?: boolean;
	sx?: SxProps;
	onClick?: () => void;
} ) => (
	<Button
		sx={ { ...sx, width: '100%' } }
		size="tiny"
		color="inherit"
		variant="text"
		disabled={ disabled }
		onClick={ onClick }
		aria-label={ __( 'Upload', 'elementor' ) }
	>
		<UploadIcon fontSize="small" />
	</Button>
);
