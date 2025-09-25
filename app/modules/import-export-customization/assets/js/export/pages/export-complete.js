import { useEffect, useRef } from 'react';
import { Redirect, useNavigate } from '@reach/router';
import { Button, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { BaseLayout, TopBar, Footer, PageHeader, CenteredContent, CompleteIcon, CompleteHeading, CompleteSummary, DownloadLink } from '../../shared/components';
import { useExportContext } from '../context/export-context';
import { buildKitSettingsSummary } from '../../shared/utils/utils';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;

export default function ExportComplete() {
	const navigate = useNavigate();
	const { data, isCompleted } = useExportContext();
	const { exportedData, kitInfo, includes, analytics } = data;
	const downloadLink = useRef( null );

	const downloadFile = ( event ) => {
		event?.preventDefault();

		if ( ! downloadLink.current ) {
			const link = document.createElement( 'a' );

			const defaultKitName = 'elementor-kit';
			const kitName = kitInfo.title || defaultKitName;
			const sanitizedKitName = kitName
				.replace( INVALID_FILENAME_CHARS, '' )
				.trim();

			const fileName = sanitizedKitName || defaultKitName;

			link.href = 'data:application/zip;base64,' + exportedData.file;
			link.download = fileName + '.zip';

			downloadLink.current = link;
		}

		downloadLink.current.click();
	};

	useEffect( () => {
		if ( 'cloud' !== kitInfo.source && exportedData?.file ) {
			downloadFile();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ exportedData, kitInfo.source ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportSummary );
	}, [] );

	useEffect( () => {
		if ( exportedData.manifest ) {
			let pages = '';

			if ( includes.includes( 'pages' ) ) {
				pages = analytics?.customization?.content?.includes( 'pages' ) ? 'partial' : 'all';
			}

			let postTypes = '';

			if ( includes.includes( 'postTypes' ) ) {
				postTypes = analytics?.customization?.content?.includes( 'customPostTypes' ) ? 'partial' : 'all';
			}

			let plugins = '';

			if ( includes.includes( 'plugins' ) ) {
				plugins = analytics?.customization?.plugins?.length ? 'partial' : 'all';
			}

			AppsEventTracking.sendExportKitCustomization( {
				kit_export_content: includes.includes( 'content' ),
				kit_export_templates: includes.includes( 'templates' ),
				kit_export_settings: includes.includes( 'settings' ),
				kit_export_plugins: includes.includes( 'plugins' ),
				kit_export_deselected: analytics?.customization,
				kit_description: Boolean( kitInfo.description ),
				kit_page_count: exportedData?.manifest?.content?.page ? Object.values( exportedData?.manifest?.content?.page ).length : 0,
				kit_post_type_count: exportedData?.manifest?.content ? Object.keys( exportedData?.manifest?.content )
					.filter( ( key ) => ! elementorAppConfig?.builtinWpPostTypes?.includes( key ) ).length : 0,
				kit_post_count: exportedData?.manifest?.content?.post ? Object.values( exportedData?.manifest?.content?.post ).length : 0,
				pages,
				postTypes,
				plugins,
			} );
		}
	}, [ includes, exportedData?.manifest, analytics?.customization, kitInfo.description ] );

	const handleDone = () => {
		window.top.location = elementorAppConfig.admin_url;
	};

	if ( ! isCompleted ) {
		return <Redirect to="/export-customization/" replace />;
	}

	const isCloudExport = 'cloud' === kitInfo.source;

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			{ isCloudExport ? (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ () => navigate( '/kit-library/cloud' ) }
					data-testid="view-in-library-button"
				>
					{ __( 'View in Library', 'elementor' ) }
				</Button>
			) : (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ handleDone }
					data-testid="done-button"
				>
					{ __( 'Done', 'elementor' ) }
				</Button>
			) }
		</Stack>
	);

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	const getTemplatesSummary = () => {
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
	};

	const getContentSummary = () => {
		const content = exportedData?.manifest?.content;
		const wpContent = exportedData?.manifest?.[ 'wp-content' ];
		if ( ! content && ! wpContent ) {
			return __( 'No content exported', 'elementor' );
		}

		const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content || {};

		const summaryPartsMap = {};

		const getSummaryParts = ( [ docType, docs ] ) => {
			const label = summaryTitles[ docType ];
			if ( ! label ) {
				return;
			}

			let count = Object.keys( docs ).length;
			if ( 0 === count ) {
				return;
			}

			const existingPart = summaryPartsMap[ docType ];

			if ( existingPart ) {
				count += existingPart.count;
			}

			const title = count > 1 ? label.plural : label.single;
			summaryPartsMap[ docType ] = {
				count,
				title,
			};
		};

		Object.entries( content || {} ).forEach( getSummaryParts );
		Object.entries( wpContent || {} ).forEach( getSummaryParts );

		const summaryParts = Object.values( summaryPartsMap ).map( ( { count, title } ) => `${ count } ${ title }` );

		return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : __( 'No content exported', 'elementor' );
	};

	const getPluginsSummary = () => {
		return exportedData?.manifest?.plugins ? exportedData?.manifest?.plugins.map( ( plugin ) => plugin.name ).join( ' | ' ) : __( 'No plugins exported', 'elementor' );
	};

	const getSettingsSummary = () => {
		const siteSettings = exportedData?.manifest?.[ 'site-settings' ];

		if ( ! siteSettings ) {
			return __( 'No settings exported', 'elementor' );
		}

		const summary = buildKitSettingsSummary( siteSettings );

		return summary.length > 0 ? summary : __( 'No settings exported', 'elementor' );
	};

	const summaryData = {
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
	};

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<CenteredContent hasFooter={ true } maxWidth="800px">
				<Stack spacing={ 3 } alignItems="center" data-testid="export-complete-content">
					<CompleteIcon
						imageSrc={ elementorAppConfig.assets_url + 'images/kit-is-live.svg' }
						altText=""
						testId="export-complete-icon"
					/>

					<CompleteHeading
						title={ isCloudExport
							? __( 'Your website template is now saved to the library!', 'elementor' )
							: __( 'Your .zip file is ready', 'elementor' )
						}
						subtitle={ isCloudExport
							? __( 'You can find it in the My Website Templates tab.', 'elementor' )
							: __( 'Once the download is complete, you can upload it to be used for other sites.', 'elementor' )
						}
						linkText={ isCloudExport ? __( 'Take me there', 'elementor' ) : undefined }
						linkHref={ isCloudExport ? elementorAppConfig.base_url + '#/kit-library/cloud' : undefined }
						testId="export-complete-heading"
					/>

					<CompleteSummary
						summaryData={ summaryData }
						testId="export-complete-summary"
					/>

					{ ! isCloudExport && (
						<DownloadLink
							message={ __( 'Is the automatic download not starting?', 'elementor' ) }
							linkText={ __( 'Download manually', 'elementor' ) }
							onClick={ downloadFile }
							testId="export-complete-download-link"
						/>
					) }
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
