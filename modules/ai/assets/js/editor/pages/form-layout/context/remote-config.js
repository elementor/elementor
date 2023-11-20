import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getRemoteConfig } from '../../../api';
import { AlertDialog } from '../../../components/alert-dialog';

const RemoteConfigContext = React.createContext( {} );

export const useRemoteConfig = () => React.useContext( RemoteConfigContext );

export const RemoteConfigProvider = ( props ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ isError, setIsError ] = useState( false );
	const [ remoteConfig, setRemoteConfig ] = useState( {
		builderUrl: '',
	} );

	const fetchData = async () => {
		setIsLoading( true );

		try {
			const result = await getRemoteConfig().finally( () => {
				setIsLoaded( true );
				setIsLoading( false );
			} );

			setRemoteConfig( result );
		} catch ( error ) {
			setIsError( true );
			setIsLoaded( true );
			setIsLoading( false );
		}
	};

	if ( ! isLoaded && ! isLoading ) {
		fetchData();
	}

	if ( isError ) {
		return (
			<AlertDialog
				message={ __( "Can't connect server", 'elementor' ) }
				onClose={ props.onError }
			/>
		);
	}

	return (
		<RemoteConfigContext.Provider
			value={ {
				isLoading,
				isLoaded,
				isError,
				builderUrl: remoteConfig.builderUrl,
			} }
		>
			{ props.children }
		</RemoteConfigContext.Provider>
	);
};

RemoteConfigProvider.propTypes = {
	children: PropTypes.node.isRequired,
	onError: PropTypes.func.isRequired,
};
