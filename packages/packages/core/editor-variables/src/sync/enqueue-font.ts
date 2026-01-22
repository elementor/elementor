export const enqueueFont = ( fontFamily: string, context: 'preview' | 'editor' = 'preview' ) => {
	return window.elementor?.helpers?.enqueueFont?.( fontFamily, context ) ?? null;
};
