import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const INFORMATION_IMAGE_PATH = 'images/information.svg';

type ElementorCommonWindow = Window & {
	elementorCommon?: {
		config?: {
			urls?: {
				assets?: string;
			};
		};
	};
};

export default function WelcomePage() {
	const assetsUrl = ( window as ElementorCommonWindow ).elementorCommon?.config?.urls?.assets ?? '';

	return (
		<Box
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1,
				p: 3,
			} }
		>
			<img
				className="elementor-nerd-box-icon"
				src={ `${ assetsUrl }${ INFORMATION_IMAGE_PATH }` }
				loading="lazy"
				alt={ __( 'Elementor', 'elementor' ) }
			/>
			<Typography variant="subtitle1" component="h3" sx={ { marginBlockStart: 2 } }>
				{ __( 'Audit your page!', 'elementor' ) }
			</Typography>
			<Typography variant="caption" textAlign="center">
				{ __(
					'Check SEO, accessibility, performance, and best practices. Click "Run page audit" to begin.',
					'elementor'
				) }
			</Typography>
		</Box>
	);
}
