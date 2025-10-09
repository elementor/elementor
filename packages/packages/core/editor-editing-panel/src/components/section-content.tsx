import { type FC, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Stack } from '@elementor/ui';

type SectionContentProps = PropsWithChildren< {
	gap?: number;
	sx?: {
		pt?: number;
	};
	'aria-label'?: string;
} >;

export const SectionContent: FC< SectionContentProps > = ( { gap = 2, sx, children, 'aria-label': ariaLabel } ) => (
	<Stack gap={ gap } sx={ { ...sx } } aria-label={ ariaLabel }>
		{ children }
	</Stack>
);
