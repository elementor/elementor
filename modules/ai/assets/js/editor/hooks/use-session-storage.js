import { useState } from 'react';

const useSessionStorage = ( storageKey, initialValue = null ) => {
	const getSessionStorageData = () => JSON.parse( sessionStorage.getItem( storageKey ) ) || initialValue;

	const setSessionStorageData = ( value ) => sessionStorage.setItem( storageKey, JSON.stringify( value ) );

	const [ data, setData ] = useState( getSessionStorageData() );

	const setStateAndSessionData = ( value ) => {
		setSessionStorageData( value );
		setData( value );
	};

	return {
		data,
		setStateAndSessionData,
	};
};

export default useSessionStorage;
