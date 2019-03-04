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

		const view = this.view,
			viewSettingsChangedMethod = view.onSettingsChanged;

		view.onSettingsChanged = ( ...args ) => {
			viewSettingsChangedMethod.call( view, ...args );

			this.onSettingsChanged.call( this, ...args );
		};
	}

	activate() {
		this.$el.resizable( {
			handles: 'e, w',
		} );
	}

	deactivate() {
		if ( ! this.$el.resizable( 'instance' ) ) {
			return;
		}

		this.$el.resizable( 'destroy' );
	}

	toggle() {
		const editModel = this.view.getEditModel(),
			isEditMode = 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
			isAbsolute = editModel.getSetting( '_position' ),
			isInline = 'initial' === editModel.getSetting( '_element_width' );

		this.deactivate();

		if ( isEditMode && ( isAbsolute || isInline ) && elementor.userCan( 'design' ) ) {
			this.activate();
		}
	}

	onRender() {
		_.defer( () => this.toggle() );
	}

	onDestroy() {
		this.deactivate();
	}

	onResizeStart( event ) {
		event.stopPropagation();

		this.view.model.trigger( 'request:edit' );
	}

	onResizeStop( event, ui ) {
		event.stopPropagation();

		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			editModel = this.view.getEditModel(),
			unit = editModel.getSetting( '_element_custom_width' + deviceSuffix ).unit,
			width = elementor.helpers.elementSizeToUnit( this.$el, ui.size.width, unit ),
			settingToChange = {};

		settingToChange[ '_element_width' + deviceSuffix ] = 'initial';
		settingToChange[ '_element_custom_width' + deviceSuffix ] = { unit: unit, size: width };

		editModel.get( 'settings' ).setExternalChange( settingToChange );

		this.$el.css( {
			width: '',
			height: '',
		} );
	}

	onResize( event ) {
		event.stopPropagation();
	}

	onSettingsChanged( changed ) {
		if ( changed.changed ) {
			changed = changed.changed;
		}

		if ( undefined !== changed._position || undefined !== changed._element_width ) {
			this.toggle();
		}
	}
}
