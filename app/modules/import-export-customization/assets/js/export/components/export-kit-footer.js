import { useRef, useEffect } from 'react';
import { Button, Stack, CircularProgress } from '@elementor/ui';
import { useNavigate } from '@reach/router';

import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useConnectState from '../../shared/hooks/use-connect-state';
import { useExportContext, EXPORT_STATUS } from '../context/export-context';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export default function ExportKitFooter() {
	const connectButtonRef = useRef();
	const navigate = useNavigate();
	const { isConnected, isConnecting, setConnecting, handleConnectSuccess, handleConnectError } = useConnectState();
	const { data, dispatch, hasValidationErrors, isExporting } = useExportContext();

	const { data: cloudKitsData, isLoading: isCheckingEligibility, refetch: refetchEligibility } = useCloudKitsEligibility( {
		enabled: isConnected,
	} );

	const isCloudKitsEligible = cloudKitsData?.is_eligible || false;

	useEffect( () => {
		if ( ! connectButtonRef.current ) {
			return;
		}

		jQuery( connectButtonRef.current ).elementorConnect( {
			popup: {
				width: 600,
				height: 700,
			},
			success: () => {
				handleConnectSuccess();
				setConnecting( true );
				refetchEligibility();
			},
			error: () => {
				handleConnectError();
			},
		} );
	}, [ handleConnectSuccess, handleConnectError, setConnecting, refetchEligibility ] );

	useEffect( () => {
		if ( ! isConnecting || isCheckingEligibility ) {
			return;
		}

		if ( ! isCloudKitsEligible ) {
			navigate( '/kit-library/cloud' );
		} else {
			dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
			dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isConnecting, isCheckingEligibility, isCloudKitsEligible, dispatch ] );

	useEffect( () => {
		if ( isConnecting && ! isCheckingEligibility ) {
			setConnecting( false );
		}
	}, [ isConnecting, isCheckingEligibility, setConnecting ] );

	useEffect( () => {
		if ( isExporting ) {
			navigate( '/export/process' );
		}
	}, [ isExporting, navigate ] );

	const handleUpgradeClick = () => {
		AppsEventTracking.sendKitsCloudUpgradeClicked( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomization );
		navigate( '/kit-library/cloud' );
	};

	const handleUploadClick = () => {
		if ( hasValidationErrors ) {
			return;
		}

		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
		dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
	};

	const handleExportAsZip = () => {
		if ( hasValidationErrors ) {
			return;
		}

		const hasCloudMediaFormat = 'cloud' === data.customization?.content?.mediaFormat;

		if ( hasCloudMediaFormat ) {
			dispatch( { type: 'SET_MEDIA_FORMAT_VALIDATION', payload: true } );
			return;
		}

		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
		dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
	};

	const renderSaveToLibraryButton = () => {
		if ( ! isConnected ) {
			return (
				<Button
					ref={ connectButtonRef }
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ hasValidationErrors }
					href={ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url?.replace( /&#038;/g, '&' ) || '#' }
					data-testid="export-kit-footer-save-to-library-button"
				>
					{ __( 'Save to library', 'elementor' ) }
				</Button>
			);
		}

		if ( isConnecting || isCheckingEligibility ) {
			return (
				<Button
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ true }
					startIcon={ <CircularProgress size={ 16 } /> }
					data-testid="export-kit-footer-save-to-library-button"
				>
					{ __( 'Save to library', 'elementor' ) }
				</Button>
			);
		}

		if ( ! isCloudKitsEligible ) {
			return (
				<Button
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ hasValidationErrors }
					onClick={ handleUpgradeClick }
					data-testid="export-kit-footer-save-to-library-button"
				>
					{ __( 'Save to library', 'elementor' ) }
				</Button>
			);
		}

		return (
			<Button
				variant="outlined"
				color="secondary"
				size="small"
				disabled={ hasValidationErrors }
				onClick={ handleUploadClick }
				data-testid="export-kit-footer-save-to-library-button"
			>
				{ __( 'Save to library', 'elementor' ) }
			</Button>
		);
	};

	return (
		<Stack direction="row" spacing={ 1 }>
			{ renderSaveToLibraryButton() }
			<Button
				variant="contained"
				color="primary"
				size="small"
				disabled={ hasValidationErrors }
				onClick={ handleExportAsZip }
				data-testid="export-kit-footer-export-zip-button"
			>
				{ __( 'Export as .zip', 'elementor' ) }
			</Button>
		</Stack>
	);
}
