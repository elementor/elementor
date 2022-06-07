var BaseRegion = require( 'elementor-regions/base' );
const PanelLayoutView = require( './layout' );

module.exports = BaseRegion.extend( {
	el: '#elementor-inspector',

	getStorageKey: function() {
		return 'inspector';
	},

	constructor: function() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-regions/inspector/layout' );

		this.show( new PanelLayoutView() );
	},

	getDockingSide: function() {
		return elementorCommon.config.isRTL ? 'left' : 'right';
	},

	isPushingContent() {
		return true;
	},

	getVisibleModes() {
		return [
			'settings',
			'edit',
			'picker',
		];
	},

	open() {
		BaseRegion.prototype.open.apply( this, arguments );

		elementor.getPanelView()._parent.close();
	},
} );
