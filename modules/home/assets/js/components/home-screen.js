import { useState } from 'react';
import { Container, Grid } from '@elementor/ui';

import TopSection from './top-section';

const HomeScreen = () => {
	const videoUrl= 'https://elementor.com/academy/getting-started-with-elementor/',
		ctaUrl = elementorAppConfig.pages_url,
		embedUrl = 'https://www.youtube.com/embed/icTcREd1tAg?si=MPamCEWNeRR_VdAn&amp;controls=0';

	return (
		<Container sx={ { py: 3 } }>
			<Grid sx={ { display: 'grid', gap: 3 } }>
				<TopSection videoUrl={ videoUrl } ctaUrl={ ctaUrl } embedUrl={ embedUrl } />
			</Grid>
		</Container>
	);
};

export default HomeScreen;
