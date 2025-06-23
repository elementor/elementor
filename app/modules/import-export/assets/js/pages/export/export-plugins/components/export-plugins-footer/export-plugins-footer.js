import { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { ExportContext } from '../../../../../context/export-context/export-context-provider';
import { KIT_SOURCE_MAP } from '../../../../../hooks/use-kit';
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useConnectState from '../../../../../hooks/use-connect-state';
import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import './export-plugins-footer.scss';

export default function ExportPluginsFooter( { isKitReady } ) {
	const exportContext = useContext( ExportContext );
	const { isConnected, isConnecting, setConnecting, handleConnectSuccess, handleConnectError } = useConnectState();
	const connectButtonRef = useRef();

	const { data: isCloudKitsEligible = false, isLoading: isCheckingEligibility, refetch: refetchEligibility } = useCloudKitsEligibility( {
		enabled: isConnected,
	} );

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

	// Handle post-connection flow
	useEffect( () => {
		if ( ! isConnecting || isCheckingEligibility ) {
			return;
		}

		if ( ! isCloudKitsEligible ) {
			window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
		} else {
			exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.CLOUD } );
			window.location.href = elementorAppConfig.base_url + '#/export/process';
		}
	}, [ isConnecting, isCheckingEligibility, isCloudKitsEligible, exportContext ] );

	// Reset connecting state when eligibility check completes
	useEffect( () => {
		if ( isConnecting && ! isCheckingEligibility ) {
			setConnecting( false );
		}
	}, [ isConnecting, isCheckingEligibility, setConnecting ] );

	const handleUpgradeClick = () => {
		window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
	};

	const handleUploadClick = () => {
		exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.CLOUD } );
	};

	const renderCloudButton = () => {
		if ( ! isConnected ) {
			return (
				<Button
					elRef={ connectButtonRef }
					text={ __( 'Save to library', 'elementor' ) }
					variant="outlined"
					color="secondary"
					url={ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url?.replace( /&#038;/g, '&' ) || '#' }
				/>
			);
		}

		if ( isConnecting || isCheckingEligibility ) {
			return (
				<Button
					variant="outlined"
					color="secondary"
					icon="eicon-loading eicon-animation-spin"
				/>
			);
		}

		if ( ! isCloudKitsEligible ) {
			return (
				<Button
					text={ __( 'Save to library', 'elementor' ) }
					variant="outlined"
					color="secondary"
					onClick={ handleUpgradeClick }
				/>
			);
		}

		return (
			<Button
				text={ __( 'Save to library', 'elementor' ) }
				variant="outlined"
				color="secondary"
				url="/export/process"
				onClick={ handleUploadClick }
			/>
		);
	};

	return (
		<ActionsFooter className="e-app-export-actions-container" >
			<Button
				text={ __( 'Back', 'elementor' ) }
				variant="contained"
				url="/export"
			/>

			{ renderCloudButton() }

			<Button
				text={ __( 'Export as .zip', 'elementor' ) }
				variant="contained"
				color={ isKitReady && ! isCheckingEligibility ? 'primary' : 'disabled' }
				url={ isKitReady && ! isCheckingEligibility ? '/export/process' : '' }
				hideText={ isCheckingEligibility }
				icon={ isCheckingEligibility ? 'eicon-loading eicon-animation-spin' : '' }
				onClick={ () => {
					exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.FILE } );
				} }
			/>
		</ActionsFooter>
	);
}

ExportPluginsFooter.propTypes = {
	isKitReady: PropTypes.bool.isRequired,
};
