export default class extends Marionette.Behavior {
	events() {
		return {
			dragstart: 'onDragStart',
			dragstop: 'onDragStop',
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
		this.$handle = jQuery( '<div class="elementor-handle"><i class="fa fa-arrows"></i></div>' );

		this.$el.append( this.$handle );

		this.$el.draggable( {
			addClasses: false,
		} );
	}

	deactivate() {
		if ( ! this.$el.draggable( 'instance' ) ) {
			return;
		}

		this.$el.draggable( 'destroy' );

		this.$handle.remove();
	}

	toggle() {
		const isEditMode = 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
			isAbsolute = this.view.getEditModel().getSetting( '_position' );

		this.deactivate();

		if ( isEditMode && isAbsolute && elementor.userCan( 'design' ) ) {
			this.activate();
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

		const offsetXUnit = editModel.getSetting( offsetX + deviceSuffix ).unit;

		xPos = elementor.helpers.elementSizeToUnit( this.$el, xPos, offsetXUnit );

		const parentHeight = this.$el.offsetParent().height(),
			elementHeight = this.$el.outerHeight( true );

		if ( 'end' === vOrientation ) {
			yPos = parentHeight - yPos - elementHeight;
			offsetY = '_offset_y_end';
		}

		const offsetYUnit = editModel.getSetting( offsetY + deviceSuffix ).unit;

		yPos = elementor.helpers.elementSizeToUnit( this.$el, yPos, offsetYUnit );

		settingToChange[ offsetX + deviceSuffix ] = { size: xPos.toFixed( 3 ), unit: offsetXUnit };
		settingToChange[ offsetY + deviceSuffix ] = { size: yPos.toFixed( 3 ), unit: offsetYUnit };

		editModel.get( 'settings' ).setExternalChange( settingToChange );

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

	onSettingsChanged( changed ) {
		if ( changed.changed ) {
			changed = changed.changed;
		}

		if ( undefined !== changed._position ) {
			this.toggle();
		}
	}
}
