var ResizableBehavior;

ResizableBehavior = Marionette.Behavior.extend( {
	defaults: {
		handles: elementorCommon.config.isRTL ? 'w' : 'e',
	},

	events: {
		resizestart: 'onResizeStart',
		resizestop: 'onResizeStop',
		resize: 'onResize',
	},

	initialize() {
		Marionette.Behavior.prototype.initialize.apply( this, arguments );

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	active() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}
		this.deactivate();

		var options = _.clone( this.options );

		delete options.behaviorClass;

		var $childViewContainer = this.getChildViewContainer(),
			defaultResizableOptions = {},
			resizableOptions = _.extend( defaultResizableOptions, options );

		$childViewContainer.resizable( resizableOptions );
	},

	deactivate() {
		if ( this.getChildViewContainer().resizable( 'instance' ) ) {
			this.getChildViewContainer().resizable( 'destroy' );
		}
	},

	onEditModeSwitched( activeMode ) {
		if ( 'edit' === activeMode ) {
			this.active();
		} else {
			this.deactivate();
		}
	},

	onRender() {
		var self = this;

		_.defer( function() {
			self.onEditModeSwitched( elementor.channels.dataEditMode.request( 'activeMode' ) );
		} );
	},

	onDestroy() {
		this.deactivate();
	},

	onResizeStart( event ) {
		event.stopPropagation();

		this.view.$el.data( 'originalWidth', this.view.el.getBoundingClientRect().width );

		this.view.triggerMethod( 'request:resize:start', event );
	},

	onResizeStop( event ) {
		event.stopPropagation();

		this.view.triggerMethod( 'request:resize:stop' );
	},

	onResize( event, ui ) {
		event.stopPropagation();

		this.view.triggerMethod( 'request:resize', ui, event );
	},

	getChildViewContainer() {
		return this.$el;
	},
} );

module.exports = ResizableBehavior;
