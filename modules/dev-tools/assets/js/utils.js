export const consoleWarn = ( ...args ) => {
	const style = `font-size: 12px; background-image: url("${ elementorDevToolsConfig.urls.assets }images/logo-icon.png"); background-repeat: no-repeat; background-size: contain;`;

	args.unshift( '%c  %c', style, '' );

	console.warn( ...args ); // eslint-disable-line no-console
};
