export default class extends Marionette.Behavior {
	events() {
		return {
			resizestart: 'onResizeStart',
			resizestop: 'onResizeStop',
			resize: 'onResize',
			dragstart: 'onDragStart',
			dragstop: 'onDragStop',
		};
	}

	initialize() {
		super.initialize();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.toggle );

		const view = this.view,
			viewSettingsChangedMethod = view.onSettingsChanged;

		view.onSettingsChanged = () => {
			viewSettingsChangedMethod.apply( view, arguments );

			this.onSettingsChanged.apply( this, arguments );
		};
	}

	activate() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		this.deactivate();

		this.$el.append( '<div class="elementor-handle"><i class="fa fa-arrows"></i></div>' );

		this.$el.draggable( {
			addClasses: false,
			handle: '.elementor-handle',
		} );

		this.$el.resizable( {
			handles: 'e, w',
		} );
	}

	deactivate() {
		if ( ! this.$el.draggable( 'instance' ) ) {
			return;
		}

		this.$el.draggable( 'destroy' );
		this.$el.resizable( 'destroy' );

		this.$el.find( '> .elementor-handle' ).remove();
	}

	toggle() {
		const activeMode = elementor.channels.dataEditMode.request( 'activeMode' ),
			isAbsolute = this.view.getEditModel().getSetting( '_is_absolute' );

		if ( 'edit' === activeMode && isAbsolute ) {
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

	onDragStart( event ) {
		event.stopPropagation();

		this.view.model.trigger( 'request:edit' );
	}

	onDragStop( event, ui ) {
		event.stopPropagation();
		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			settingToChange = {};

		settingToChange[ '_offset_x' + deviceSuffix ] = { unit: 'px', size: ui.position.left };
		settingToChange[ '_offset_y' + deviceSuffix ] = { unit: 'px', size: ui.position.top };

		this.view.getEditModel().get( 'settings' ).setExternalChange( settingToChange );

		this.$el.css( {
			top: '',
			left: '',
			right: '',
			bottom: '',
			width: '',
			height: '',
		} );
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

		if ( undefined !== changed._is_absolute ) {
			this.toggle();
		}
	}
}
