import { Container, Grid } from '@elementor/ui';

import TopSection from './top-section';
import BlockSection from './block-section';

const HomeScreen = () => {
	return (
		<Container sx={ { py: 4 } }>
			<Grid sx={ { display: 'grid', gap: 3 } }>
				<TopSection />
				<BlockSection />
			</Grid>
		</Container>
	);
};

export default HomeScreen;
