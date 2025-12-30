export const getRawGlobalClassesCSS = () => {
	const styles = document.querySelectorAll( 'style[data-provider-key="global-classes"]' );
	return Array.from( styles )
		.map( ( style ) => style.textContent?.replace( '.elementor ', '' ) )
		.join( '\n' );
};
