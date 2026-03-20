export async function getScreenshotName( name: string ): Promise<string> {
	if ( resolveWpMajorVersion() >= 7 ) {
		return name.replace( /\.png$/, '-with-wordpress7.png' );
	}
	return name;
}

function resolveWpMajorVersion(): number {
	const raw = process.env.WP_MAJOR_VERSION;
	return raw ? parseInt( raw, 10 ) : 0;
}
