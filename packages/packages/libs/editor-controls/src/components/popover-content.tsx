import { type FC, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Stack, type StackProps } from '@elementor/ui';

export const PopoverContent: FC< PropsWithChildren< StackProps > > = ( { gap = 1.5, children, ...props } ) => (
	<Stack { ...props } gap={ gap }>
		{ children }
	</Stack>
);
