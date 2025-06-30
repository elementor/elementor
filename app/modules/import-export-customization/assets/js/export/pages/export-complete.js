import { useEffect, useRef } from 'react';
import { Redirect } from '@reach/router';
import { Button, Stack } from '@elementor/ui';
import { BaseLayout, TopBar, Footer, PageHeader, CenteredContent } from '../../shared/components';
import { useExportContext } from '../context/export-context';
import ExportCompleteSummary from '../components/export-complete-summary';
import ExportCompleteIcon from '../components/export-complete-icon';
import ExportCompleteHeading from '../components/export-complete-heading';
import ExportCompleteDownloadLink from '../components/export-complete-download-link';

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;

export default function ExportComplete() {
	const { data, isCompleted } = useExportContext();
	const { exportedData, kitInfo } = data;
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
					onClick={ () => window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud' }
				>
					{ __( 'View in Library', 'elementor' ) }
				</Button>
			) : (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ handleDone }
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
				<Stack spacing={ 3 } alignItems="center">
					<ExportCompleteIcon />

					<ExportCompleteHeading isCloudExport={ isCloudExport } />

					<ExportCompleteSummary
						kitInfo={ kitInfo }
						includes={ data.includes }
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
