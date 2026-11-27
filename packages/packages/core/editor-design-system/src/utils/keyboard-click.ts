import { type KeyboardEvent } from 'react';

export function onKeyboardClick( callback: () => void ) {
	return ( event: KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			callback();
		}
	};
}