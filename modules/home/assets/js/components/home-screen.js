import { Container, Box } from '@elementor/ui';

import TopSection from './top-section';

const HomeScreen = () => {
	const videoUrl = 'https://elementor.com/academy/getting-started-with-elementor/',
		ctaUrl = elementorAppConfig.pages_url,
		embedUrl = 'https://www.youtube.com/embed/icTcREd1tAg?si=40E8D1hdnu26-TXM';

	return (
		<Container sx={ { py: { xs: 2, md: 6 }, maxWidth: { md: '990px' } } }>
			<Box sx={ { display: 'grid', gap: { xs: 1, md: 3 } } }>
				<TopSection videoUrl={ videoUrl } ctaUrl={ ctaUrl } embedUrl={ embedUrl } />
			</Box>
		</Container>
	);
};

export default HomeScreen;
