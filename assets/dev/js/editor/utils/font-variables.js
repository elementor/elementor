export class FontVariables {
	constructor() {
		this.init();
	}

	init() {
		$e.routes.on( 'run:after', ( component, route, args ) => {
			if ( 'panel/editor' !== component.getNamespace() ) {
				return;
			}

			this.onTypographyControlOpen( args );
		} );

		$e.commands.on( 'run:after', ( _component, command, args ) => {
			if ( 'document/elements/settings' !== command ) {
				return;
			}

			this.onControlChanged( args );
		} );
	}

	onTypographyControlOpen( args ) {
		if ( ! args?.activeControl ) {
			return;
		}

		const currentPageView = elementor.getPanelView().getCurrentPageView();

		const mainTypographyControl = currentPageView.collection.find( ( model ) => args.activeControl === model.get( 'name' ) && 'typography' === model.get( 'groupType' ) );

		if ( ! mainTypographyControl ) {
			return;
		}

		const currentGroupPrefix = mainTypographyControl.get( 'groupPrefix' );

		const allTypographyControls = currentPageView.collection.filter(
			( model ) => currentGroupPrefix === model.get( 'groupPrefix' ),
		);

		const fontControlModel = allTypographyControls.find(
			( model ) => currentGroupPrefix === model.get( 'groupPrefix' ) && 'font' === model.get( 'type' ),
		);

		const settingName = fontControlModel.get( 'name' );
		const controlValue = elementor.getCurrentElement().model.get( 'settings' ).get( settingName );

		if ( ! controlValue ) {
			return;
		}

		const fontOptions = this.getFontOptions( controlValue );

		if ( ! fontOptions ) {
			return;
		}

		for ( const [ fieldKey, fieldData ] of Object.entries( fontOptions ) ) {
			const controlKey = fontControlModel.get( 'groupPrefix' ) + fieldKey;
			const controlData = allTypographyControls.find( ( model ) => controlKey === model.get( 'name' ) );

			if ( ! controlData ) {
				continue;
			}

			this.applyFontVariableRange( [], controlKey, fieldData );
		}
	}

	getCurrentControlData( args ) {
		if ( ! args?.container?.controls ) {
			return null;
		}

		const currentSettingKey = this.getCurrentSettingKey( args );

		return args.container.controls[ currentSettingKey ];
	}

	getCurrentSettingKey( args ) {
		const currentSettingsKeys = Object.keys( args.settings );

		return currentSettingsKeys[ 0 ];
	}

	getControlValue( args ) {
		const currentSettingKey = this.getCurrentSettingKey( args );

		return args.settings[ currentSettingKey ];
	}

	applyFontVariableRange( controls, controlKey, fieldData ) {
		const controlView = $e.components.get( 'panel' ).getControlViewByPath(
			elementor.getPanelView().getCurrentPageView(),
			controlKey,
		);

		const range = controlView.model.get( 'range' );

		range.px.min = fieldData.min;
		range.px.max = fieldData.max;

		controlView.model.set( 'range', range );

		controlView.render();

		const inheritors = controlView.model.get( 'inheritors' );

		if ( ! inheritors ) {
			return;
		}

		inheritors.forEach( ( inheritorControlKey ) => {
			this.applyFontVariableRange( controls, inheritorControlKey, fieldData );
		} );
	}

	onControlChanged( args ) {
		const controlData = this.getCurrentControlData( args );

		if ( 'font' !== controlData?.type ) {
			return;
		}

		const { controls } = args.container;
		const fontOptions = this.getFontOptions( this.getControlValue( args ) );

		if ( ! fontOptions ) {
			return;
		}

		for ( const [ fieldKey, fieldData ] of Object.entries( fontOptions ) ) {
			const controlKey = controlData.groupPrefix + fieldKey;

			if ( ! controls[ controlKey ] ) {
				continue;
			}

			this.applyFontVariableRange( controls, controlKey, fieldData );
		}
	}

	getFontOptions( fontFamily ) {
		if ( ! elementor.config?.fontVariableRanges ) {
			return null;
		}

		return elementor.config.fontVariableRanges[ fontFamily ];
	}
}
