import * as React from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { Chip, type ChipProps, type Theme } from '@elementor/ui';

export const MissingTag = React.forwardRef< HTMLDivElement, ChipProps >( ( { label, onClick, ...props }, ref ) => {
	return (
		<Chip
			ref={ ref }
			size="tiny"
			color="warning"
			shape="rounded"
			variant="standard"
			onClick={ onClick }
			icon={ <AlertTriangleFilledIcon /> }
			label={ label }
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
