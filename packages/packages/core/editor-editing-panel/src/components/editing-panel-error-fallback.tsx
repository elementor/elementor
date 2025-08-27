import * as React from 'react';
import { Alert, Box } from '@elementor/ui';

export function EditorPanelErrorFallback() {
	return (
		<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
			<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
				<strong>Something went wrong</strong>
			</Alert>
		</Box>
	);
}
