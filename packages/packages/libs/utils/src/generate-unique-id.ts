export function generateUniqueId( prefix: string = '' ): string {
	const prefixStr = prefix ? `${ prefix }-` : '';

	return `${ prefixStr }${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`;
}
