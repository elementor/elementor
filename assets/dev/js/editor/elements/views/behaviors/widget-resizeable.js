export default class extends Marionette.Behavior {
	events() {
		return {
			resizestart: 'onResizeStart',
			resizestop: 'onResizeStop',
			resize: 'onResize',
		};
	}

	initialize() {
		super.initialize();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.toggle );

		// Save this instance for external use eg: ( hooks ).
		this.view.options.resizeable = this;
	}

	/**
	 * Get the resizable options object.
	 *
	 * @return {Object}
	 */
	getOptions() {
		// jQuery UI handles are using Cardinal Directions (n, e, s, w, etc.).
		let handles = 'e, w';

		// If it's a container item, add resize handles only at the end of the element in order to prevent UI
		// glitches when resizing from start.
		if ( this.isContainerItem() ) {
			handles = elementorCommon.config.isRTL ? 'w' : 'e';
		}

		return {
			handles,
		};
	}

	activate() {
		this.$el.resizable( this.getOptions() );
	}

	deactivate() {
		if ( ! this.$el.resizable( 'instance' ) ) {
			return;
		}

		this.$el.resizable( 'destroy' );
	}

	toggle() {
		const editModel = this.view.getEditModel(),
			isAbsolute = editModel.getSetting( '_position' ),
			isInline = 'initial' === editModel.getSetting( '_element_width' );

		this.deactivate();

		if ( ( ( isAbsolute || isInline ) && this.view.container.isDesignable() ) || this.isContainerItem() ) {
			this.activate();
		}
	}

	/**
	 * Determine if the current element is a flex container item.
	 *
	 * @returns {boolean}
	 */
	isContainerItem() {
		return 'container' === this.view.getContainer().parent?.model?.get( 'elType' );
	}

	onRender() {
		_.defer( () => this.toggle() );
	}

	onDestroy() {
		this.deactivate();
	}

	onResizeStart( event ) {
		event.stopPropagation();

		if ( this.view.onResizeStart ) {
			this.view.onResizeStart( event );
		}

		// Don't open edit mode when the item is a Container item ( for UX ).
		if ( ! this.isContainerItem() ) {
			this.view.model.trigger( 'request:edit' );
		}
	}

	onResizeStop( event, ui ) {
		event.stopPropagation();

		if ( this.view.onResizeStop ) {
			this.view.onResizeStop( event, ui );
		}

		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			editModel = this.view.getEditModel(),
			isContainer = ( 'container' === this.view.model.get( 'elType' ) ),
			widthKey = isContainer ? 'width' : '_element_custom_width',
			unit = editModel.getSetting( widthKey + deviceSuffix ).unit,
			width = elementor.helpers.elementSizeToUnit( this.$el, ui.size.width, unit ),
			settingToChange = {};

		// TODO: For BC controls.
		if ( elementorCommon.config.experimentalFeatures.container ) {
			settingToChange._flex_size = 'none';

			if ( isContainer ) {
				settingToChange.content_width = 'full';
			}
		} else {
			settingToChange[ '_element_width' + deviceSuffix ] = 'initial';
		}

		settingToChange[ widthKey + deviceSuffix ] = { unit, size: width };

		$e.run( 'document/elements/settings', {
			container: this.view.container,
			settings: settingToChange,
			options: {
				external: true,
			},
		} );

		// Defer to wait for the widget to re-render and prevent UI glitches.
		setTimeout( () => {
			this.$el.css( {
				width: '',
				height: '',
				left: '',
				'flex-shrink': '',
				'flex-grow': '',
				'flex-basis': '',
			} );
		} );
	}

	onResize( event, ui ) {
		event.stopPropagation();

		if ( this.view.onResize ) {
			this.view.onResize( event, ui );
		}

		if ( ! this.isContainerItem() ) {
			return;
		}

		// Set grow & shrink to 0 in order to set a specific size and prevent UI glitches.
		this.$el.css( {
			left: '',
			right: '',
			'flex-shrink': 0,
			'flex-grow': 0,
			'flex-basis': ui.size.width + 'px',
		} );
	}
}
