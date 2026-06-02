import * as React from 'react';
import { type ReactNode } from 'react';
import { Stack, Typography } from '@elementor/ui';

type ModalHeaderProps = {
	title: string;
	content: ReactNode;
	maxTitleWidth?: number;
};

export const ModalHeader = ( { title, content, maxTitleWidth = 310 }: ModalHeaderProps ) => {
	return (
		<Stack gap={ 0.75 }>
			<Typography variant="h4" color="text.primary" maxWidth={ maxTitleWidth }>
				{ title }
			</Typography>
			<Typography variant="subtitle2" color="text.primary">
				{ content }
			</Typography>
		</Stack>
	);
};
