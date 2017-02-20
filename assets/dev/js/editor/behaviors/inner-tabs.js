var InnerTabsBehavior;

InnerTabsBehavior = Marionette.Behavior.extend( {

	onRenderCollection: function() {
		this.handleInnerTabs( this.view );
	},

	handleInnerTabs: function( parent ) {
		var closedClass = 'elementor-tab-close',
			activeClass = 'elementor-tab-active',
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
					controlsUnderTab = parent.children.filter( function( view ) {
						return ( tabId === view.model.get( 'inner_tab' ) );
					} );

					if ( 0 === index ) {
						childView.$el.addClass( activeClass );
					} else {
						_.each( controlsUnderTab, function( view ) {
							view.$el.addClass( closedClass );
						} );
					}
				} );
			} );
	},

	onChildviewControlTabClicked: function( childView ) {
		var closedClass = 'elementor-tab-close',
			activeClass = 'elementor-tab-active',
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

			elementor.channels.data.trigger( 'scrollbar:update' );
	}
} );

module.exports = InnerTabsBehavior;
