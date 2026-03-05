const TEMP_ID_PREFIX = 'temp-';
const TEMP_ID_REGEX = /^temp-[a-z0-9]+$/i;

export function generateTempInteractionId(): string {
	return `${ TEMP_ID_PREFIX }${ Math.random().toString( 36 ).substring( 2, 11 ) }`;
}

export function isTempId( id: string | undefined ): boolean {
	return !! id && TEMP_ID_REGEX.test( id );
}
