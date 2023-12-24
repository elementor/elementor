var ControlBaseView;

ControlBaseView = Marionette.CompositeView.extend( {
	ui() {
		return {
			controlTitle: '.elementor-control-title',
		};
	},

	behaviors() {
		var behaviors = {};

		return elementor.hooks.applyFilters( 'controls/base/behaviors', behaviors, this );
	},

	getBehavior( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	className() {
		// TODO: Any better classes for that?
		var classes = 'elementor-control elementor-control-' + this.model.get( 'name' ) + ' elementor-control-type-' + this.model.get( 'type' ),
			modelClasses = this.model.get( 'classes' ),
			responsive = this.model.get( 'responsive' );

		if ( ! _.isEmpty( modelClasses ) ) {
			classes += ' ' + modelClasses;
		}

		if ( ! _.isEmpty( responsive ) ) {
			const responsiveControlName = responsive.max || responsive.min;

			classes += ' elementor-control-responsive-' + responsiveControlName;
		}

		return classes;
	},

	templateHelpers() {
		var controlData = {
			_cid: this.model.cid,
		};

		return {
			view: this,
			data: _.extend( {}, this.model.toJSON(), controlData ),
		};
	},

	getTemplate() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-control-' + this.model.get( 'type' ) + '-content' );
	},

	initialize( options ) {
		const label = this.model.get( 'label' );

		// TODO: Temp backwards compatibility. since 2.8.0.
		Object.defineProperty( this, 'container', {
			get() {
				if ( ! options.container ) {
					const settingsModel = options.elementSettingsModel,
						view = $e.components.get( 'document' ).utils.findViewById( settingsModel.id );

					// Element control.
					if ( view && view.getContainer ) {
						options.container = view.getContainer();
					} else {
						if ( ! settingsModel.id ) {
							settingsModel.id = 'bc-' + elementorCommon.helpers.getUniqueId();
						}

						// Document/General/Other control.
						options.container = new elementorModules.editor.Container( {
							type: 'bc-container',
							id: settingsModel.id,
							model: settingsModel,
							settings: settingsModel,
							label,
							view: false,
							parent: false,
							renderer: false,
							controls: settingsModel.options.controls,
						} );
					}
				}

				return options.container;
			},
		} );

		// Use `defineProperty` because `get elementSettingsModel()` fails during the `Marionette.CompositeView.extend`.
		Object.defineProperty( this, 'elementSettingsModel', {
			get() {
				elementorDevTools.deprecation.deprecated( 'elementSettingsModel', '2.8.0', 'container.settings' );

				return options.container ? options.container.settings : options.elementSettingsModel;
			},
		} );

		var controlType = this.model.get( 'type' ),
			controlSettings = jQuery.extend( true, {}, elementor.config.controls[ controlType ], this.model.attributes );

		this.model.set( controlSettings );

		// TODO: this.elementSettingsModel is deprecated since 2.8.0.
		const settings = this.container ? this.container.settings : this.elementSettingsModel;

		this.listenTo( settings, 'change', this.onAfterChange );

		if ( this.model.attributes.responsive ) {
			this.onDeviceModeChange = this.onDeviceModeChange.bind( this );

			elementor.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		}
	},

	onDestroy() {
		elementor.stopListening( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	onDeviceModeChange() {
		this.toggleControlVisibility();
	},

	onAfterChange() {
		this.toggleControlVisibility();
	},

	toggleControlVisibility() {
		// TODO: this.elementSettingsModel is deprecated since 2.8.0.
		const settings = this.container ? this.container.settings : this.elementSettingsModel;

		var isVisible = elementor.helpers.isActiveControl( this.model, settings.attributes, settings.controls );

		this.$el.toggleClass( 'elementor-hidden-control', ! isVisible );

		elementor.getPanelView().updateScrollbar();
	},

	onRender() {
		var layoutType = this.model.get( 'label_block' ) ? 'block' : 'inline',
			showLabel = this.model.get( 'show_label' ),
			elClasses = 'elementor-label-' + layoutType;

		elClasses += ' elementor-control-separator-' + this.model.get( 'separator' );

		if ( ! showLabel ) {
			elClasses += ' elementor-control-hidden-label';
		}

		this.$el.addClass( elClasses );

		this.toggleControlVisibility();
	},

	reRoute( controlActive ) {
		$e.route(
			$e.routes.getCurrent( 'panel' ),
			this.getControlInRouteArgs( controlActive ? this.getControlPath() : '' ),
			{ history: false },
		);
	},

	getControlInRouteArgs( path ) {
		return {
			...$e.routes.getCurrentArgs( 'panel' ),
			activeControl: path,
		};
	},

	getControlPath() {
		let controlPath = this.model.get( 'name' ),
			parent = this._parent;

		while ( ! parent.$el.hasClass( 'elementor-controls-stack' ) ) {
			const parentName = parent.model.get( 'name' ) || parent.model.get( '_id' );
			controlPath = parentName + '/' + controlPath;

			parent = parent._parent;
		}

		return controlPath;
	},
} );

module.exports = ControlBaseView;
