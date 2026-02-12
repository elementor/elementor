import { hashString } from '@elementor/utils/src/hash';

const testCases = [ 'hello', 'world', 'instance-123_elem-1', 'instance-456_elem-2', 'a', 'elem-1', '' ];

console.log( 'TypeScript hashString results:' );
console.log( '===============================\n' );

testCases.forEach( ( input ) => {
	const display = input === '' ? '(empty)' : input;
	console.log( `Input: '${ display }'` );
	console.log( `  Full:    ${ hashString( input ) }` );
	console.log( `  7 chars: ${ hashString( input, 7 ) }` );
	console.log( '' );
} );
