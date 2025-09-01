import KitName from './components/kit-name/kit-name';
import KitDescription from './components/kit-description/kit-description';

import Grid from 'elementor-app/ui/grid/grid';

import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';

export default function KitInformation() {
	return (
		<>
			<Box>
				<List padding="24 40" separated className="e-app-export-kit-information">
					<List.Item>
						<Grid container noWrap direction="column" className="e-app-export-kit-information__content">
							<Grid item container >
								<KitName />
							</Grid>

							<Grid item container >
								<KitDescription />
							</Grid>
						</Grid>
					</List.Item>
				</List>
			</Box>
		</>
	);
}
