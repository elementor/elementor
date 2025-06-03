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
				<List padding="24 40" separated className="e-app-export-kit-information">
					<List.Item>
						<Grid container direction="column" spacing="16" className="e-app-export-kit-information__content">
							<Grid padding="0">
								<KitName />
							</Grid>

							<Grid padding="0">
								<KitDescription />
							</Grid>
						</Grid>
					</List.Item>
				</List>
			</Box>
		</>
	);
}
