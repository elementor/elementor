import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlAdornmentsProvider } from '@elementor/editor-controls';

import { CustomCssIndicator } from './custom-css-indicator';

export const CustomCssField = ( { children }: PropsWithChildren< object > ) => {
	return (
		<ControlAdornmentsProvider
			items={ [
				{
					id: 'custom-css-indicator',
					Adornment: CustomCssIndicator,
				},
			] }
		>
			{ children }
		</ControlAdornmentsProvider>
	);
};
