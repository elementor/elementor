export function generateId( prefix: string = '', existingIds: string[] = [] ) {
	let id: string;

	do {
		id = prefix + Math.random().toString( 16 ).slice( 2, 9 );
	} while ( existingIds.includes( id ) );

	return id;
}
