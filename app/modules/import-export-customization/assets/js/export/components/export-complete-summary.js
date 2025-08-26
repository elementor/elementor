import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
import SummarySection from '../../shared/components/summary-section';
import { buildKitSettingsSummary } from '../../shared/utils/utils';

export default function ExportCompleteSummary( { includes, exportedData } ) {
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
		} ).filter( ( part ) => part !== null );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No templates exported', 'elementor' );
	}, [ exportedData?.manifest?.templates ] );

	const getContentSummary = useCallback( () => {
		const content = exportedData?.manifest?.content;
		if ( ! content ) {
			return __( 'No content exported', 'elementor' );
		}
		
		const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content || {};

		const summaryParts = Object.entries( content ).map( ( [ docType, docs ] ) => {
			const label = summaryTitles[ docType ];
			if ( ! label ) {
				return null;
			}
			const count = Object.keys( docs ).length;
			if ( count === 0 ) {
				return null;
			}

			const title = count > 1 ? label.plural : label.single;
			return `${ count } ${ title }`;
		} ).filter( ( part ) => part !== null );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No content exported', 'elementor' );
	}, [ exportedData?.manifest?.content ] );

	const getPluginsSummary = useCallback( () => {
		return exportedData?.manifest?.plugins ? exportedData?.manifest?.plugins.map( ( plugin ) => plugin.name ).join( ' | ' ) : __( 'No plugins exported', 'elementor' );
	}, [ exportedData?.manifest?.plugins ] );

	const getSettingsSummary = useCallback( () => {
		debugger;
		const siteSettings = exportedData?.manifest?.[ 'site-settings' ];

		if ( ! siteSettings ) {
			return __( 'No settings exported', 'elementor' );
		}

		const summary = buildKitSettingsSummary( siteSettings );

		return summary.length > 0 ? summary : __( 'No settings exported', 'elementor' );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ exportedData?.manifest?.[ 'site-settings' ] ] );

	const sectionsTitlesMap = useMemo( () => ( {
		settings: {
			title: __( 'Site settings', 'elementor' ),
			subTitle: getSettingsSummary(),
		},
		content: {
			title: __( 'Content', 'elementor' ),
			subTitle: getContentSummary(),
		},
		plugins: {
			title: __( 'Plugins', 'elementor' ),
			subTitle: getPluginsSummary(),
		},
		templates: {
			title: __( 'Templates', 'elementor' ),
			subTitle: getTemplatesSummary(),
		},
	} ), [ getPluginsSummary, getContentSummary, getTemplatesSummary, getSettingsSummary ] );

	return (
		<Box sx={ { width: '100%', border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5, textAlign: 'start' } } data-testid="export-complete-summary">
			<Typography variant="subtitle1" color="text.primary" sx={ { mb: 2 } }>
				{ __( 'What\'s included:', 'elementor' ) }
			</Typography>

			<Stack spacing={ 2 } sx={ { maxWidth: '1075px' } } >
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
	includes: PropTypes.arrayOf( PropTypes.string ).isRequired,
	exportedData: PropTypes.shape( {
		manifest: PropTypes.shape( {
			plugins: PropTypes.arrayOf( PropTypes.shape( {
				name: PropTypes.string,
			} ) ),
			templates: PropTypes.object,
			'site-settings': PropTypes.object,
		} ),
	} ),
};
