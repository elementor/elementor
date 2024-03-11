import { Container, Grid } from '@elementor/ui';

import TopSection from './top-section';
import BlockSection from './block-section';

const HomeScreen = ( props ) => {
	const getDataByType = ( type ) => {
		const data = props.homeScreenData.data;

		return data.filter( ( item ) => item.type === type );
	};

	return (
		<Container sx={ { py: 4 } }>
			<Grid sx={ { display: 'grid', gap: 3 } }>
				<TopSection
					topData={ getDataByType( 'top' )[ 0 ] }
					createNewPageUrl={ props.homeScreenData.createNewPageUrl }
				/>
				<BlockSection />
			</Grid>
		</Container>
	);
};

HomeScreen.propTypes = {
	homeScreenData: PropTypes.object,
};

export default HomeScreen;
