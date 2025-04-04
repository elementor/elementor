export const SAVE_CONTEXTS = Object.freeze( {
	SAVE: 'save',
	MOVE: 'move',
	COPY: 'copy',
	BULK_MOVE: 'bulkMove',
	BULK_COPY: 'bulkCopy',
} );

export const QUOTA_WARNINGS = Object.freeze( {
	/* Translators: 1: Quota usage percentage */
	warning: __( 'You\'ve reached %1$d%% of your storage.', 'elementor' ),
	/* Translators: 1: Quota usage percentage */
	alert: __( 'You\'ve reached %1$d1%% of the space available in your plan. Upgrade to save more templates', 'elementor' ),
} );
