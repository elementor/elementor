var DraggableBehavior;

DraggableBehavior = Marionette.Behavior.extend( {

	events: {
		resizestart: 'onResizeStart',
		resizestop: 'onResizeStop',
		resize: 'onResize',
		dragstart: 'onDragStart',
		dragstop: 'onDragStop',
	},

	initialize: function() {
		Marionette.Behavior.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.toggle );

		const self = this,
			view = this.view,
			viewSettingsChangedMethod = view.onSettingsChanged;

		view.onSettingsChanged = function() {
			viewSettingsChangedMethod.apply( view, arguments );

			self.onSettingsChanged.apply( self, arguments );
		};
	},

	activate: function() {
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
	},

	deactivate: function() {
		if ( ! this.$el.draggable( 'instance' ) ) {
			return;
		}

		this.$el.draggable( 'destroy' );
		this.$el.resizable( 'destroy' );

		this.$el.find( '> .elementor-handle' ).remove();
	},

	toggle: function() {
		const activeMode = elementor.channels.dataEditMode.request( 'activeMode' ),
			isAbsolute = this.view.getEditModel().getSetting( '_is_absolute' );

		if ( 'edit' === activeMode && isAbsolute ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onRender: function() {
		_.defer( () => this.toggle() );
	},

	onDestroy: function() {
		this.deactivate();
	},

	onDragStart: function( event ) {
		event.stopPropagation();

		this.view.model.trigger( 'request:edit' );
	},

	onDragStop: function( event, ui ) {
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
	},

	onResizeStart: function( event ) {
		event.stopPropagation();

		this.view.model.trigger( 'request:edit' );
	},

	onResizeStop: function( event, ui ) {
		event.stopPropagation();
		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			settingToChange = {};

		settingToChange[ 'widget_width_custom' + deviceSuffix ] = { unit: 'px', size: ui.size.width };

		this.view.getEditModel().get( 'settings' ).setExternalChange( settingToChange );

		this.$el.css( {
			width: '',
			height: '',
		} );
	},

	onResize: function( event ) {
		event.stopPropagation();
	},

	onSettingsChanged: function( changed ) {
		if ( changed.changed ) {
			changed = changed.changed;
		}

		if ( undefined !== changed._is_absolute ) {
			this.toggle();
		}
	},
} );

module.exports = DraggableBehavior;
