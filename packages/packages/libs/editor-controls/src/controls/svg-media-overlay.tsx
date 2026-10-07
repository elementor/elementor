import * as React from 'react';
import { LibraryIcon, LinkIcon, UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled, type SxProps, ThemeProvider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConditionalControlInfotip } from '../components/conditional-control-infotip';

export const SVG_MEDIA_CONTROL_CONTAINER_TEST_ID = 'svg-media-control-container';
export const SVG_MEDIA_ACTION_GROUP_TEST_ID = 'svg-media-action-group';

const SELECT_AREA_WIDTH = 96;
const UPLOAD_AREA_WIDTH = 64;
const SPLIT_BUTTON_MIN_HEIGHT = 48;
const SPLIT_BUTTON_CORNER_RADIUS = '12px';
const SPLIT_BUTTON_FONT_SIZE = '14px';
const BUTTON_TO_LABEL_GAP = 3;
const LABEL_GAP = 1;

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
	onInsertUrl: () => void;
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
	onInsertUrl,
	onOpenIconLibrary,
	infotipTitle,
	infotipDescription,
}: SvgMediaOverlayProps ) => (
	<Stack alignItems="center" width="100%">
		<MediaActionGroup ref={ buttonGroupRef } direction="row" data-testid={ SVG_MEDIA_ACTION_GROUP_TEST_ID }>
			<Button
				size="tiny"
				color="inherit"
				variant="text"
				onClick={ onSelectSvg }
				aria-label={ __( 'Select', 'elementor' ) }
				sx={ { ...svgButtonSx, width: SELECT_AREA_WIDTH } }
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
		<Stack alignItems="center" gap={ LABEL_GAP } sx={ { mt: BUTTON_TO_LABEL_GAP } }>
			<Button
				color="inherit"
				variant="text"
				startIcon={ <LinkIcon fontSize="small" /> }
				aria-label={ __( 'Insert URL', 'elementor' ) }
				onClick={ onInsertUrl }
				sx={ labelButtonSx }
			>
				<Typography sx={ { fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' } }>
					{ __( 'Insert URL', 'elementor' ) }
				</Typography>
			</Button>
			{ showIconLibrary ? (
				<Button
					color="inherit"
					variant="text"
					startIcon={ <LibraryIcon fontSize="small" /> }
					aria-label={ __( 'Icon library', 'elementor' ) }
					onClick={ onOpenIconLibrary }
					sx={ labelButtonSx }
				>
					<Typography sx={ { fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' } }>
						{ __( 'Icon library', 'elementor' ) }
					</Typography>
				</Button>
			) : null }
		</Stack>
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

const labelButtonSx = {
	fontSize: SPLIT_BUTTON_FONT_SIZE,
	fontWeight: 500,
	lineHeight: 1,
	minWidth: 0,
	p: 0.5,
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
		sx={ { ...svgButtonSx, ...sx, width: '100%' } }
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
