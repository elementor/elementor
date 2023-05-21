var InnerTabsBehavior;

InnerTabsBehavior = Marionette.Behavior.extend( {

	onRenderCollection() {
		this.handleInnerTabs( this.view );
	},

	handleInnerTabs( parent ) {
		var closedClass = 'e-tab-close',
			activeClass = 'e-tab-active',
			tabsWrappers = parent.children.filter( function( view ) {
				return 'tabs' === view.model.get( 'type' );
			} );

			_.each( tabsWrappers, function( view ) {
				view.$el.find( '.elementor-control-content' ).remove();

				var tabsId = view.model.get( 'name' ),
				tabs = parent.children.filter( function( childView ) {
					return ( 'tab' === childView.model.get( 'type' ) && childView.model.get( 'tabs_wrapper' ) === tabsId );
				} );

				_.each( tabs, function( childView, index ) {
					view._addChildView( childView );

					var tabId = childView.model.get( 'name' ),
					controlsUnderTab = parent.children.filter( function( controlView ) {
						return ( tabId === controlView.model.get( 'inner_tab' ) );
					} );

					if ( 0 === index ) {
						childView.$el.addClass( activeClass );
					} else {
						_.each( controlsUnderTab, function( controlView ) {
							controlView.$el.addClass( closedClass );
						} );
					}
				} );
			} );
	},

	onChildviewControlTabClicked( childView ) {
		var closedClass = 'e-tab-close',
			activeClass = 'e-tab-active',
			tabClicked = childView.model.get( 'name' ),
			childrenUnderTab = this.view.children.filter( function( view ) {
				return ( 'tab' !== view.model.get( 'type' ) && childView.model.get( 'tabs_wrapper' ) === view.model.get( 'tabs_wrapper' ) );
			} ),
			siblingTabs = this.view.children.filter( function( view ) {
				return ( 'tab' === view.model.get( 'type' ) && childView.model.get( 'tabs_wrapper' ) === view.model.get( 'tabs_wrapper' ) );
			} );

			_.each( siblingTabs, function( view ) {
				view.$el.removeClass( activeClass );
			} );

			childView.$el.addClass( activeClass );

			_.each( childrenUnderTab, function( view ) {
				if ( view.model.get( 'inner_tab' ) === tabClicked ) {
					view.$el.removeClass( closedClass );
				} else {
					view.$el.addClass( closedClass );
				}
			} );

			elementor.getPanelView().updateScrollbar();
	},
} );

module.exports = InnerTabsBehavior;
