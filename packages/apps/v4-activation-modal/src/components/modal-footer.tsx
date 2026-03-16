import * as React from 'react';
import { Button, Stack, Typography } from '@elementor/ui';

type FooterLink = {
	text: string;
	url: string;
};

type ModalFooterProps = {
	helpText: string;
	link: FooterLink;
};

export const ModalFooter = ( { helpText, link }: ModalFooterProps ) => {
	return (
		<Stack direction="row" alignItems="center" gap={ 1 }>
			<Typography variant="caption" color="text.tertiary" sx={ { fontSize: '11px', lineHeight: 'normal' } }>
				{ helpText }
			</Typography>
			<Button
				href={ link.url }
				target="_blank"
				variant="text"
				size="small"
				color="info"
				sx={ { fontSize: '11px' } }
			>
				{ link.text }
			</Button>
		</Stack>
	);
};
