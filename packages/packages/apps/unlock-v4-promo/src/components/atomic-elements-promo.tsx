import * as React from 'react';
import { useState } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, Button, Chip, CloseButton, Divider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const PROMO_IMAGE = 'https://assets.elementor.com/v4-promotion/v1/images/v4_chip_new.png';

export function AtomicElementsPromo() {
	const [ dismissed, setDismissed ] = useState( false );

	if ( dismissed ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Divider />
			<Box
				sx={ {
					bgcolor: 'background.default',
					display: 'flex',
					flexDirection: 'column',
				} }
			>
				<Box
					sx={ {
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						pl: 2.5,
						pr: 1,
						py: 1,
					} }
				>
					<Typography
						variant="subtitle2"
						sx={ { flexGrow: 1, gap: 1, display: 'flex', alignItems: 'center' } }
					>
						{ __( 'Atomic Elements', 'elementor' ) }
						<Chip label={ __( 'New', 'elementor' ) } size="tiny" variant="standard" color="secondary" />
					</Typography>
					<CloseButton slotProps={ { icon: { fontSize: 'small' } } } onClick={ () => setDismissed( true ) } />
				</Box>

				<Box
					sx={ {
						maxHeight: 205,
						mx: 2,
						overflow: 'hidden',
					} }
				>
					<Box
						component="img"
						src={ PROMO_IMAGE }
						alt=""
						sx={ {
							width: '100%',
							objectFit: 'cover',
							objectPosition: 'center',
							display: 'block',
						} }
					/>
				</Box>

				<Box sx={ { pl: 2.5, pr: 4, pt: 2 } }>
					<Typography variant="caption" color="text.tertiary">
						{ __(
							'The new generation of high-performance, flexible building blocks designed for precise styling and a unified experience.',
							'elementor'
						) }
					</Typography>
				</Box>

				<Box
					sx={ {
						display: 'flex',
						justifyContent: 'flex-end',
						gap: 1,
						pb: 1.5,
						pl: 2,
						pr: 2.5,
						pt: 1,
					} }
				>
					<Button variant="text" size="small" color="secondary">
						{ __( 'Learn more', 'elementor' ) }
					</Button>
					<Button variant="contained" size="small" color="primary">
						{ __( 'Unlock for free', 'elementor' ) }
					</Button>
				</Box>
			</Box>
			<Divider />
		</ThemeProvider>
	);
}
