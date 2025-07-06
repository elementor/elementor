import { Card, CardContent, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function ExportCompleteSummary( { kitInfo, includes } ) {
	return (
		<Card sx={ { width: '100%', border: 1, borderRadius: 1, borderColor: 'action.focus' } } elevation={ 0 } data-testid="export-complete-summary">
			<CardContent sx={ { p: 2.5 } }>
				<Typography variant="h6" component="h3" gutterBottom>
					{ kitInfo.title }
				</Typography>

				{ kitInfo.description && (
					<Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
						{ kitInfo.description }
					</Typography>
				) }

				<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
					{ __( 'Exported items:', 'elementor' ) }
				</Typography>
				<Typography variant="body2">
					{ includes.map( ( item ) => {
						const itemLabels = {
							content: __( 'Content', 'elementor' ),
							templates: __( 'Templates', 'elementor' ),
							settings: __( 'Settings & configurations', 'elementor' ),
							plugins: __( 'Plugins', 'elementor' ),
						};
						return itemLabels[ item ] || item;
					} ).join( ', ' ) }
				</Typography>
			</CardContent>
		</Card>
	);
}

ExportCompleteSummary.propTypes = {
	kitInfo: PropTypes.shape( {
		title: PropTypes.string,
		description: PropTypes.string,
	} ).isRequired,
	includes: PropTypes.arrayOf( PropTypes.string ).isRequired,
};
