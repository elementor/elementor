import { useState, useEffect } from 'react';
import { getUserInformation } from '../api';

const useUserInfo = () => {
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
	const usagePercentage = ( userInfo.usage.usedQuota / userInfo.usage.quota ) * 100;

	const fetchData = async () => {
		setIsLoading( true );

		const userInfoResult = await getUserInformation();

		setUserInfo( ( prevState ) => ( { ...prevState, ...userInfoResult } ) );

		setIsLoading( false );
	};

	useEffect( () => {
		fetchData();
	}, [] );

	return {
		isLoading,
		isConnected: userInfo.is_connected,
		isGetStarted: userInfo.is_get_started,
		connectUrl: userInfo.connect_url,
		hasSubscription: userInfo.usage.hasAiSubscription,
		credits: credits < 0 ? 0 : credits,
		usagePercentage: Math.round( usagePercentage ),
		fetchData,
	};
};

export default useUserInfo;
