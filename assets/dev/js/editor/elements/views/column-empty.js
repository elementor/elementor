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
						title: elementor.translate( 'paste' ),
						callback: this.paste.bind( this ),
						isEnabled: this.isPasteEnabled.bind( this ),
					},
				],
			},
		];
	},

	paste: function() {
		var self = this,
			elements = elementorCommon.storage.get( 'transfer' ).elements,
			index = 0;

		elements.forEach( function( item ) {
			self._parent.addChildElement( item, { at: index, clone: true } );

			index++;
		} );
	},

	isPasteEnabled: function() {
		var transferData = elementorCommon.storage.get( 'transfer' );

		if ( ! transferData ) {
			return false;
		}

		if ( 'section' === transferData.elementsType ) {
			return transferData.elements[ 0 ].isInner && ! this._parent.isInner();
		}

		return 'widget' === transferData.elementsType;
	},

	onClickAdd: function() {
		elementor.route.to( 'panel/elements' );
	},
} );
