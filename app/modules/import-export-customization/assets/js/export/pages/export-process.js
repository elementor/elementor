import { Redirect, useNavigate } from '@reach/router';
import { Stack, Dialog, DialogHeader, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Link, Divider, SvgIcon } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import { useExportContext } from '../context/export-context';
import { useExportKit } from '../hooks/use-export-kit';
import ExportProcessing from '../components/export-processing';


const HELP_URL = 'https://go.elementor.com/app-import-download-failed';

export default function ExportProcess() {
	const navigate = useNavigate();
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

	const handleCloseErrorModal = () => {
		// Navigate back to root view
		navigate( '/export-customization/' );
	};

	const handleTryAgain = () => {
		// Reset state and navigate back to root
		dispatch( { type: 'RESET_STATE' } );
		navigate( '/export-customization/' );
	};

	const handleLearnMore = () => {
		window.open( HELP_URL, '_blank' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<>
			<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
				<CenteredContent>
					<Stack spacing={ 3 } alignItems="center">
						{ status === STATUS_PROCESSING && (
							<ExportProcessing statusText={ getStatusText() } />
						) }
					</Stack>
				</CenteredContent>
			</BaseLayout>

			<Dialog
				open={ status === STATUS_ERROR }
				onClose={ handleCloseErrorModal }
				maxWidth="sm"
				fullWidth
			>
				<DialogHeader
					onClose={ handleCloseErrorModal }
					elevation={0}
					logo={ <SvgIcon 
						viewBox="0 0 24 24"
						fontSize="small"
						color="error"
					>
						<path fillRule="evenodd" clipRule="evenodd" d="M15.0498 2C15.2873 2 15.5191 2.04048 15.7422 2.13965C15.962 2.23735 16.136 2.37531 16.2803 2.51953L20.9805 7.21973C21.1247 7.36397 21.2627 7.53802 21.3604 7.75781C21.4595 7.98094 21.5 8.21268 21.5 8.4502V15.0498C21.5 15.2873 21.4595 15.5191 21.3604 15.7422C21.2627 15.962 21.1247 16.136 20.9805 16.2803L16.2803 20.9805C16.136 21.1247 15.962 21.2627 15.7422 21.3604C15.5191 21.4595 15.2873 21.5 15.0498 21.5H8.4502C8.21268 21.5 7.98094 21.4595 7.75781 21.3604C7.53802 21.2627 7.36397 21.1247 7.21973 20.9805L2.51953 16.2803C2.37531 16.136 2.23735 15.962 2.13965 15.7422C2.04048 15.5191 2 15.2873 2 15.0498V8.4502C2 8.21268 2.04048 7.98094 2.13965 7.75781C2.23735 7.53802 2.37531 7.36397 2.51953 7.21973L7.21973 2.51953C7.36397 2.37531 7.53802 2.23735 7.75781 2.13965C7.98094 2.04048 8.21268 2 8.4502 2H15.0498ZM11.75 14.75C11.1977 14.75 10.75 15.1977 10.75 15.75C10.75 16.3023 11.1977 16.75 11.75 16.75H11.7598L11.8623 16.7451C12.3665 16.6939 12.7598 16.2678 12.7598 15.75C12.7598 15.2322 12.3665 14.8061 11.8623 14.7549L11.7598 14.75H11.75ZM11.75 7C11.3358 7 11 7.33579 11 7.75V12.75C11 13.1642 11.3358 13.5 11.75 13.5C12.1642 13.5 12.5 13.1642 12.5 12.75V7.75C12.5 7.33579 12.1642 7 11.75 7Z" />
					</SvgIcon> }>
					<DialogTitle>
						<Typography fontWeight="500" color="text.primary" fontSize="16px">
							{ __( 'Couldn\'t Export the Website Template', 'elementor' ) }
						</Typography>
					</DialogTitle>
				</DialogHeader>
				
				<Divider />

				<DialogContent>
					<Box p={ 3 }>
						<Typography variant="body2" color="text.primary" mb={ 2 }>
							{ __( 'The export failed because it will pass the maximum Website Templates you can export.', 'elementor' ) }
						</Typography>

						<Link
							href="#"
							onClick={ (e) => {
								e.preventDefault();
								handleLearnMore();
							} }
							variant="body2"
							color="primary"
						>
							{ __( 'Learn more', 'elementor' ) }
						</Link>
					</Box>
				</DialogContent>

				<DialogActions>
					<Box p={ 3 } pt={ 0 } width="100%" display="flex" justifyContent="flex-end">
						<Button
							onClick={ handleCloseErrorModal }
							variant="outlined"
							color="secondary"
						>
							{ __( 'Close', 'elementor' ) }
						</Button>
						<Button
							onClick={ handleCloseErrorModal }
							variant="outlined"
							color="secondary"
						>
							{ __( 'Close', 'elementor' ) }
						</Button>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	);
}
