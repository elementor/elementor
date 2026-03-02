import * as React from 'react';
import { Link, Stack, Typography } from '@elementor/ui';

type ModalFooterProps = {
	helpText: string;
	learnMoreText: string;
	learnMoreUrl: string;
};

export const ModalFooter = ( { helpText, learnMoreText, learnMoreUrl }: ModalFooterProps ) => {
	return (
		<Stack direction="row" alignItems="center" gap={ 1.5 }>
			<Typography variant="body2" color="text.secondary">
				{ helpText }
			</Typography>
			<Link
				href={ learnMoreUrl }
				target="_blank"
				variant="body2"
				color="info.main"
				sx={ { textDecoration: 'none' } }
			>
				{ learnMoreText }
			</Link>
		</Stack>
	);
};
