export const SAVE_CONTEXTS = Object.freeze( {
	SAVE: 'save',
	MOVE: 'move',
	COPY: 'copy',
	BULK_MOVE: 'bulkMove',
	BULK_COPY: 'bulkCopy',
} );

export const QUOTA_WARNINGS = Object.freeze( {
	/* Translators: 1: Quota usage percentage */
	warning: __( 'You\'ve saved %1$d%% of the templates in your plan. To get more space ', 'elementor' ) + '<a href="https://go.elementor.com/go-pro-cloud-templates-usage-bar-80" target="_blank">' + __( 'Upgrade now', 'elementor' ) + '</a>',
	/* Translators: 1: Quota usage percentage */
	alert: __( 'You\'ve saved %1$d%% of the templates in your plan. To get more space ', 'elementor' ) + '<a href="https://go.elementor.com/go-pro-cloud-templates-usage-bar-100" target="_blank">' + __( 'Upgrade now', 'elementor' ) + '</a>',
} );

export const QUOTA_BAR_STATES = Object.freeze( {
	NORMAL: 'normal',
	WARNING: 'warning',
	ALERT: 'alert',
} );
