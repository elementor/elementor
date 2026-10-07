import * as React from 'react';
import { LibraryIcon, LinkIcon, UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled, type SxProps, ThemeProvider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConditionalControlInfotip } from '../components/conditional-control-infotip';

export const SVG_MEDIA_CONTROL_CONTAINER_TEST_ID = 'svg-media-control-container';
export const SVG_MEDIA_ACTION_GROUP_TEST_ID = 'svg-media-action-group';

const SPLIT_BUTTON_PADDING_Y = 1.25;
const SPLIT_BUTTON_PADDING_X = 2.5;
const SPLIT_BUTTON_CORNER_RADIUS = '12px';
const SPLIT_BUTTON_FONT_SIZE = '14px';
const OVERLAY_ACTION_GAP = 2;

const svgButtonSx = {
	px: SPLIT_BUTTON_PADDING_X,
	py: SPLIT_BUTTON_PADDING_Y,
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
	<Stack alignItems="center" gap={ OVERLAY_ACTION_GAP }>
		<MediaActionGroup ref={ buttonGroupRef } direction="row" data-testid={ SVG_MEDIA_ACTION_GROUP_TEST_ID }>
			<Button
				size="tiny"
				color="inherit"
				variant="text"
				onClick={ onSelectSvg }
				aria-label={ __( 'Select', 'elementor' ) }
				sx={ svgButtonSx }
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
				<Box component="span" sx={ { display: 'inline-flex' } }>
					<UploadControl isAdmin={ isAdmin } onUpload={ onUpload } />
				</Box>
			</ConditionalControlInfotip>
		</MediaActionGroup>
		<Button
			color="inherit"
			variant="text"
			startIcon={ <LinkIcon fontSize="small" /> }
			aria-label={ __( 'Insert URL', 'elementor' ) }
			onClick={ onInsertUrl }
			sx={ {
				fontSize: SPLIT_BUTTON_FONT_SIZE,
				fontWeight: 500,
				lineHeight: 1,
				minWidth: 0,
				p: 0.5,
			} }
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
				sx={ {
					fontSize: SPLIT_BUTTON_FONT_SIZE,
					fontWeight: 500,
					lineHeight: 1,
					minWidth: 0,
					p: 0.5,
				} }
			>
				<Typography sx={ { fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' } }>
					{ __( 'Icon library', 'elementor' ) }
				</Typography>
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
		sx={ sx }
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
