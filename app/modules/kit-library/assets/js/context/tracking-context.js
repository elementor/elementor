import React, { createContext, useContext, useEffect } from 'react';
import useKitLibraryTracking from '../hooks/use-kit-library-tracking';
import PropTypes from 'prop-types';

const TrackingContext = createContext();

export const TrackingProvider = ( { children } ) => {
	const tracking = useKitLibraryTracking();

	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const source = urlParams.get( 'source' ) || 'direct';
		tracking.trackKitlibOpened( source );
	}, [] );

	return (
		<TrackingContext.Provider value={ tracking }>
			{ children }
		</TrackingContext.Provider>
	);
};

export const useTracking = () => {
	const context = useContext( TrackingContext );
	if ( ! context ) {
		throw new Error( 'useTracking must be used within a TrackingProvider' );
	}
	return context;
};

export default TrackingContext;

TrackingProvider.propTypes = {
	children: PropTypes.node,
};
