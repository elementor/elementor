import React from 'react';
import { Box, Typography, Link } from '@elementor/ui';

export default function ExportIntro() {
	return (
		<Box sx={ { mb: 4 } }>
			<Typography variant="h4" component="h2" gutterBottom>
				{ __( 'Export a Website template?', 'elementor' ) }
			</Typography>
			<Typography variant="body1" color="text.secondary">
				{ __( 'Choose which Elementor components - templates, content and site settings - to include in your website templates file. By default, all of your components will be exported.', 'elementor' ) }{ ' ' }
				<Link href="https://go.elementor.com/app-what-are-kits" target="_blank" rel="noopener noreferrer">
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</Typography>
		</Box>
	);
}
