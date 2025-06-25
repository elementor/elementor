import * as React from 'react';
import { ColorFilterIcon } from '@elementor/icons';
import { Box, Typography, UnstableTag as Tag, type UnstableTagProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const DeletedTag = ( { label }: UnstableTagProps ) => {
	return (
		<Tag
			showActionsOnHover
			fullWidth
			label={
				<Box sx={ { display: 'inline-grid', minWidth: 0 } }>
					<Typography sx={ { lineHeight: 1.34 } } variant="caption" noWrap>
						{ label }
					</Typography>
				</Box>
			}
			startIcon={ <ColorFilterIcon fontSize="tiny" /> }
			endAdornment={
				<Typography sx={ { lineHeight: 1.34 } } variant="caption" noWrap>
					({ __( 'deleted', 'elementor' ) })
				</Typography>
			}
		/>
	);
};
