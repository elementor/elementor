import * as React from 'react';
import { useState } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Button, Chip, CloseButton, Typography } from '@elementor/ui';

// TODO: Replace with a bundled local asset.
const PROMO_IMAGE = 'https://www.figma.com/api/mcp/asset/3ac51fca-0575-4a48-aa20-08c4a4db21ca';

export function AtomicElementsPromo() {
	const [ dismissed, setDismissed ] = useState( false );

	if ( dismissed ) {
		return null;
	}

	return (
		<ThemeProvider>
		<Box sx={ {
			bgcolor: 'background.default',
			display: 'flex',
			flexDirection: 'column',
			width: 300,
		} }>

			{ /* Header */ }
			<Box sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				pl: 2.5,
				pr: 1,
				py: 1,
			} }>
				<Typography variant="subtitle2" sx={ { flexGrow: 1 } }>
					Atomic Elements
				</Typography>
				<Chip label="New" size="small" color="primary" />
				<CloseButton onClick={ () => setDismissed( true ) } />
			</Box>

			{ /* Image */ }
			<Box sx={ {
				height: 160,
				width: 260,
				mx: 'auto',
				overflow: 'hidden',
			} }>
				<Box
					component="img"
					src={ PROMO_IMAGE }
					alt=""
					sx={ {
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'center',
						display: 'block',
					} }
				/>
			</Box>

			{ /* Description */ }
			<Box sx={ { pl: 2.5, pr: 4, pt: 2 } }>
				<Typography variant="caption" color="text.tertiary">
					The new generation of high-performance, flexible building blocks designed
					for precise styling and a unified experience.
				</Typography>
			</Box>

			{ /* Footer */ }
			<Box sx={ {
				display: 'flex',
				justifyContent: 'flex-end',
				gap: 1,
				pb: 1.5,
				pl: 2,
				pr: 2.5,
				pt: 1,
			} }>
				<Button variant="text" size="small" color="secondary">
					Learn more
				</Button>
				<Button variant="contained" size="small" color="primary">
					Unlock for free
				</Button>
			</Box>

		</Box>
		</ThemeProvider>
	);
}
