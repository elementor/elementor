import * as React from 'react';
import { Box, type Theme, Typography } from '@elementor/ui';

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
				borderLeft: '3px solid',
				borderColor: selected ? 'common.black' : 'transparent',
				transition: ( theme: Theme ) =>
					theme.transitions.create( [ 'border-color' ], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.enteringScreen,
					} ),
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
