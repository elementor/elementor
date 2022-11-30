import { useState } from 'react';

export default function useLicense() {
	const [ isLocked, setIsLocked ] = useState( { locked: null } );

	elementorAppServices.licenseService.isValid().then( ( isValid ) => {
		setIsLocked( { locked: ! isValid } );
	} );

	return { isLocked };
}
