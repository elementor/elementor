import * as React from 'react';
import { Box, Button, Typography } from '@elementor/ui';

type Props = {
	ctaDisabled: boolean;
	ctaLabel: string;
	icon: React.ComponentType< { color?: 'action'; fontSize?: 'small' } >;
	onCtaClick: () => void;
	subtitle: string;
	title: string;
};

export default function PromotionCard( { ctaDisabled, ctaLabel, icon: Icon, onCtaClick, subtitle, title }: Props ) {
	return (
		<Box
			sx={ {
				alignItems: 'center',
				border: 1,
				borderColor: 'divider',
				borderRadius: 1,
				display: 'flex',
				gap: 1,
				px: 2,
				py: 1.5,
			} }
		>
			<Icon fontSize="small" color="action" />
			<Box sx={ { display: 'flex', flex: 1, flexDirection: 'column', gap: 0.25, minWidth: 0 } }>
				<Typography variant="body2" fontWeight="bold">
					{ title }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{ subtitle }
				</Typography>
			</Box>
			<Button variant="outlined" color="secondary" size="small" disabled={ ctaDisabled } onClick={ onCtaClick }>
				{ ctaLabel }
			</Button>
		</Box>
	);
}
