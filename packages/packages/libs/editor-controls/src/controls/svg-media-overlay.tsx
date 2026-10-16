import * as React from 'react';
import { LibraryIcon } from '@elementor/icons';
import { Box, Button, Stack, ThemeProvider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConditionalControlInfotip } from '../components/conditional-control-infotip';
import { MediaActionGroup, MediaUploadButton } from './media-select-actions';

export const SVG_MEDIA_CONTROL_CONTAINER_TEST_ID = 'svg-media-control-container';
export const SVG_MEDIA_ACTION_GROUP_TEST_ID = 'svg-media-action-group';

const ICON_LIBRARY_PADDING = 0.625;

type SvgMediaOverlayProps = {
	label: string;
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
	label,
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
		<MediaActionGroup
			label={ label }
			onSelect={ onSelectSvg }
			groupRef={ buttonGroupRef }
			testId={ SVG_MEDIA_ACTION_GROUP_TEST_ID }
			uploadSlot={
				<ConditionalControlInfotip
					title={ infotipTitle }
					description={ infotipDescription }
					isEnabled={ ! isAdmin }
				>
					<Box component="span" sx={ { display: 'flex', width: '100%' } }>
						<UploadControl isAdmin={ isAdmin } onUpload={ onUpload } />
					</Box>
				</ConditionalControlInfotip>
			}
		/>
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
		return <MediaUploadButton onClick={ onUpload } />;
	}

	return (
		<ThemeProvider colorScheme="dark">
			<MediaUploadButton disabled />
		</ThemeProvider>
	);
};
