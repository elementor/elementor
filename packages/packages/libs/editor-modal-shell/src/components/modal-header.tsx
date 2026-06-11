import * as React from 'react';
import { type ReactNode } from 'react';
import { Stack, Typography } from '@elementor/ui';

type ModalHeaderProps = {
	title: string;
	content: ReactNode;
};

export const ModalHeader = ( { title, content }: ModalHeaderProps ) => {
	return (
		<Stack gap={ 0.75 }>
			<Typography variant="h4" color="text.primary">
				{ title }
			</Typography>
			<Typography variant="subtitle2" color="text.primary">
				{ content }
			</Typography>
		</Stack>
	);
};
