import * as React from 'react';
import { type ElementNode, isLegacyDocument } from '@elementor/editor-v5-store';
import { Alert, Box, Button, Stack, Typography } from '@elementor/ui';

import { getClassicEditorUrl } from '../editor-config';

type LegacyGuardProps = {
	elements: ElementNode[];
};

export default function LegacyGuard( { elements }: LegacyGuardProps ) {
	if ( ! isLegacyDocument( elements ) ) {
		return null;
	}

	return (
		<Box sx={ { p: 2 } }>
			<Alert severity="warning">
				<Stack spacing={ 2 }>
					<Typography>This document contains legacy elements that are not supported in Editor V5.</Typography>
					<Button component="a" href={ getClassicEditorUrl() } variant="contained">
						Open Classic Editor
					</Button>
				</Stack>
			</Alert>
		</Box>
	);
}
