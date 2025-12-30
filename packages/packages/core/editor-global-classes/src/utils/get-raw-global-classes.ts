export const getRawGlobalClassesCSS = () => {
	const styles = window?.elementor
		?.getContainer?.( 'document' )
		?.document?.$element[ 0 ].ownerDocument.querySelectorAll( 'style[data-provider-key="global-classes"]' );
	return Array.from( styles ?? [] )
		.map( ( style ) => style.textContent?.replace( '.elementor ', '' ) )
		.join( '\n' );
};
