import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Box from 'elementor-app/ui/atoms/box';
import Grid from 'elementor-app/ui/grid/grid';

import './message-banner.scss';

export default function MessageBanner( { heading, description, button } ) {
	const getDescriptionContent = () => {
		if ( Array.isArray( description ) ) {
			return description.join( <br /> );
		}

		return description;
	};
	return (
		<Box className="e-app-import-export-message-banner" padding="20">
			<Grid container alignItems="center" justify="space-between">
				<Grid item>
					{
						heading &&
						<Heading className="e-app-import-export-message-banner__heading" variant="h3" tag="h3">
							{ heading }
						</Heading>
					}

					{
						description &&
						<Text className="e-app-import-export-message-banner__description">
							{ getDescriptionContent() }
						</Text>
					}
				</Grid>

				{
					button &&
					<Grid item>
						{ button }
					</Grid>
				}
			</Grid>
		</Box>
	);
}

MessageBanner.propTypes = {
	heading: PropTypes.string,
	description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	button: PropTypes.object,
};
