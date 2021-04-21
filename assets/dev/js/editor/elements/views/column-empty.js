import DocumentHelper from 'elementor-document/helper';

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-empty-preview',

	className: 'elementor-empty-view',

	events: {
		click: 'onClickAdd',
	},

	behaviors: function() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups(),
			},
		};
	},

	getContextMenuGroups: function() {
		return [
			{
				name: 'general',
				actions: [
					{
						name: 'paste',
						title: __( 'Paste', 'elementor' ),
						isEnabled: () => DocumentHelper.isPasteEnabled( this._parent.getContainer() ),
						callback: () => $e.run( 'document/ui/paste', {
							container: this._parent.getContainer(),
						} ),
					},
				],
			},
		];
	},

	onClickAdd: function() {
		$e.route( 'panel/elements/categories' );
	},
} );
