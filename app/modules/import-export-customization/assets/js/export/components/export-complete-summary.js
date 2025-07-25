import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

const ExternalLinkIcon = () => (
	<Box
		component="i"
		sx={ { fontFamily: 'eicons' } }
		className="eps-icon eicon-editor-external-link"
	/>
);

export default function ExportCompleteSummary( { kitInfo, includes, exportedData } ) {
	console.log( exportedData );
	return (
		<Box sx={ { width: '100%', border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5, textAlign: 'start' } } data-testid="export-complete-summary">
			<Typography variant="h6" component="h3" gutterBottom>
				{ kitInfo.title }
			</Typography>

			{ kitInfo.description && (
				<Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
					{ kitInfo.description }
				</Typography>
			) }

			<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
				{ __( 'This website template includes:', 'elementor' ) }
			</Typography>
			<Stack spacing={ 2 } sx={ { pt: 1, maxWidth: '1075px' } } >
				{ includes.includes('settings') && (
					<Box>
						<Stack direction="row" alignItems="center" spacing={ 1 }>
							<Typography variant="body2" color="text.primary" >
								{ __( 'Site settings', 'elementor' ) }
							</Typography>
							<ExternalLinkIcon />
						</Stack>
						<Typography variant="caption" color="text.secondary">
							{ __( 'Global Colors | Global Fonts | Typography | Buttons | Images | Form Fields | Previousground | Layout | Lightbox | Page Transitions | Custom CSS', 'elementor' ) }
						</Typography>
					</Box>
				) }
				{ includes.includes('content') && (
					<Box>
						<Stack direction="row" alignItems="center" spacing={ 1 }>
							<Typography variant="body2" color="text.primary" >
								{ __( 'Content', 'elementor' ) }
							</Typography>
							<ExternalLinkIcon />
						</Stack>
						<Typography variant="caption" color="text.secondary" >
							{ __( '5 Posts | 12 Pages | 39 Products | 15 Navigation Menu Items', 'elementor' ) }
						</Typography>
					</Box>
				) }
				{ includes.includes('plugins') && (
					<Box>
						<Stack direction="row" alignItems="center" spacing={ 1 }>
							<Typography variant="body2" color="text.primary">
								{ __( 'Plugins', 'elementor' ) }
							</Typography>
							<ExternalLinkIcon />
						</Stack>
						<Typography variant="caption" color="text.secondary">
							{ exportedData?.manifest?.plugins ? exportedData?.manifest?.plugins.map( ( plugin ) => plugin.name ).join( ' | ' ) : __( 'No plugins exported', 'elementor' ) }
						</Typography>
					</Box>
				) }
			</Stack>
		</Box>
	);
}

ExportCompleteSummary.propTypes = {
	kitInfo: PropTypes.shape( {
		title: PropTypes.string,
		description: PropTypes.string,
	} ).isRequired,
	includes: PropTypes.arrayOf( PropTypes.string ).isRequired,
};
