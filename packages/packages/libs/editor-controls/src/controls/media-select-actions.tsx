import * as React from 'react';
import { UploadIcon } from '@elementor/icons';
import { Box, Button, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const MEDIA_ACTION_PADDING_Y = 0.75;
const MEDIA_ACTION_PADDING_X = 2;

const actionButtonSx = {
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
				sx={ actionButtonSx }
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
			<Button
				sx={ actionButtonSx }
				size="tiny"
				color="inherit"
				variant="text"
				onClick={ onUpload }
				aria-label={ __( 'Upload', 'elementor' ) }
			>
				<UploadIcon />
			</Button>
		</MediaActionGroup>
		<Button size="tiny" variant="text" color="inherit" onClick={ onInsertUrl }>
			{ __( 'Insert URL', 'elementor' ) }
		</Button>
	</Stack>
);
