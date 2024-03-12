import { Container } from '@elementor/ui';

import TopSection from './top-section';

const HomeScreen = ( props ) => {
	const videoUrl = 'https://elementor.com/academy/getting-started-with-elementor/',
		embedUrl = 'https://www.youtube.com/embed/icTcREd1tAg?si=40E8D1hdnu26-TXM';

	return (
		<Container sx={ { display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 3 }, py: { xs: 2, md: 6 }, maxWidth: { md: '990px' } } }>
			<TopSection
				videoUrl={ videoUrl }
				embedUrl={ embedUrl }
				topData={ props.homeScreenData.data.top[ 0 ] }
				createNewPageUrl={ props.homeScreenData.createNewPageUrl }
			/>
		</Container>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
