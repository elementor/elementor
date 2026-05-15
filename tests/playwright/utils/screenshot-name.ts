export function getWpVersionedScreenshotName( name: string ): string {
	const suffix = process.env.WP_MAJOR_VERSION ? '-new' : '';
	return name.replace( /\.png$/, `${ suffix }.png` );
}
