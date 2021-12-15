export default class ElementsHelper {
	createAuto( elType, widgetType = 'button' ) {
		let result = null;

		switch ( elType ) {
			case 'document':
				result = elementor.getPreviewContainer();
				break;

			case 'section':
				result = this.createSection( 1 );
				break;

			case 'container':
				result = this.createContainer();
				break;

			case 'column':
				result = this.createSection( 1, true );
				break;

			case 'widget':
				result = this.createSection( 1, true );
				result = this.createWidget( result, widgetType );
				break;

			case 'innerSection':
				result = this.createInnerSection(
					this.createSection( 1, true )
				);
				break;
		}

		return result;
	}

	/**
	 * @return {Container}
	 */
	createAutoButton( eContainer = null, settings = {} ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createWidgetButton( eContainer, settings );
	}

	multiCreateAutoButton( eContainers = null, settings = {} ) {
		if ( ! eContainers ) {
			eContainers = [];
			eContainers.push( this.createSection( 1, true ) );
			eContainers.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eContainers, settings );
	}

	createAutoColumn( eContainer = null, settings = {} ) {
		eContainer = eContainer ? this.createColumn( eContainer ) : this.createSection( 1, true );

		this.settings( eContainer, settings, {
			debounce: false,
		} );

		return eContainer;
	}

	createSection( columns = 1, returnFirstColumn = false, options = {} ) {
		const eSection = $e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns,
			options,
		} );

		if ( returnFirstColumn ) {
			return eSection.children[ 0 ];
		}

		return eSection;
	}

	createContainer( options = {} ) {
		return $e.run( 'document/elements/create', {
			model: {
				elType: 'container',
			},
			container: elementor.getPreviewContainer(),
			options,
		} );
	}

	createSectionStructure( columns = 1, structure, returnFirstColumn = false, options = {} ) {
		const eSection = $e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns,
			structure,
			options,
		} );

		if ( returnFirstColumn ) {
			return eSection.children[ 0 ];
		}

		return eSection;
	}

	createColumn( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'column',
			},
		} );
	}

	multiCreateColumn( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'column',
			},
		} );
	}

	createInnerSection( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'section',
				isInner: true,
			},
		} );
	}

	multiCreateInnerSection( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'section',
				isInner: true,
			},
		} );
	}

	resizeColumn( eContainer, width ) {
		$e.run( 'document/elements/settings', {
			container: eContainer,
			settings: {
				_inline_size: width,
			},
			options: {
				debounce: false,
			},
		} );
	}

	createWidget( eContainer, widgetType, settings = {}, options = {} ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType,
				settings,
			},
			options,
		} );
	}

	createWidgetMulti( eContainers, widgetType, settings = {}, options = {} ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'widget',
				widgetType,
				settings,
			},
			options,
		} );
	}

	createWidgetButton( eContainer, settings = {} ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings,
			},
		} );
	}

	multiCreateButton( eContainers, settings = {} ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'widget',
				widgetType: 'button',
			},
			settings,
		} );
	}

	createWidgetTabs( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
		} );
	}

	copy( eContainer ) {
		$e.run( 'document/elements/copy', {
			container: eContainer,
		} );
	}

	multiCopy( eContainers ) {
		$e.run( 'document/elements/copy', {
			containers: eContainers,
		} );
	}

	copyAll() {
		$e.run( 'document/elements/copy-all' );
	}

	paste( eContainer, rebuild = false ) {
		return $e.run( 'document/elements/paste', {
			container: eContainer,
			rebuild,
		} );
	}

	multiPaste( eContainers ) {
		return $e.run( 'document/elements/paste', {
			containers: eContainers,
		} );
	}

	pasteStyle( eContainer ) {
		$e.run( 'document/elements/paste-style', {
			container: eContainer,
		} );
	}

	multiPasteStyle( eContainers ) {
		$e.run( 'document/elements/paste-style', {
			containers: eContainers,
		} );
	}

	resetSettings( eContainer, settings = null ) {
		$e.run( 'document/elements/reset-settings', {
			container: eContainer,
			settings,
		} );
	}

	resetStyle( eContainer ) {
		$e.run( 'document/elements/reset-style', {
			container: eContainer,
		} );
	}

	multiResetStyle( eContainers ) {
		$e.run( 'document/elements/reset-style', {
			containers: eContainers,
		} );
	}

	multiResetSettings( eContainers, settings = null ) {
		$e.run( 'document/elements/reset-settings', {
			containers: eContainers,
			settings,
		} );
	}

	duplicate( eContainer ) {
		return $e.run( 'document/elements/duplicate', {
			container: eContainer,
		} );
	}

	multiDuplicate( eContainers ) {
		return $e.run( 'document/elements/duplicate', {
			containers: eContainers,
		} );
	}

	settings( eContainer, settings, options = {} ) {
		$e.run( 'document/elements/settings', {
			container: eContainer,
			settings,
			options,
		} );
	}

	multiSettings( eContainers, settings ) {
		$e.run( 'document/elements/settings', {
			containers: eContainers,
			settings,
		} );
	}

	move( eContainer, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			container: eContainer,
			target: eTarget,
			options,
		} );
	}

	multiMove( eContainers, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			containers: eContainers,
			target: eTarget,
			options,
		} );
	}

	delete( eContainer ) {
		$e.run( 'document/elements/delete', {
			container: eContainer,
		} );
	}

	multiDelete( eContainers ) {
		$e.run( 'document/elements/delete', {
			containers: eContainers,
		} );
	}

	empty() {
		$e.run( 'document/elements/empty', { force: true } );
	}

	import( data, model, options = {} ) {
		return $e.run( 'document/elements/import', { data, model, options } );
	}
}
