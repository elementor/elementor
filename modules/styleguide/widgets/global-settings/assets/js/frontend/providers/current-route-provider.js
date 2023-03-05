import React, { createContext, useEffect, useState } from 'react';
import { addEventListener } from "../../../../../assets/js/common/utils/top-events";
import { ROUTE_OPEN_EVENT } from "../../../../../assets/js/common/utils/web-cli";

export const CurrentRouteContext = createContext( null );

const CurrentRouteProvider = ( { children } ) => {
	const [ route, setRoute ] = useState( null );

	useEffect( () => {
		const onRouteChange = ( event ) => {
			setRoute( event.detail.route );
		};

		addEventListener( ROUTE_OPEN_EVENT, onRouteChange );

		return () => {
			removeEventListener( ROUTE_OPEN_EVENT, onRouteChange );
		};

	}, [] );

	//todo - add argument change here

	return (
		<CurrentRouteContext.Provider value={ { currentRoute: route } }>
			{ children }
        </CurrentRouteContext.Provider>
	);
};

export default CurrentRouteProvider;