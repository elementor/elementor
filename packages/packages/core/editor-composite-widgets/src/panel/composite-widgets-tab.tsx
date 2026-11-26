import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CompositeWidgetsList } from './composite-widgets-list';
import { useInsertableCompositeWidgets } from './use-insertable-composite-widgets';

export function CompositeWidgetsTab() {
	const hasWidgets = useInsertableCompositeWidgets().length > 0;

	return (
		<ThemeProvider>
			<Box sx={ { p: 2 } }>
				{ hasWidgets ? (
					<CompositeWidgetsList />
				) : (
					<Typography variant="caption" color="text.secondary">
						{ __( 'No saved widgets yet.', 'elementor' ) }
					</Typography>
				) }
			</Box>
		</ThemeProvider>
	);
}
