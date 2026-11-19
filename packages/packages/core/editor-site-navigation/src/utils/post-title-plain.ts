export function getPostTitlePlain( renderedTitle: string ): string {
	if ( typeof document === 'undefined' ) {
		return renderedTitle;
	}

	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = renderedTitle;

	return textarea.value;
}

export function postTitleMatchesSearch( renderedTitle: string, searchQuery: string ): boolean {
	const query = searchQuery.trim().toLowerCase();

	if ( ! query ) {
		return true;
	}

	return getPostTitlePlain( renderedTitle ).toLowerCase().includes( query );
}

export function postRowMatchesSearch(
	post: { id: number; title: { rendered: string } },
	searchQuery: string,
	activeDocument?: { id: number; title: string } | null
): boolean {
	const query = searchQuery.trim();

	if ( ! query ) {
		return true;
	}

	const title = activeDocument?.id === post.id ? activeDocument.title : post.title.rendered;

	return postTitleMatchesSearch( title, query );
}
