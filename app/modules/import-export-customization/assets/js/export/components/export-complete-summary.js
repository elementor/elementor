import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import SummarySection from './summary-section';

export default function ExportCompleteSummary( { kitInfo, includes, exportedData } ) {
	const sectionsTitlesMap = {
		settings: {
			title: __( 'Site settings', 'elementor' ),
			subTitle: __( 'Global Colors | Global Fonts | Typography | Buttons | Images | Form Fields | Previousground | Layout | Lightbox | Page Transitions | Custom CSS', 'elementor' ),
		},
		content: {
			title: __( 'Content', 'elementor' ),
			subTitle: __( '5 Posts | 12 Pages | 39 Products | 15 Navigation Menu Items', 'elementor' ),
		},
		plugins: {
			title: __( 'Plugins', 'elementor' ),
			subTitle: exportedData?.manifest?.plugins ? exportedData?.manifest?.plugins.map( ( plugin ) => plugin.name ).join( ' | ' ) : __( 'No plugins exported', 'elementor' ),
		},
	};

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
				{ includes.map( ( section ) =>
					sectionsTitlesMap[ section ] ? (
						<SummarySection
							key={ section }
							title={ sectionsTitlesMap[ section ].title }
							subTitle={ sectionsTitlesMap[ section ].subTitle }
						/>
					) : null,
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
	exportedData: PropTypes.shape( {
		manifest: PropTypes.shape( {
			plugins: PropTypes.arrayOf( PropTypes.shape( {
				name: PropTypes.string,
			} ) ),
		} ),
	} ),
};
