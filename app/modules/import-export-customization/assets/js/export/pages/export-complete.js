import { useEffect, useRef } from 'react';
import { Redirect, useNavigate } from '@reach/router';
import { Button, Stack } from '@elementor/ui';
import { BaseLayout, TopBar, Footer, PageHeader, CenteredContent } from '../../shared/components';
import { useExportContext } from '../context/export-context';
import ExportCompleteSummary from '../components/export-complete-summary';
import ExportCompleteIcon from '../components/export-complete-icon';
import ExportCompleteHeading from '../components/export-complete-heading';
import ExportCompleteDownloadLink from '../components/export-complete-download-link';
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
	}, [ exportedData, kitInfo.source, downloadFile ] );

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

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<CenteredContent hasFooter={ true }>
				<Stack spacing={ 3 } alignItems="center" data-testid="export-complete-content">
					<ExportCompleteIcon />

					<ExportCompleteHeading isCloudExport={ isCloudExport } />

					<ExportCompleteSummary
						kitInfo={ kitInfo }
						includes={ data.includes }
						exportedData={ exportedData }
					/>

					{ ! isCloudExport && (
						<ExportCompleteDownloadLink
							onDownloadClick={ downloadFile }
						/>
					) }
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
