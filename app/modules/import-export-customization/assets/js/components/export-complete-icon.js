import { Box } from '@elementor/ui';

export default function ExportCompleteIcon() {
	return (
		<Box sx={ { mb: 2 } }>
			<img
				src={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				alt=""
				style={ { width: '80px', height: '80px' } }
			/>
		</Box>
	);
}
