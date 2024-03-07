import { useState } from 'react';
import { Box } from '@elementor/ui';
import TopSection from './TopSection';

const HomeScreen = () => {
	const [topScreenProps, setTopScreenProps] = useState({videoUrl: 'https://elementor.com/academy/getting-started-with-elementor/', ctaUrl: 'http://wordpress-dev.local/wp-admin/edit.php?elementor_new_post&post_type=page', embedUrl: 'https://www.youtube.com/embed/icTcREd1tAg?si=MPamCEWNeRR_VdAn&amp;controls=0'});
	return (
		<Box display="flex" sx={ { flexDirection: 'column'} }>
			<TopSection topScreenProps={topScreenProps}/>
		</Box>
	);
};

export default HomeScreen;
