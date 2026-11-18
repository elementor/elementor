export function getPostTitlePlain( renderedTitle: string ): string {
	if ( typeof document === 'undefined' ) {
		return renderedTitle;
	}

	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = renderedTitle;
	const { value } = textarea;
	textarea.remove();

	return value;
}

export function postTitleMatchesSearch( renderedTitle: string, searchQuery: string ): boolean {
	const query = searchQuery.trim().toLowerCase();

	if ( ! query ) {
		return true;
	}

	return getPostTitlePlain( renderedTitle ).toLowerCase().includes( query );
}