import { useState } from 'react';
import { getUserInformation } from '../api';
import PropTypes from 'prop-types';

const useUserInfo = ( immediately = false ) => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ userInfo, setUserInfo ] = useState( {
		is_connected: false,
		is_get_started: false,
		connect_url: '',
		usage: {
			hasAiSubscription: false,
			quota: 0,
			usedQuota: 0,
		},
	} );

	const credits = userInfo.usage.quota - userInfo.usage.usedQuota;
	const usagePercentage = userInfo.usage.quota ? ( userInfo.usage.usedQuota / userInfo.usage.quota ) * 100 : 0;

	const fetchData = async () => {
		setIsLoading( true );

		const userInfoResult = await getUserInformation( immediately );

		setUserInfo( ( prevState ) => ( { ...prevState, ...userInfoResult } ) );

		setIsLoaded( true );

		setIsLoading( false );
	};

	if ( ! isLoaded && ! isLoading ) {
		fetchData();
	}

	return {
		isLoading,
		isLoaded,
		isConnected: userInfo.is_connected,
		isGetStarted: userInfo.is_get_started,
		connectUrl: userInfo.connect_url,
		builderUrl: userInfo.usage.builderUrl,
		hasSubscription: userInfo.usage.hasAiSubscription,
		credits: credits < 0 ? 0 : credits,
		usagePercentage: Math.round( usagePercentage ),
		fetchData,
	};
};

useUserInfo.propTypes = {
	immediately: PropTypes.bool,
};

export default useUserInfo;
