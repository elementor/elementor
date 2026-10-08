import { CircleCheckIcon } from '@elementor/icons';
import Chip from '@elementor/ui/Chip';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { getIncludedFeatures } from './agent-discovery-features';

const FILES_PANE_WIDTH = 500;
const CHIPS_GAP = 1.25;

const getChipLinkProps = ( url ) => ( {
	component: 'a',
	href: url,
	target: '_blank',
	rel: 'noopener noreferrer',
	clickable: true,
} );

export const AgentDiscoveryPanel = ( { settings } ) => {
	const { files, isEnabled } = settings;

	return (
		<Stack direction="row" width="100%" maxWidth="100%" minWidth={ 0 } overflow="auto">
			<Stack spacing={ 5 } pl={ 7 } pr={ 6 } py={ 4 } flexGrow={ 1 } flexShrink={ 1 } flexBasis={ 0 } minWidth={ 0 }>
				<Stack spacing={ 1 }>
					<Typography variant="subtitle1">{ __( 'Tell agents what this site offers them', 'elementor' ) }</Typography>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Publishes a catalog of what agents can use on this site and how they can sign in if needed.', 'elementor' ) }
					</Typography>
				</Stack>
				<Stack spacing={ 2 }>
					<Typography variant="subtitle1">{ __( 'What’s included', 'elementor' ) }</Typography>
					{ getIncludedFeatures( files ).map( ( { id, title, description } ) => (
						<Stack key={ id } spacing={ 1 }>
							<Stack direction="row" alignItems="center" spacing={ 1 }>
								<CircleCheckIcon fontSize="tiny" />
								<Typography variant="subtitle2">{ title }</Typography>
							</Stack>
							<Typography variant="body2" color="text.secondary">{ description }</Typography>
						</Stack>
					) ) }
				</Stack>
			</Stack>
			<Stack
				direction="row"
				flexWrap="wrap"
				alignContent="flex-start"
				gap={ CHIPS_GAP }
				p={ 3 }
				width={ FILES_PANE_WIDTH }
				maxWidth="100%"
				minWidth={ 0 }
				flexShrink={ 1 }
				bgcolor="grey.50"
			>
				{ files.map( ( { slug, url } ) => (
					<Chip
						key={ slug }
						label={ slug }
						size="small"
						shape="rounded"
						{ ...( isEnabled ? getChipLinkProps( url ) : {} ) }
					/>
				) ) }
			</Stack>
		</Stack>
	);
};

AgentDiscoveryPanel.propTypes = {
	settings: PropTypes.shape( {
		files: PropTypes.arrayOf( PropTypes.shape( {
			slug: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired,
		} ) ).isRequired,
		isEnabled: PropTypes.bool.isRequired,
	} ).isRequired,
};
