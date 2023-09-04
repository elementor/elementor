export const HISTORY_TYPES = Object.freeze( {
	ALL: 'all',
	TEXT: 'text',
	CODE: 'code',
	IMAGE: 'images',
	BLOCK: 'blocks',
} );

export const TRANSLATED_HISTORY_TYPES_FALLBACK = __( 'things', 'elementor' );
export const TRANSLATED_HISTORY_TYPES = Object.freeze( {
	[ HISTORY_TYPES.TEXT ]: __( 'texts', 'elementor' ),
	[ HISTORY_TYPES.CODE ]: __( 'code', 'elementor' ),
	[ HISTORY_TYPES.IMAGE ]: __( 'images', 'elementor' ),
	[ HISTORY_TYPES.BLOCK ]: __( 'blocks', 'elementor' ),
} );

export const HISTORY_ACTION_TYPES = Object.freeze( {
	REUSE: 'reuse',
	EDIT: 'edit',
} );
