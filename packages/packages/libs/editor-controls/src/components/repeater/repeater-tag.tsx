import * as React from 'react';
import { forwardRef } from 'react';
import { UnstableTag, type UnstableTagProps } from '@elementor/ui';

export const RepeaterTag = forwardRef< HTMLDivElement, UnstableTagProps >( ( props, ref ) => {
	return (
		<UnstableTag
			ref={ ref }
			fullWidth
			showActionsOnHover
			variant="outlined"
			sx={ { minHeight: ( theme ) => theme.spacing( 3.5 ) } }
			{ ...props }
		/>
	);
} );
