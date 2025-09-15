import { Redirect } from '@reach/router';
import { Stack } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import { useExportContext } from '../context/export-context';
import { useExportKit } from '../hooks/use-export-kit';
import ExportProcessing from '../components/export-processing';
import ExportError from '../components/export-error';

export default function ExportProcess() {
	const { data, dispatch, isExporting, isPending } = useExportContext();
	const { kitInfo, includes, customization } = data;

	const { status, STATUS_PROCESSING, STATUS_ERROR } = useExportKit( {
		includes,
		kitInfo,
		customization,
		isExporting,
		dispatch,
	} );

	if ( isPending ) {
		return <Redirect to="/export-customization/" replace />;
	}

	const getStatusText = () => {
		if ( status === STATUS_PROCESSING ) {
			return __( 'Setting up your website template...', 'elementor' );
		}

		return __( 'Export failed', 'elementor' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<CenteredContent>
				<Stack spacing={ 3 } alignItems="center">
					{ status === STATUS_PROCESSING && (
						<ExportProcessing statusText={ getStatusText() } />
					) }

					{ status === STATUS_ERROR && (
						<ExportError statusText={ getStatusText() } />
					) }
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
