module.exports = Marionette.ItemView.extend( {
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
						isEnabled: this.isPasteEnabled.bind( this )
					}
				]
			}
		];
	},

	paste: function() {
		var self = this,
			elements = elementor.getStorage( 'transfer' ).elements,
			index = 0;

		elements.forEach( function( item ) {
			self._parent.addChildElement( item, { at: index, clone: true } );

			index++;
		} );
	},

	isPasteEnabled: function() {
		var transferData = elementor.getStorage( 'transfer' );

		if ( ! transferData ) {
			return false;
		}

		if ( 'section' === transferData.elementsType ) {
			return transferData.elements[0].isInner && ! this._parent.isInner();
		}

		return 'widget' === transferData.elementsType;
	},

	onClickAdd: function() {
		elementor.getPanelView().setPage( 'elements' );
	}
} );
