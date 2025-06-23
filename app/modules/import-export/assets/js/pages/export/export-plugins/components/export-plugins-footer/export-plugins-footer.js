import { useContext, useRef, useEffect, useState } from 'react';
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
	const { isConnected, handleConnectSuccess, handleConnectError } = useConnectState();
	const connectButtonRef = useRef();
	const [ isProcessingConnection, setIsProcessingConnection ] = useState( false );

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
				setIsProcessingConnection( true );
				
				refetchEligibility().then( ( result ) => {
					const newEligibility = result.data;
					if ( ! newEligibility ) {
						window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
					} else {
						exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.CLOUD } );
						window.location.href = elementorAppConfig.base_url + '#/export/process';
					}
				} ).catch( () => {
					window.location.reload();
				} );
			},
			error: () => {
				handleConnectError();
			},
		} );
	}, [ handleConnectSuccess, handleConnectError, refetchEligibility, exportContext ] );

	const handleUpgradeClick = () => {
		window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud';
	};

	const handleUploadClick = () => {
		exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.CLOUD } );
	};

	return (
		<ActionsFooter className="e-app-export-actions-container" >
			<Button
				text={ __( 'Back', 'elementor' ) }
				variant="contained"
				url="/export"
			/>

			{ ! isConnected ? (
				<Button
					elRef={ connectButtonRef }
					text={ __( 'Save to library', 'elementor' ) }
					variant="outlined"
					color="secondary"
					url={ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url?.replace( /&#038;/g, '&' ) || '#' }
				/>
			) : isProcessingConnection || isCheckingEligibility ? (
				<Button
					variant="outlined"
					color="secondary"
					icon="eicon-loading eicon-animation-spin"
				/>
			) : ! isCloudKitsEligible ? (
				<Button
					text={ __( 'Save to library', 'elementor' ) }
					variant="outlined"
					color="secondary"
					onClick={ handleUpgradeClick }
				/>
			) : (
				<Button
					text={ __( 'Save to library', 'elementor' ) }
					variant="outlined"
					color="secondary"
					url="/export/process"
					onClick={ handleUploadClick }
				/>
			) }

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
