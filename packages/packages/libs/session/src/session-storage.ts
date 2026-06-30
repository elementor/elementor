export const getSessionStorageItem = < T >( key: string ): T | undefined => {
	return JSON.parse( sessionStorage.getItem( key ) || '{}' )?.item;
};

export const setSessionStorageItem = ( key: string, item: unknown ) => {
	sessionStorage.setItem( key, JSON.stringify( { item } ) );

	// The browser doesn't dispatch the `storage` event for the current tab,
	// so we need to dispatch it manually.
	//
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
	window.dispatchEvent(
		new StorageEvent( 'storage', {
			key,
			storageArea: sessionStorage,
		} )
	);
};

export const removeSessionStorageItem = ( key: string ) => {
	sessionStorage.removeItem( key );

	// The browser doesn't dispatch the `storage` event for the current tab,
	// so we need to dispatch it manually.
	//
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
	window.dispatchEvent(
		new StorageEvent( 'storage', {
			key,
			storageArea: sessionStorage,
		} )
	);
};
