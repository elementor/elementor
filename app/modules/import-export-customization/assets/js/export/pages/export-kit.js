import React, { useRef, useEffect } from 'react';
import { Button, Box, Stack, CircularProgress } from '@elementor/ui';

import { BaseLayout, TopBar, Footer, PageHeader } from '../../components';
import ExportIntro from '../../components/export-intro';
import KitContent from '../../components/kit-content';
import KitInfo from '../../components/kit-info';
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useConnectState from '../../hooks/use-connect-state';
import { useExportContext } from '../../context/export-context';

export default function ExportKit() {
	const connectButtonRef = useRef();
	const { isConnected, isConnecting, setConnecting, handleConnectSuccess, handleConnectError } = useConnectState();
	const { dispatch, isTemplateNameValid } = useExportContext();

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
			window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
		} else {
			dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
			dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: true } );
			window.location.href = elementorAppConfig.base_url + '#/export-customization/process';
		}
	}, [ isConnecting, isCheckingEligibility, isCloudKitsEligible, dispatch ] );

	useEffect( () => {
		if ( isConnecting && ! isCheckingEligibility ) {
			setConnecting( false );
		}
	}, [ isConnecting, isCheckingEligibility, setConnecting ] );

	const handleUpgradeClick = () => {
		window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
	};

	const handleUploadClick = () => {
		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
		dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: true } );
		window.location.href = elementorAppConfig.base_url + '#/export-customization/process';
	};

	const handleExportAsZip = () => {
		dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
		dispatch( { type: 'SET_IS_EXPORT_PROCESS_STARTED', payload: true } );
		window.location.href = elementorAppConfig.base_url + '#/export-customization/process';
	};

	const renderSaveToLibraryButton = () => {
		if ( ! isConnected ) {
			return (
				<Button
					ref={ connectButtonRef }
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ ! isTemplateNameValid }
					href={ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url?.replace( /&#038;/g, '&' ) || '#' }
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
					disabled={ ! isTemplateNameValid }
					onClick={ handleUpgradeClick }
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
				disabled={ ! isTemplateNameValid }
				onClick={ handleUploadClick }
			>
				{ __( 'Save to library', 'elementor' ) }
			</Button>
		);
	};

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			{ renderSaveToLibraryButton() }
			<Button
				variant="contained"
				color="primary" 
				size="small"
				disabled={ ! isTemplateNameValid }
				onClick={ handleExportAsZip }
			>
				{ __( 'Export as .zip', 'elementor' ) }
			</Button>
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
			<Box sx={ { p: 3, mb: 2, maxWidth: '1075px', mx: 'auto' } }>
				<ExportIntro />
				<KitInfo />
				<KitContent />
			</Box>
		</BaseLayout>
	);
}
