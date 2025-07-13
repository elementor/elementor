import { CircularProgress, Stack } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { useEffect } from 'react';
import { BaseLayout, CenteredContent, PageHeader, TopBar } from '../../shared/components';
import { useImportKit, IMPORT_PROCESSING_STATUS } from '../hooks/use-import-kit';
import ImportError from '../components/import-error';
import { useImportContext } from '../context/import-context';
import { PluginActivation } from '../components/plugin-activation';

const headerContent = (
	<PageHeader title={ __( 'Import', 'elementor' ) } />
);

export default function ImportProcess() {
	const { isProcessing } = useImportContext();
	const { status, error, runnersState } = useImportKit();
	const navigate = useNavigate();

	useEffect( () => {
		if ( IMPORT_PROCESSING_STATUS.DONE === status && ! error ) {
			navigate( '/import-customization/complete' );
		}
	}, [ status, error, navigate ] );

	useEffect( () => {
		if ( IMPORT_PROCESSING_STATUS.DONE === status && ! error ) {
			navigate( 'import-customization/complete' );
		} else if ( ! isProcessing ) {
			navigate( 'import-customization', { replace: true } );
		}
	}, [ status, error, navigate, isProcessing ] );

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
		>
			<CenteredContent>
				<Stack spacing={ 3 } alignItems="center">
					{ status === IMPORT_PROCESSING_STATUS.IN_PROGRESS && ! error && (
						<>
							<CircularProgress size={ 30 } />
							<PluginActivation plugins={ runnersState?.plugins } />
						</>
					) }

					{ error && (
						<ImportError statusText={ error.message } />
					) }
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
