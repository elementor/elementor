import * as React from 'react';
import { Stack } from '@elementor/ui';

export const Header = ( { children }: { children: React.ReactNode } ) => {
	return (
		<Stack direction="row" justifyContent="start" alignItems="center" gap={ 1 } sx={ { marginInlineEnd: -0.75 } }>
			{ children }
		</Stack>
	);
};
