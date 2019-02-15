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
			isAbsolute = '' < this.view.getEditModel().getSetting( '_position' );

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

		const viewportWidth = elementorFrontend.getDefaultElements().$window.outerWidth( true ),
			viewportHeight = elementorFrontend.getDefaultElements().$window.outerHeight( true ),
			currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			editModel = this.view.getEditModel(),
			hOrientation = editModel.getSetting( '_offset_orientation_h' ),
			vOrientation = editModel.getSetting( '_offset_orientation_v' ),
			settingToChange = {};

		let xPos = ui.position.left,
			yPos = ui.position.top,
			offsetX = '_offset_x',
			offsetY = '_offset_y';

		const parentWidth = this.$el.offsetParent().width(),
			elementWidth = this.$el.outerWidth( true );

		if ( 'end' === hOrientation ) {
			xPos = parentWidth - xPos - elementWidth;
			offsetX = '_offset_x_end';
		}

		const offsetXSettings = editModel.getSetting( offsetX + deviceSuffix );

		switch ( offsetXSettings.unit ) {
			case '%':
				xPos = ( xPos / ( parentWidth / 100 ) ).toFixed( 3 );
				break;
			case 'vw':
				xPos = ( xPos / ( viewportWidth / 100 ) ).toFixed( 3 );
				break;
			case 'vh':
				xPos = ( xPos / ( viewportHeight / 100 ) ).toFixed( 3 );
				break;
		}

		const parentHeight = this.$el.offsetParent().height(),
			elementHeight = this.$el.outerHeight( true );

		if ( 'end' === vOrientation ) {
			yPos = parentHeight - yPos - elementHeight;
			offsetY = '_offset_y_end';
		}

		const offsetYSettings = editModel.getSetting( offsetY + deviceSuffix );

		switch ( offsetYSettings.unit ) {
			case '%':
				yPos = ( yPos / ( parentHeight / 100 ) ).toFixed( 3 );
				break;
			case 'vh':
				yPos = ( yPos / ( viewportHeight / 100 ) ).toFixed( 3 );
				break;
			case 'vw':
				yPos = ( yPos / ( viewportWidth / 100 ) ).toFixed( 3 );
				break;
		}

		settingToChange[ offsetX + deviceSuffix ] = { size: xPos, unit: offsetXSettings.unit };
		settingToChange[ offsetY + deviceSuffix ] = { size: yPos, unit: offsetYSettings.unit };

		this.view.getEditModel().get( 'settings' ).setExternalChange( settingToChange );

		setTimeout( () => {
			this.$el.css( {
				top: '',
				left: '',
				right: '',
				bottom: '',
				width: '',
				height: '',
			} );
		}, 250 );
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

		if ( undefined !== changed._position ) {
			this.toggle();
		}
	}
}
