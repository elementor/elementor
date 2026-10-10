import * as React from 'react';
import { UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SELECT_AREA_WIDTH = 72;
const UPLOAD_AREA_WIDTH = 48;
const SPLIT_BUTTON_MIN_HEIGHT = 32;
const SPLIT_BUTTON_CORNER_RADIUS = '8px';
const SPLIT_BUTTON_FONT_SIZE = '14px';

const actionButtonSx = {
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

type MediaSelectActionsProps = {
	onSelect: () => void;
	onUpload: () => void;
	onInsertUrl: () => void;
};

export const MediaSelectActions = ( { onSelect, onUpload, onInsertUrl }: MediaSelectActionsProps ) => (
	<Stack alignItems="center" gap={ 1 }>
		<MediaActionGroup direction="row">
			<Button
				size="tiny"
				color="inherit"
				variant="text"
				onClick={ onSelect }
				aria-label={ __( 'Select', 'elementor' ) }
				sx={ { ...actionButtonSx, minWidth: SELECT_AREA_WIDTH } }
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
			<Box component="span" sx={ { display: 'flex', width: UPLOAD_AREA_WIDTH } }>
				<Button
					sx={ { ...actionButtonSx, width: '100%' } }
					size="tiny"
					color="inherit"
					variant="text"
					onClick={ onUpload }
					aria-label={ __( 'Upload', 'elementor' ) }
				>
					<UploadIcon fontSize="small" />
				</Button>
			</Box>
		</MediaActionGroup>
		<Button size="tiny" variant="text" color="inherit" onClick={ onInsertUrl }>
			{ __( 'Insert URL', 'elementor' ) }
		</Button>
	</Stack>
);
