import KitName from './components/kit-name/kit-name';
import KitDescription from './components/kit-description/kit-description';

import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';

import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';

export default function KitInformation() {
	return (
		<>
			<Box>
				<List padding="20" separated className="e-app-export-kit-information">
					<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
						{ __( 'Kit name and description', 'elementor' ) }
					</Heading>
					<List.Item>
						<Grid container noWrap direction="column" className="e-app-export-kit-information__content">
							<Grid item container alignItems="baseline" >
								<KitName />
							</Grid>
							<Grid item container alignItems="baseline" >
								<KitDescription />
							</Grid>
						</Grid>
					</List.Item>
				</List>
			</Box>
		</>
	);
}
