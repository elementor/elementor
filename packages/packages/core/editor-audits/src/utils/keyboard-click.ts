import type * as React from 'react';

export function onKeyboardClick( callback: () => void ) {
	return ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			callback();
		}
	};
}
