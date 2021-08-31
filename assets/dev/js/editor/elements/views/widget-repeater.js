module.exports = class WidgetRepeater extends require( 'elementor-elements/views/base' ) {
	initialize() {
		this.config = elementor.widgetsCache[ this.options.model.attributes.widgetType ];

		super.initialize();
	}

	className() {
		const baseClasses = super.className();

		return baseClasses + ' elementor-widget ' + elementor.getElementData( this.getEditModel() ).html_wrapper_class;
	}

	events() {
		const events = super.events();

		events.click = () => $e.run( 'panel/editor/open', {
			model: this.options.model,
			view: this,
		} );

		return events;
	}

	attachHtml( collectionView, childView, index ) {
		// Same as original but passes index to '_insertAfter'.
		if ( collectionView._isBuffering ) {
			// buffering happens on reset events and initial renders
			// in order to reduce the number of inserts into the
			// document, which are expensive.
			collectionView._bufferedChildren.splice( index, 0, childView );
		} else if ( ! collectionView._insertBefore( childView, index ) ) {
			// If we've already rendered the main collection, append
			// the new child into the correct order if we need to. Otherwise
			// append to the end.
			collectionView._insertAfter( childView, index );
		}
	}

	_insertAfter( childView, index ) {
		const $container = this.getChildViewContainer( this, childView, index );
		$container.append( childView.el );
	}

	getChildViewContainer( containerView, childView, index = -1 ) {
		if ( -1 === index ) {
			return super.getChildViewContainer( containerView, childView, index );
		}

		const repeaterItemId = containerView.model
			.get( 'settings' )
			.get( containerView.config.name )
			.at( index )
			.get( '_id' );

		if ( ! repeaterItemId ) {
			return super.getChildViewContainer( containerView, childView );
		}

		return containerView.$el.find( `.repeater-item-placeholder-${ repeaterItemId }` );
	}

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.edit = {
			/* translators: %s: Element Name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'edit',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};

			editTools.remove = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
				icon: 'close',
			};
		}

		return editTools;
	}

	getTemplate() {
		const editModel = this.getEditModel();

		return Marionette.TemplateCache.get( '#tmpl-elementor-' + editModel.get( 'widgetType' ) + '-content' );
	}

	getChildType() {
		return [ 'section' ];
	}

	getRepeaterSettingKey( settingKey, repeaterKey, repeaterItemIndex ) {
		return [ repeaterKey, repeaterItemIndex, settingKey ].join( '.' );
	}

	onRender() {
		super.onRender();

		const editModel = this.getEditModel(),
			skinType = editModel.getSetting( '_skin' ) || 'default';

		// To support handlers.
		this.$el
			.attr( 'data-widget_type', editModel.get( 'widgetType' ) + '.' + skinType )
			.removeClass( 'elementor-widget-empty' )
			.children( '.elementor-widget-empty-icon' )
			.remove();
	}
};
