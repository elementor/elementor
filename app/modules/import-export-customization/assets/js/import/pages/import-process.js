import { CircularProgress, Stack, Typography } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { __ } from '@wordpress/i18n';
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
		if ( ! error ) {
			if ( IMPORT_PROCESSING_STATUS.DONE === status ) {
				navigate( 'import-customization/complete' );
			} else if ( ! isProcessing ) {
				navigate( 'import-customization', { replace: true } );
			}
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
							<Stack spacing={ 3 } alignItems="center" >
								<CircularProgress size={ 30 } />
								<Typography variant="h5" >
									{ __( 'Settings up your website templates...', 'elementor' ) }
								</Typography>
								<Stack>
									<Typography variant="subtitle1" >
										{ __( 'This usually take a few moments.', 'elementor' ) }
									</Typography>
									<Typography variant="subtitle1" >
										{ __( 'Don\'t close this window until the process is finished.', 'elementor' ) }
									</Typography>
								</Stack>
							</Stack>
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
