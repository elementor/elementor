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

		// Save this instance for external use eg: ( hooks ).
		this.view.options.draggable = this;
	}

	activate() {
		this.$el.draggable( {
			addClasses: false,
		} );
	}

	deactivate() {
		if ( ! this.$el.draggable( 'instance' ) ) {
			return;
		}

		this.$el.draggable( 'destroy' );
	}

	toggle() {
		const isAbsolute = this.view.getEditModel().getSetting( '_position' );

		this.deactivate();

		if ( isAbsolute && this.view.getContainer().isDesignable() ) {
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
			settingToChange = {},
			isRTL = elementorFrontend.config.is_rtl;

		const parentWidth = this.$el.offsetParent().width(),
			elementWidth = this.$el.outerWidth( true ),
			left = ui.position.left,
			right = parentWidth - left - elementWidth;

		let	xPos = isRTL ? right : left,
			yPos = ui.position.top,
			offsetX = '_offset_x',
			offsetY = '_offset_y';

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

		settingToChange[ offsetX + deviceSuffix ] = { size: xPos, unit: offsetXUnit };
		settingToChange[ offsetY + deviceSuffix ] = { size: yPos, unit: offsetYUnit };

		$e.run( 'document/elements/settings', {
			container: this.view.container,
			settings: settingToChange,
			options: {
				external: true,
			},
		} );

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
}
