import { userEventMeta } from '@elementor/events';

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-empty-preview',

	className: 'elementor-empty-view',

	events: {
		click: 'onClickAdd',
	},

	behaviors() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups(),
			},
		};
	},

	getContextMenuGroups() {
		return [
			{
				name: 'general',
				actions: [
					{
						name: 'paste',
						title: __( 'Paste', 'elementor' ),
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( this._parent.getContainer() ),
						callback: () => $e.run( 'document/ui/paste', {
							container: this._parent.getContainer(),
						}, userEventMeta( {
							source: 'empty-column',
							interaction: 'context-menu',
						} ) ),
					},
				],
			},
		];
	},

	onClickAdd() {
		$e.route( 'panel/elements/categories', {}, userEventMeta( {
			source: 'empty-column',
			interaction: 'click',
		} ) );
	},
} );
