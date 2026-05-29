import * as React from 'react';
import { Box, CircularProgress } from '@elementor/ui';

const loaderStyle: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	zIndex: 10000,
};

export function SiteBuilderLoader() {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			sx={ {
				...loaderStyle,
				bgcolor: 'background.default',
			} }
		>
			<CircularProgress />
		</Box>
	);
}
