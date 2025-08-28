import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from '@reach/router';
import { Button, Stack, Box, Typography, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { BaseLayout, TopBar, Footer, PageHeader, CenteredContent, CompleteIcon, CompleteHeading, CompleteSummary } from '../../shared/components';
import { useImportContext } from '../context/import-context';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { buildKitSettingsSummary } from '../../shared/utils/utils';

const handleDone = () => {
	window.top.location = elementorAppConfig.admin_url;
};

const handleSeeItLive = () => {
	window.top.location = elementorAppConfig?.home_url ?? '';
};

export default function ImportComplete() {
	const { data, isCompleted, runnersState } = useImportContext();
	const { includes, analytics, uploadedData } = data;
	const navigate = useNavigate();

	const getTemplatesSummary = useCallback( () => {
		const templatesSummary = runnersState.templates?.succeed_summary;

		if ( ! templatesSummary ) {
			return __( 'No templates imported', 'elementor' );
		}

		const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.templates || {};

		const summaryParts = Object.entries( templatesSummary )
			.map( ( [ docType, count ] ) => {
				const label = summaryTitles[ docType ];
				if ( ! label ) {
					return null;
				}

				const title = count > 1 ? label.plural : label.single;
				return `${ count } ${ title }`;
			} ).filter( ( part ) => part !== null );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No templates imported', 'elementor' );
	}, [ runnersState.templates?.succeed_summary ] );

	const getContentSummary = useCallback( () => {
		const content = data?.uploadedData?.manifest?.content;
		if ( ! content ) {
			return __( 'No content imported', 'elementor' );
		}

		const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content || {};

		const summaryParts = Object.entries( content ).map( ( [ docType, docs ] ) => {
			const label = summaryTitles[ docType ];
			if ( ! label ) {
				return null;
			}
			const count = Object.keys( docs ).length;
			if ( 0 === count ) {
				return null;
			}

			const title = count > 1 ? label.plural : label.single;
			return `${ count } ${ title }`;
		} ).filter( ( part ) => part !== null );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No content imported', 'elementor' );
	}, [ data?.uploadedData?.manifest?.content ] );

	const getPluginsSummary = useCallback( () => {
		return runnersState.plugins ? runnersState.plugins.join( ' | ' ) : __( 'No plugins imported', 'elementor' );
	}, [ runnersState.plugins ] );

	const getSettingsSummary = useCallback( () => {
		const siteSettings = data.includes.includes( 'settings' )
			? data?.customization?.settings || data?.uploadedData?.manifest[ 'site-settings' ] || {}
			: {};

		if ( ! Object.keys( siteSettings ).length || ! Object.keys( runnersState[ 'site-settings' ] || {} ).length ) {
			return __( 'No settings imported', 'elementor' );
		}

		const summary = buildKitSettingsSummary( siteSettings );

		return summary.length > 0 ? summary : __( 'No settings imported', 'elementor' );
	}, [ data, runnersState ] );

	const summaryData = useMemo( () => ( {
		content: {
			title: __( 'Content', 'elementor' ),
			subTitle: getContentSummary(),
		},
		templates: {
			title: __( 'Templates', 'elementor' ),
			subTitle: getTemplatesSummary(),
		},
		settings: {
			title: __( 'Site settings', 'elementor' ),
			subTitle: getSettingsSummary(),
		},
		plugins: {
			title: __( 'Plugins', 'elementor' ),
			subTitle: getPluginsSummary(),
		},
	} ), [ getPluginsSummary, getTemplatesSummary, getSettingsSummary, getContentSummary ] );

	useEffect( () => {
		if ( ! isCompleted ) {
			navigate( '/import-customization', { replace: true } );
		}
	}, [ isCompleted, navigate ] );

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="outlined"
				color="secondary"
				size="small"
				data-testid="see-it-live-button"
				onClick={ handleSeeItLive }
			>
				{ __( 'See it Live', 'elementor' ) }
			</Button>
			<Button
				variant="contained"
				color="primary"
				size="small"
				onClick={ handleDone }
				data-testid="close-button"
			>
				{ __( 'Close', 'elementor' ) }
			</Button>
		</Stack>
	);

	const headerContent = (
		<PageHeader title={ __( 'Import', 'elementor' ) } />
	);

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitImportSummary );
	}, [] );

	useEffect( () => {
		AppsEventTracking.sendExportKitCustomization( {
			kit_source: data?.kitUploadParams?.source || 'file',
			kit_import_content: includes.includes( 'content' ),
			kit_import_templates: includes.includes( 'templates' ),
			kit_import_settings: includes.includes( 'settings' ),
			kit_import_plugins: includes.includes( 'plugins' ),
			kit_import_deselected: analytics?.customization,
			kit_description: !! uploadedData?.manifest?.description,
		} );
	}, [ includes, analytics, uploadedData, data ] );

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<CenteredContent hasFooter={ true } maxWidth="800px">
				<Stack spacing={ 3 } alignItems="center" data-testid="import-complete-content">
					<CompleteIcon
						imageSrc={ elementorAppConfig.assets_url + 'images/kit-is-live.svg' }
						altText={ __( 'Kit is live illustration', 'elementor' ) }
						testId="import-complete-icon"
					/>

					<CompleteHeading
						title={ __( 'Your website templates is now live on your site!', 'elementor' ) }
						subtitle={ __( 'You\'ve imported and applied the following to your site:', 'elementor' ) }
						testId="import-complete-heading"
					/>

					<CompleteSummary
						summaryData={ summaryData }
						testId="import-complete-summary"
					/>

					<Box mt={ 2 }>
						<Stack direction="row" justifyContent="center" alignItems="center" spacing={ 3 }>
							<Typography variant="body2" color="text.secondary">
								{ __( 'Build sites faster with Website Templates.', 'elementor' ) }
								<Link href="https://go.elementor.com/app-what-are-kits" color="info.light" target="_blank" sx={ { ml: 1, textDecoration: 'none' } }>
									{ __( 'Show me how', 'elementor' ) }
								</Link>
							</Typography>
						</Stack>
					</Box>
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
