import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
import SummarySection from '../../shared/components/summary-section';

export default function ExportCompleteSummary( { kitInfo, includes, exportedData } ) {
	const getTemplatesSummary = useCallback( () => {
		const templates = exportedData?.manifest?.templates;

		if ( ! templates ) {
			return __( 'No templates exported', 'elementor' );
		}

		const templatesByType = {};

		Object.values( templates ).forEach( ( template ) => {
			const docType = template.doc_type;
			if ( ! templatesByType[ docType ] ) {
				templatesByType[ docType ] = 0;
			}
			templatesByType[ docType ]++;
		} );

		const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.templates || {};

		const summaryParts = Object.entries( templatesByType )
			.map( ( [ docType, count ] ) => {
				const label = summaryTitles[ docType ];
				if ( ! label ) {
					return null;
				}

				const title = count > 1 ? label.plural : label.single;
				return `${ count } ${ title }`;
			} )
			.filter( ( part ) => part );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No templates exported', 'elementor' );
	}, [ exportedData?.manifest?.templates ] );

	const getPluginsSummary = useCallback( () => {
		return exportedData?.manifest?.plugins ? exportedData?.manifest?.plugins.map( ( plugin ) => plugin.name ).join( ' | ' ) : __( 'No plugins exported', 'elementor' );
	}, [ exportedData?.manifest?.plugins ] );

	const sectionsTitlesMap = useMemo( () => ( {
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
			subTitle: getPluginsSummary(),
		},
		templates: {
			title: __( 'Templates', 'elementor' ),
			subTitle: getTemplatesSummary(),
		},
	} ), [ getPluginsSummary, getTemplatesSummary ] );

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
			templates: PropTypes.object,
		} ),
	} ),
};
