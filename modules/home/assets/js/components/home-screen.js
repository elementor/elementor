import { useState } from 'react';
import { Box } from '@elementor/ui';
import TopSection from './top-section';

const HomeScreen = () => {
	const baseUrl = elementorAppConfig.pages_url;
	const [ topScreenProps, setTopScreenProps ] = useState({ videoUrl: 'https://elementor.com/academy/getting-started-with-elementor/', ctaUrl: baseUrl, embedUrl: 'https://www.youtube.com/embed/icTcREd1tAg?si=MPamCEWNeRR_VdAn&amp;controls=0' } );
	return (
		<Box display="flex" sx={ { flexDirection: 'column' } }>
			<TopSection
				ctaUrl={ topScreenProps.ctaUrl }
				videoUrl={ topScreenProps.videoUrl }
				embedUrl={ topScreenProps.embedUrl }
			/>
		</Box>
	);
};

export default HomeScreen;
