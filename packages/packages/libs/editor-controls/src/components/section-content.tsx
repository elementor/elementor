import { type FC, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Stack } from '@elementor/ui';

type SectionContentProps = PropsWithChildren< {
	gap?: number;
	sx?: {
		pt?: number;
	};
} >;

export const SectionContent: FC< SectionContentProps > = ( { gap = 2, sx, children } ) => (
	<Stack gap={ gap } sx={ { ...sx } }>
		{ children }
	</Stack>
);
