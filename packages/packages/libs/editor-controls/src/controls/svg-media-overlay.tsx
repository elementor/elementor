import * as React from 'react';
import { LibraryIcon, UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled, type SxProps, ThemeProvider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConditionalControlInfotip } from '../components/conditional-control-infotip';

export const SVG_MEDIA_CONTROL_CONTAINER_TEST_ID = 'svg-media-control-container';
export const SVG_MEDIA_ACTION_GROUP_TEST_ID = 'svg-media-action-group';

const MEDIA_ACTION_PADDING_Y = 0.75;
const MEDIA_ACTION_PADDING_X = 2;
const ICON_LIBRARY_PADDING = 0.625;

const svgButtonSx = {
	px: MEDIA_ACTION_PADDING_X,
	py: MEDIA_ACTION_PADDING_Y,
};

const MediaActionGroup = styled( Stack )( ( { theme } ) => ( {
	display: 'inline-flex',
	flexDirection: 'row',
	alignItems: 'stretch',
	border: '1px solid currentColor',
	borderRadius: theme.shape.borderRadius,
	overflow: 'hidden',
	'& .MuiButton-root': {
		border: 'none',
		borderRadius: 0,
		lineHeight: 1,
	},
} ) );

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

export function SvgMediaOverlay( {
	isAdmin,
	showIconLibrary,
	buttonGroupRef,
	onSelectSvg,
	onUpload,
	onOpenIconLibrary,
	infotipTitle,
	infotipDescription,
}: SvgMediaOverlayProps ) {
	return (
		<Stack alignItems="center" gap={ 1 }>
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
					<Box component="span" sx={ { display: 'inline-flex' } } onClick={ () => isAdmin && onUpload() }>
						{ isAdmin ? (
							<UploadButton sx={ svgButtonSx } />
						) : (
							<ThemeProvider colorScheme="dark">
								<UploadButton disabled sx={ svgButtonSx } />
							</ThemeProvider>
						) }
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
}

function UploadButton( { disabled = false, sx }: { disabled?: boolean; sx?: SxProps } ) {
	return (
		<Button
			sx={ sx }
			size="tiny"
			color="inherit"
			variant="text"
			disabled={ disabled }
			aria-label={ __( 'Upload', 'elementor' ) }
		>
			<UploadIcon />
		</Button>
	);
}
