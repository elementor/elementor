import { type FC, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Stack } from '@elementor/ui';

type SectionContentProps = PropsWithChildren< {
	gap?: number;
	sx?: {
		pt?: number;
	};
} >;

export const SectionContent: FC< SectionContentProps > = React.forwardRef( ( { gap = 2, sx, children }, ref ) => {
	return (
		<Stack gap={ gap } sx={ { ...sx } } ref={ ref }>
			{ children }
		</Stack>
	);
} );
