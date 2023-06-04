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
	 * @return {Object} options object
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
		this.deactivate();

		if ( this.view.container.isDesignable() && ! this.view.container.isGridContainer() ) {
			this.activate();
		}
	}

	/**
	 * Determine if the current element is a Container element.
	 *
	 * @return {boolean} is a container
	 */
	isContainer() {
		return ( 'container' === this.view.model.get( 'elType' ) );
	}

	/**
	 * Determine if the current element is a flex container item.
	 *
	 * @return {boolean} is a container item
	 */
	isContainerItem() {
		return 'container' === this.view.getContainer().parent?.model?.get( 'elType' );
	}

	/**
	 * Determine if the Container element is active.
	 *
	 * @return {boolean} is container active
	 */
	isContainerActive() {
		return !! elementorCommon.config.experimentalFeatures.container;
	}

	/**
	 * Get the width control ID to change when resizing.
	 *
	 * @return {string} width key
	 */
	getWidthKey() {
		return this.isContainer() ? 'width' : '_element_custom_width';
	}

	/**
	 * Get a device-suffixed setting.
	 *
	 * @param {string} setting - Setting name.
	 *
	 * @return {string} device setting
	 */
	getDeviceSetting( setting ) {
		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = ( 'desktop' === currentDeviceMode ) ? '' : '_' + currentDeviceMode;

		return setting + deviceSuffix;
	}

	/**
	 * Get a setting value from the current edited model.
	 *
	 * @param {string} setting - Setting name.
	 *
	 * @return {*} setting
	 */
	getSetting( setting ) {
		const editModel = this.view.getEditModel();

		return editModel.getSetting( setting );
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

		const elementWidthSettingKey = this.getDeviceSetting( '_element_width' ),
			widthSettingKey = this.getDeviceSetting( this.getWidthKey() );

		const { unit } = this.getSetting( widthSettingKey ),
			width = elementor.helpers.elementSizeToUnit( this.$el, ui.size.width, unit );

		const settingToChange = {
			...( this.isContainerActive() ? { _flex_size: 'none' } : {} ),
			...( this.isContainer() ? { content_width: 'full' } : {} ),
			[ elementWidthSettingKey ]: 'initial',
			[ widthSettingKey ]: {
				unit,
				size: width,
			},
		};

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
		} );
	}
}
