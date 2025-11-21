import { CircularProgress, Stack, Typography } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { BaseLayout, CenteredContent, PageHeader, TopBar } from '../../shared/components';
import { useImportKit, IMPORT_PROCESSING_STATUS } from '../hooks/use-import-kit';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';
import { PluginActivation } from '../components/plugin-activation';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { ProcessingErrorDialog } from '../../shared/components/error/processing-error-dialog';
import useReturnToRedirect from '../../shared/hooks/use-return-to-redirect';

const headerContent = (
	<PageHeader title={ __( 'Import', 'elementor' ) } />
);

export default function ImportProcess() {
	const { data, dispatch, isProcessing, runnersState } = useImportContext();
	const { includes, customization } = data;
	const { status, error, importKit } = useImportKit( {
		data,
		includes,
		customization,
		isProcessing,
		dispatch,
	} );

	const navigate = useNavigate();
	const { attemptRedirect } = useReturnToRedirect( data.returnTo );

	useEffect( () => {
		if ( ! error ) {
			if ( IMPORT_PROCESSING_STATUS.DONE === status ) {
				AppsEventTracking.sendKitImportStatus( null );
				if ( attemptRedirect() ) {
					return;
				}

				navigate( 'import/complete' );
			} else if ( ! isProcessing ) {
				navigate( 'import', { replace: true } );
			}
		} else {
			AppsEventTracking.sendKitImportStatus( error );
		}
	}, [ status, error, navigate, isProcessing, attemptRedirect ] );

	const handleTryAgain = () => {
		importKit();
	};
	const handleCloseError = () => {
		if ( attemptRedirect() ) {
			return;
		}

		dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.CUSTOMIZING } );
		navigate( 'import/content' );
	};

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

					<ProcessingErrorDialog
						error={ error }
						handleClose={ handleCloseError }
						handleTryAgain={ handleTryAgain }
					/>
				</Stack>
			</CenteredContent>
		</BaseLayout>
	);
}
