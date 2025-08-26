import { Box, Typography, Button, Link, Stack } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useCallback } from 'react';
import { BaseLayout, TopBar, PageHeader, Footer } from '../../shared/components';
import { useImportContext } from '../context/import-context';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import SummarySection from '../../shared/components/summary-section';
import { buildKitSettingsSummary } from '../../shared/utils/utils';

const Illustration = () => (
	<Box
		sx={ {
			height: 140,
			alignSelf: 'center',
			borderRadius: 2,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		} }
	>
		<img
			src={ elementorAppConfig.assets_url + 'images/kit-is-live.svg' }
			alt={ __( 'Kit is live illustration', 'elementor' ) }
		/>
	</Box>
);

const ExternalLinkIcon = () => (
	<Box
		component="i"
		sx={ { fontFamily: 'eicons' } }
		className="eps-icon eicon-editor-external-link"
	/>
);

const handleDone = () => {
	window.top.location = elementorAppConfig.admin_url;
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
			} )
			.filter( ( part ) => part );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No templates imported', 'elementor' );
	}, [ runnersState.templates?.succeed_summary ] );

	const getPluginsSummary = useCallback( () => {
		return runnersState.plugins ? runnersState.plugins.join( ' | ' ) : __( 'No plugins imported', 'elementor' );
	}, [ runnersState.plugins ] );

	const getSettings = useCallback( () => {
		const siteSettings = data.includes.includes( 'settings' )
			? data?.customization?.settings || data?.uploadedData?.manifest[ 'site-settings' ] || {}
			: {};

		if ( ! Object.keys( siteSettings ).length || ! Object.keys( runnersState[ 'site-settings' ] || {} ).length ) {
			return __( 'No settings imported', 'elementor' );
		}

		const summary = buildKitSettingsSummary( siteSettings );

		return summary.length > 0 ? summary : __( 'No settings imported', 'elementor' );
	}, [ data, runnersState ] );

	const sectionsTitlesMap = useMemo( () => ( {
		settings: {
			title: __( 'Site settings', 'elementor' ),
			subTitle: getSettings(),
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
	} ), [ getPluginsSummary, getTemplatesSummary, getSettings ] );

	const headerContent = (
		<PageHeader title={ __( 'Import', 'elementor' ) } />
	);

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="outlined"
				color="secondary"
				startIcon={ <ExternalLinkIcon /> }
				size="small"
				data-testid="see-it-live-button"
			>
				{ __( 'See it Live', 'elementor' ) }
			</Button>
			<Button
				variant="contained"
				color="primary"
				size="small"
				sx={ { px: 4 } }
				data-testid="close-button"
				onClick={ handleDone }
			>
				{ __( 'Close', 'elementor' ) }
			</Button>
		</Stack>
	);

	useEffect( () => {
		if ( ! isCompleted ) {
			navigate( '/import-customization', { replace: true } );
		}
	}, [ isCompleted, navigate ] );

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
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				mx="auto"
				pt={ 10 }
				gap={ 4 }
			>
				<Illustration />
				<Stack spacing={ 1 } alignItems="center">
					<Typography
						variant="h4"
						color="text.primary"
					>
						{ __( 'Your website templates is now live on your site!', 'elementor' ) }
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
					>
						{ __( 'You\'ve imported and applied the following to your site:', 'elementor' ) }
					</Typography>
				</Stack>
				<Stack
					spacing={ 1 }
					sx={ {
						borderRadius: 2,
						boxShadow: 0,
						border: '1px solid',
						borderColor: 'elevation.outlined',
						p: 2,
					} }
				>
					<Box>
						<Typography variant="subtitle1" color="text.primary" sx={ { fontWeight: 500 } }>
							{ __( 'This website templates includes:', 'elementor' ) }
						</Typography>
					</Box>
					<Stack spacing={ 2 } sx={ { pt: 1, maxWidth: '1075px' } } >
						{ data.includes.map( ( section ) =>
							sectionsTitlesMap[ section ] ? (
								<SummarySection
									key={ section }
									title={ sectionsTitlesMap[ section ].title }
									subTitle={ sectionsTitlesMap[ section ].subTitle }
								/>
							) : null,
						) }
					</Stack>
				</Stack>
				<Box mt={ 2 }>
					<Stack direction="row" justifyContent="center" alignItems="center" spacing={ 3 }>
						<Typography variant="body2" color="text.secondary">
							{ __( 'Build sites faster with Website Templates.', 'elementor' ) }
							<Link href="https://go.elementor.com/app-what-are-kits" sx={ { color: 'info.main', ml: 1, textDecoration: 'none' } }>{ __( 'Show me how', 'elementor' ) }</Link>
						</Typography>
					</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
