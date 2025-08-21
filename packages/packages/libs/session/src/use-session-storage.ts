import { useContext, useEffect, useState } from 'react';

import { getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem } from './session-storage';
import { Context } from './session-storage-context';

export const useSessionStorage = < T >( key: string ) => {
	const prefix = useContext( Context )?.prefix ?? '';
	const prefixedKey = `${ prefix }/${ key }`;

	const [ value, setValue ] = useState< T | null >();

	useEffect( () => {
		return subscribeToSessionStorage< T | null >( prefixedKey, ( newValue ) => {
			setValue( newValue ?? null );
		} );
	}, [ prefixedKey ] );

	const saveValue = ( newValue: T ) => {
		setSessionStorageItem( prefixedKey, newValue );
	};

	const removeValue = () => {
		removeSessionStorageItem( prefixedKey );
	};

	return [ value, saveValue, removeValue ] as const;
};

const subscribeToSessionStorage = < T >( key: string, subscriber: ( value: T ) => void ) => {
	subscriber( getSessionStorageItem( key ) as T );

	const abortController = new AbortController();

	window.addEventListener(
		'storage',
		( e ) => {
			if ( e.key !== key || e.storageArea !== sessionStorage ) {
				return;
			}

			subscriber( getSessionStorageItem( key ) as T );
		},
		{ signal: abortController.signal }
	);

	return () => {
		abortController.abort();
	};
};
