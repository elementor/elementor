import * as React from 'react';
import { Box, ButtonBase, Typography } from '@elementor/ui';

interface WelcomeCardProps {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}

export function WelcomeCard( { label, onClick, children }: WelcomeCardProps ) {
	return (
		<ButtonBase
			onClick={ onClick }
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width: 216,
				height: 162,
				borderRadius: '8px',
				border: '1px solid',
				borderColor: 'divider',
				backgroundColor: 'background.paper',
				overflow: 'hidden',
				cursor: 'pointer',
				transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
				'&:hover': {
					borderColor: 'primary.main',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
				},
			} }
		>
			<Box
				sx={ {
					width: 192,
					height: 93,
					borderRadius: '6px',
					overflow: 'hidden',
					mt: '12px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				} }
			>
				{ children }
			</Box>
			<Typography
				variant="body2"
				sx={ {
					mt: 'auto',
					mb: '12px',
					fontWeight: 500,
					color: 'text.primary',
				} }
			>
				{ label }
			</Typography>
		</ButtonBase>
	);
}
