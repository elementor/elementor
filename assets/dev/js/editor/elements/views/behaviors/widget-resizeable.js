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
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		this.deactivate();

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
			isAbsolute = '' < editModel.getSetting( '_position' ),
			isInline = 'initial' === editModel.getSetting( '_element_width' );

		if ( isEditMode && ( isAbsolute || isInline ) ) {
			this.activate();
		} else {
			this.deactivate();
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
			settingToChange = {};

		settingToChange[ '_element_width' + deviceSuffix ] = 'initial';
		settingToChange[ '_element_custom_width' + deviceSuffix ] = { unit: 'px', size: ui.size.width };

		this.view.getEditModel().get( 'settings' ).setExternalChange( settingToChange );

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
