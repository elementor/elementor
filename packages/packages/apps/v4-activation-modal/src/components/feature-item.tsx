import * as React from 'react';
import { Box, Typography } from '@elementor/ui';

type FeatureItemProps = {
	title: string;
	subtitle: string;
	selected: boolean;
	onClick: () => void;
};

export const FeatureItem = ( { title, subtitle, selected, onClick }: FeatureItemProps ) => {
	return (
		<Box
			onClick={ onClick }
			sx={ {
				pl: 2,
				pr: 1,
				cursor: 'pointer',
				borderLeft: selected ? '3px solid' : '3px solid transparent',
				borderColor: selected ? 'common.black' : 'transparent',
			} }
		>
			<Typography variant="subtitle2" color="text.primary">
				{ title }
			</Typography>
			<Typography variant="body2" color="text.tertiary">
				{ subtitle }
			</Typography>
		</Box>
	);
};
