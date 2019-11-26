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
						isEnabled: this.isPasteEnabled.bind( this ),
						callback: () => $e.run( 'document/elements/paste', {
							container: this._parent.getContainer(),
						} ),
					},
				],
			},
		];
	},

	isPasteEnabled: function() {
		const storageData = elementorCommon.storage.get( 'clipboard' );

		if ( ! storageData ) {
			return false;
		}

		// If all of the models are section and is not inner.
		const isAllSectionsInner = () => false === this._parent._parent.isInner() && storageData.every( ( model ) => {
			if ( 'section' === model.elType && model.isInner ) {
				return true;
			}
		} );

		// If all the models are widget(s)
		const isAllElementsWidgets = () => storageData.every( ( model ) => {
			if ( 'widget' === model.elType ) {
				return true;
			}
		} );

		return isAllSectionsInner() || isAllElementsWidgets();
	},

	onClickAdd: function() {
		$e.route( 'panel/elements/categories' );
	},
} );
