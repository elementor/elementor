export function isEmpty( value: string | null = '' ) {
	if ( ! value ) {
		return true;
	}

	const pseudoElement = document.createElement( 'div' );

	pseudoElement.innerHTML = value;

	return ! pseudoElement.textContent?.length;
}
