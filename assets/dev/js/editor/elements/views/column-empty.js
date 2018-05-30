var ElementEmptyView,
	ContextMenu = require( 'elementor-editor-utils/context-menu' );

ElementEmptyView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-empty-preview',

	className: 'elementor-empty-view',

	events: {
		'click': 'onClickAdd'
	},

	behaviors: function() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups()
			}
		};
	},

	getContextMenuGroups: function() {
		var self = this;

		return [
			{
				name: 'general',
				actions: [
					{
						name: 'paste',
						title: elementor.translate( 'paste' ),
						callback: self.paste.bind( self ),
						isEnabled: function() {
							var transportData = elementor.getStorage( 'transport' );

							if ( ! transportData ) {
								return false;
							}

							var model = transportData.model;

							if ( 'section' === model.elType ) {
								return model.isInner && ! self._parent.isInner();
							}

							return 'widget' === model.elType;
						}
					}
				]
			}
		];
	},

	paste: function() {
		this._parent.addChildModel( elementor.getStorage( 'transport' ).model );
	},

	onClickAdd: function() {
		elementor.getPanelView().setPage( 'elements' );
	}
} );

module.exports = ElementEmptyView;
