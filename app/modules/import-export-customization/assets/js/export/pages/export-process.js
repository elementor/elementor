import { Redirect } from '@reach/router';
import { Stack } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import { EXPORT_STATUS, useExportContext } from '../context/export-context';
import { useExportKit } from '../hooks/use-export-kit';
import ExportProcessing from '../components/export-processing';
import { ProcessingErrorDialog } from '../../shared/components/error/processing-error-dialog';

export default function ExportProcess() {
	const { data, dispatch, isExporting, isPending } = useExportContext();
	const { kitInfo, includes, customization } = data;

	const { status, STATUS_PROCESSING, STATUS_PROCESSING_MEDIA, STATUS_ERROR, error, exportKit, retryMediaProcessing, deleteKit, exportedData } = useExportKit( {
		includes,
		kitInfo,
		customization,
		isExporting,
		dispatch,
	} );

	if ( isPending ) {
		return <Redirect to="/export/" replace />;
	}

	const getStatusText = () => {
		if ( status === STATUS_PROCESSING ) {
			return __( 'Setting up your website template...', 'elementor' );
		}

		if ( status === STATUS_PROCESSING_MEDIA ) {
			return __( 'Processing media files...', 'elementor' );
		}

		return __( 'Export failed', 'elementor' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	const handleTryAgain = () => {
		const isMediaError = 'media-processing-error' === error?.code;

		if ( isMediaError ) {
			retryMediaProcessing();
		} else {
			exportKit();
		}
	};

	const handleCloseError = () => {
		const isMediaError = 'media-processing-error' === error?.code;

		dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.PENDING } );

		if ( isMediaError && exportedData?.kit?.id ) {
			deleteKit( exportedData.kit.id );
		}
	};

	const handleExportAsZip = () => {
		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
		dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
	};

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<CenteredContent>
				<Stack spacing={ 3 } alignItems="center">
					{ ( status === STATUS_PROCESSING || status === STATUS_PROCESSING_MEDIA ) && (
						<ExportProcessing statusText={ getStatusText() } />
					) }

					{ status === STATUS_ERROR && (
						<ProcessingErrorDialog
							error={ error }
							handleClose={ handleCloseError }
							handleTryAgain={ handleTryAgain }
							handleExportAsZip={ handleExportAsZip }
						/>
					) }
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
