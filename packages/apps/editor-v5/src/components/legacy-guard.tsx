import * as React from 'react';
import { isLegacyDocument, type ElementNode } from '@elementor/editor-v5-store';
import { Alert, Box, Button, Stack, Typography } from '@elementor/ui';

type LegacyGuardProps = {
	elements: ElementNode[];
};

function getClassicEditorUrl(): string {
	const config = window.ElementorConfig as {
		editorV5?: {
			classicEditorUrl?: string;
		};
	} | undefined;

	return config?.editorV5?.classicEditorUrl ?? window.location.href;
}

export default function LegacyGuard( { elements }: LegacyGuardProps ) {
	if ( ! isLegacyDocument( elements ) ) {
		return null;
	}

	return (
		<Box sx={ { p: 2 } }>
			<Alert severity="warning">
				<Stack spacing={ 2 }>
					<Typography>
						This document contains legacy elements that are not supported in Editor V5.
					</Typography>
					<Button
						component="a"
						href={ getClassicEditorUrl() }
						variant="contained"
					>
						Open Classic Editor
					</Button>
				</Stack>
			</Alert>
		</Box>
	);
}
