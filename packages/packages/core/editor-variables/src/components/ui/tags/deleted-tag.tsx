import * as React from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { Box, Chip, type ChipProps, type Theme, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const DeletedTag = React.forwardRef< HTMLDivElement, ChipProps >( ( { label, onClick, ...props }, ref ) => {
	return (
		<Chip
			ref={ ref }
			size="tiny"
			color="warning"
			shape="rounded"
			variant="standard"
			onClick={ onClick }
			icon={ <AlertTriangleFilledIcon /> }
			label={
				<Tooltip title={ label } placement="top">
					<Box sx={ { display: 'flex', gap: 0.5, alignItems: 'center' } }>
						<Typography variant="caption" noWrap>
							{ label }
						</Typography>
						<Typography variant="caption" noWrap sx={ { textOverflow: 'initial', overflow: 'visible' } }>
							({ __( 'deleted', 'elementor' ) })
						</Typography>
					</Box>
				</Tooltip>
			}
			sx={ {
				height: ( theme: Theme ) => theme.spacing( 3.5 ),
				borderRadius: ( theme: Theme ) => theme.spacing( 1 ),
				justifyContent: 'flex-start',
				width: '100%',
			} }
			{ ...props }
		/>
	);
} );
