// TODO: Refactor this class.
export default class DocumentHelper {
	static createSection( columns = 1, returnFirstColumn = false ) {
		const eSection = $e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns,
		} );

		if ( returnFirstColumn ) {
			return eSection.view.children._views[ Object.keys( eSection.view.children._views )[ 0 ] ].getContainer();
		}

		return eSection;
	}

	static createSectionStructure( columns = 1, structure, returnFirstColumn = false ) {
		const eSection = $e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns,
			structure,
		} );

		if ( returnFirstColumn ) {
			return eSection.view.children._views[ Object.keys( eSection.view.children._views )[ 0 ] ].getContainer();
		}

		return eSection;
	}

	static createColumn( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'column',
			},
		} );
	}

	static multiCreateColumn( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'column',
			},
		} );
	}

	static resizeColumn( eContainer, width ) {
		$e.run( 'document/elements/settings', {
			container: eContainer,
			settings: {
				_inline_size: width,
			},
		} );
	}

	static createButton( eContainer, settings = {} ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings,
			},
		} );
	}

	static multiCreateButton( eContainers, settings = {} ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings,
			},
		} );
	}

	static createInnerSection( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'section',
				isInner: true,
			},
		} );
	}

	static multiCreateInnerSection( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'section',
				isInner: true,
			},
		} );
	}

	static createTabs( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
		} );
	}

	static createForm( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'form',
			},
		} );
	}

	static createAutoForm( eContainer ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createForm( eContainer );
	}

	static createAutoButton( eContainer = null ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createButton( eContainer );
	}

	static multiCreateAutoButton( eContainers = null ) {
		if ( ! eContainers ) {
			eContainers = [];
			eContainers.push( this.createSection( 1, true ) );
			eContainers.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eContainers );
	}

	static createAutoButtonStyled( eContainer = null ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createButton( eContainer, {
			text: 'createAutoButtonStyled',
			background_color: '#000000',
		} );
	}

	static multiCreateAutoButtonStyled( eContainers = null ) {
		if ( ! eContainers ) {
			eContainers = [];
			eContainers.push( this.createSection( 1, true ) );
			eContainers.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eContainers, {
			text: 'createAutoButtonStyled',
			background_color: '#000000',
		} );
	}

	static copy( eContainer ) {
		$e.run( 'document/elements/copy', {
			container: eContainer,
		} );
	}

	static multiCopy( eContainers ) {
		$e.run( 'document/elements/copy', {
			containers: eContainers,
		} );
	}

	static copyAll() {
		$e.run( 'document/elements/copy-all' );
	}

	static paste( eContainer, rebuild = false ) {
		return $e.run( 'document/elements/paste', {
			container: eContainer,
			rebuild,
		} );
	}

	static multiPaste( eContainers ) {
		return $e.run( 'document/elements/paste', {
			containers: eContainers,
		} );
	}

	static pasteStyle( eContainer ) {
		$e.run( 'document/elements/paste-style', {
			container: eContainer,
		} );
	}

	static multiPasteStyle( eContainers ) {
		$e.run( 'document/elements/paste-style', {
			containers: eContainers,
		} );
	}

	static resetStyle( eContainer ) {
		$e.run( 'document/elements/reset-style', {
			container: eContainer,
		} );
	}

	static multiResetStyle( eContainers ) {
		$e.run( 'document/elements/reset-style', {
			containers: eContainers,
		} );
	}

	static duplicate( eContainer ) {
		return $e.run( 'document/elements/duplicate', {
			container: eContainer,
		} );
	}

	static multiDuplicate( eContainers ) {
		return $e.run( 'document/elements/duplicate', {
			containers: eContainers,
		} );
	}

	static settings( eContainer, settings, options = {} ) {
		$e.run( 'document/elements/settings', {
			container: eContainer,
			settings,
			options,
		} );
	}

	static multiSettings( eContainers, settings ) {
		$e.run( 'document/elements/settings', {
			containers: eContainers,
			settings,
		} );
	}

	static move( eContainer, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			container: eContainer,
			target: eTarget,
			options,
		} );
	}

	static multiMove( eContainers, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			containers: eContainers,
			target: eTarget,
			options,
		} );
	}

	static delete( eContainer ) {
		$e.run( 'document/elements/delete', {
			container: eContainer,
		} );
	}

	static multiDelete( eContainers ) {
		$e.run( 'document/elements/delete', {
			containers: eContainers,
		} );
	}

	static empty() {
		$e.run( 'document/elements/empty', { force: true } );
	}

	static import( data, model ) {
		$e.run( 'document/elements/import', { data, model } );
	}

	static repeaterInsert( eContainer, name, item ) {
		return $e.run( 'document/repeater/insert', {
			container: eContainer,
			name,
			model: item,
		} );
	}

	static multiRepeaterInsert( eContainers, name, item ) {
		return $e.run( 'document/repeater/insert', {
			containers: eContainers,
			name,
			model: item,
		} );
	}

	static repeaterRemove( eContainer, name, index ) {
		return $e.run( 'document/repeater/remove', {
			container: eContainer,
			name,
			index,
		} );
	}

	static multiRepeaterRemove( eContainers, name, index ) {
		return $e.run( 'document/repeater/remove', {
			containers: eContainers,
			name,
			index,
		} );
	}

	static repeaterSettings( eContainer, name, index, settings, options ) {
		const container = eContainer.children[ index ];

		$e.run( 'document/elements/settings', {
			container,
			settings,
			options,
		} );
	}

	static multiRepeaterSettings( eContainers, name, index, settings, options ) {
		eContainers = eContainers.map( ( eContainer ) => {
			return eContainer.children[ index ];
		} );

		$e.run( 'document/elements/settings', {
			containers: eContainers,
			settings,
			options,
		} );
	}

	static repeaterDuplicate( eContainer, name, index ) {
		return $e.run( 'document/repeater/duplicate', {
			container: eContainer,
			name,
			index,
		} );
	}

	static multiRepeaterDuplicate( eContainers, name, index ) {
		return $e.run( 'document/repeater/duplicate', {
			containers: eContainers,
			name,
			index,
		} );
	}

	static repeaterMove( eContainer, name, sourceIndex, targetIndex ) {
		$e.run( 'document/repeater/move', {
			container: eContainer,
			name,
			sourceIndex,
			targetIndex,
		} );
	}

	static multiRepeaterMove( eContainers, name, sourceIndex, targetIndex ) {
		$e.run( 'document/repeater/move', {
			containers: eContainers,
			name,
			sourceIndex,
			targetIndex,
		} );
	}

	// TODO: not the right place for the function.
	static testCommands( commands ) {
		// eslint-disable-next-line no-unused-vars
		Object.entries( commands ).forEach( ( [ command, reference ] ) => reference() );
	}
}
