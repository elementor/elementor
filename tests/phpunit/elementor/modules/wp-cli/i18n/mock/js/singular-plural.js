export default function() {
	const count = '1'; // not really effects anything.

	// Without domain.
	_n( '%d is one item', '%d is two items', count );

	// With domain.
	_n( '%d is one item', '%d is two items', count, 'domain' );

	// On same line.
	_n( '%d is one item', '%d is two items', count, 'domain' ); 	_n( '%d is one item', '%d is two items', count, 'domain' );
}

