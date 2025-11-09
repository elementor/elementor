import * as React from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { Box, Chip, type ChipProps, type Theme, Tooltip, Typography } from '@elementor/ui';

interface WarningVariableTagProps extends ChipProps {
	label: string;
	suffix?: string;
}

export const WarningVariableTag = React.forwardRef< HTMLDivElement, WarningVariableTagProps >(
	( { label, suffix, onClick, icon, ...props }, ref ) => {
		const displayText = suffix ? `${ label } (${ suffix })` : label;

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
					<Tooltip title={ displayText } placement="top">
						<Box sx={ { display: 'inline-grid', minWidth: 0 } }>
							<Typography variant="caption" noWrap sx={ { lineHeight: 1.34 } }>
								{ displayText }
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
	}
);

WarningVariableTag.displayName = 'WarningVariableTag';
