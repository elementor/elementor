const BINDINGS_PROHIBITING_DUPLICATIONS = [ 'transform' ];

export function isDuplicationProhibited( bind: string ) {
	return BINDINGS_PROHIBITING_DUPLICATIONS.includes( bind );
}
