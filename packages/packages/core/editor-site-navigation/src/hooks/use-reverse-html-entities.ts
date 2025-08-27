import { useMemo } from 'react';

export function useReverseHtmlEntities( escapedHTML = '' ) {
	return useMemo( () => {
		const textarea = document.createElement( 'textarea' );
		textarea.innerHTML = escapedHTML;

		const { value } = textarea;

		textarea.remove();

		return value;
	}, [ escapedHTML ] );
}
