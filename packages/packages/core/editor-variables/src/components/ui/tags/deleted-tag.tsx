import * as React from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { styled, UnstableTag, type UnstableTagProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const DeletedTag = ( { label }: UnstableTagProps ) => {
	return (
		<StyledTag
			label={ label + __( 'deleted', 'elementor' ) }
			startIcon={ <AlertTriangleFilledIcon fontSize="tiny" /> }
		/>
	);
};

const StyledTag = styled( UnstableTag )( ( { theme } ) => ( {
	background: '#FBF4EB',
	'.MuiTypography-root': {
		color: theme.palette.warning.dark,
	},
	'.MuiSvgIcon-root': {
		color: theme.palette.warning.dark,
	},
} ) );
