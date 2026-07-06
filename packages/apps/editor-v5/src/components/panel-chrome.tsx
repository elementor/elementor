import * as React from 'react';
import { Box, Typography } from '@elementor/ui';

type PanelChromeProps = {
	children: React.ReactNode;
	subtitle?: string;
	title: string;
};

export default function PanelChrome( { children, subtitle, title }: PanelChromeProps ) {
	return (
		<Box
			sx={ {
				backgroundColor: 'background.paper',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
			} }
		>
			<Box
				sx={ {
					borderBottom: '1px solid',
					borderColor: 'divider',
					px: 2,
					py: 1.5,
				} }
			>
				<Typography sx={ { fontWeight: 600 } } variant="subtitle2">
					{ title }
				</Typography>
				{ subtitle && (
					<Typography color="text.secondary" variant="caption">
						{ subtitle }
					</Typography>
				) }
			</Box>
			<Box sx={ { flex: 1, minHeight: 0, overflow: 'auto' } }>{ children }</Box>
		</Box>
	);
}
