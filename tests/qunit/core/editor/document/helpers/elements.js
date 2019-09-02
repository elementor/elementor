// TODO: Refactor this class.
export default class {
	static createSection( columns = 1, returnFirstColumn = false ) {
		const eSection = $e.run( 'document/elements/createSection', {
			columns,
			returnValue: true,
		} );

		if ( returnFirstColumn ) {
			return eSection.children._views[ Object.keys( eSection.children._views )[ 0 ] ];
		}

		return eSection;
	}

	static createColumn( eElement ) {
		return $e.run( 'document/elements/create', {
			element: eElement,
			model: {
				elType: 'column',
			},
			returnValue: true,
		} );
	}

	static multiCreateColumn( eElements ) {
		return $e.run( 'document/elements/create', {
			elements: eElements,
			model: {
				elType: 'column',
			},
			returnValue: true,
		} );
	}

	static createButton( eElement, settings = {} ) {
		return $e.run( 'document/elements/create', {
			element: eElement,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings,
			},
			returnValue: true,
		} );
	}

	static multiCreateButton( eElements, settings = {} ) {
		return $e.run( 'document/elements/create', {
			elements: eElements,
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings,
			},
			returnValue: true,
		} );
	}

	static createInnerSection( eElement ) {
		return $e.run( 'document/elements/create', {
			element: eElement,
			model: {
				elType: 'section',
				isInner: true,
			},
			returnValue: true,
		} );
	}

	static multiCreateInnerSection( eElements ) {
		return $e.run( 'document/elements/create', {
			elements: eElements,
			model: {
				elType: 'section',
				isInner: true,
			},
			returnValue: true,
		} );
	}

	static createTabs( eElement ) {
		return $e.run( 'document/elements/create', {
			element: eElement,
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			returnValue: true,
		} );

	}

	// TODO: rename function.
	static createMockButtonWidget( eElement = null ) {
		if ( ! eElement ) {
			eElement = this.createSection( 1, true );
		}

		return this.createButton( eElement );
	}

	// TODO: rename function.
	static multiCreateMockButtonWidget( eElements = null ) {
		if ( ! eElements ) {
			eElements = [];
			eElements.push( this.createSection( 1, true ) );
			eElements.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eElements );
	}

	// TODO: rename function.
	static createMockButtonStyled( eElement = null ) {
		if ( ! eElement ) {
			eElement = this.createSection( 1, true );
		}

		return this.createButton( eElement, {
			text: 'createMockButtonStyled',
			background_color: '#000000',
		} );
	}

	// TODO: rename function.
	static multiCreateMockButtonStyled( eElements = null ) {
		if ( ! eElements ) {
			eElements = [];
			eElements.push( this.createSection( 1, true ) );
			eElements.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eElements, {
			text: 'createMockButtonStyled',
			background_color: '#000000',
		} );
	}

	static copy( eElement ) {
		$e.run( 'document/elements/copy', {
			element: eElement,
		} );
	}

	static multiCopy( eElements ) {
		$e.run( 'document/elements/copy', {
			elements: eElements,
		} );
	}

	static copyAll() {
		$e.run( 'document/elements/copyAll' );
	}

	static paste( eElement, rebuild = false ) {
		return $e.run( 'document/elements/paste', {
			element: eElement,
			rebuild,
			returnValue: true,
		} );
	}

	static multiPaste( eElements ) {
		return $e.run( 'document/elements/paste', {
			elements: eElements,
			returnValue: true,
		} );
	}

	static pasteStyle( eElement ) {
		$e.run( 'document/elements/pasteStyle', {
			element: eElement,
		} );
	}

	static multiPasteStyle( eElements ) {
		$e.run( 'document/elements/pasteStyle', {
			elements: eElements,
		} );
	}


	static resetStyle( eElement ) {
		$e.run( 'document/elements/resetStyle', {
			element: eElement,
		} );
	}

	static multiResetStyle( eElements ) {
		$e.run( 'document/elements/resetStyle', {
			elements: eElements,
		} );
	}

	static duplicate( eElement ) {
		return $e.run( 'document/elements/duplicate', {
			element: eElement,
			returnValue: true,
		} );
	}

	static multiDuplicate( eElements ) {
		return $e.run( 'document/elements/duplicate', {
			elements: eElements,
			returnValue: true,
		} );
	}

	static settings( eElement, settings, options = {} ) {
		$e.run( 'document/elements/settings', {
			element: eElement,
			settings,
			options,
		} );
	}

	static multiSettings( eElements, settings ) {
		$e.run( 'document/elements/settings', {
			elements: eElements,
			settings,
		} );
	}

	static subSettings( eElement, key, settings ) {
		$e.run( 'document/elements/subSettings', {
			element: eElement,
			key,
			settings,
		} );
	}

	static move( eElement, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			element: eElement,
			target: eTarget,
			options,
		} );
	}

	static multiMove( eElements, eTarget, options = {} ) {
		$e.run( 'document/elements/move', {
			elements: eElements,
			target: eTarget,
			options,
		} );
	}

	static delete( eElement ) {
		$e.run( 'document/elements/delete', {
			element: eElement,
		} );
	}

	static multiDelete( eElements ) {
		$e.run( 'document/elements/delete', {
			elements: eElements,
		} );
	}

	static empty() {
		$e.run( 'document/elements/empty', { force: true } );
	}

	static repeaterInsert( eElement, name, item ) {
		return $e.run( 'document/elements/repeater/insert', {
			element: eElement,
			name,
			model: item,
			returnValue: true,
		} );
	}

	static multiRepeaterInsert( eElements, name, item ) {
		return $e.run( 'document/elements/repeater/insert', {
			elements: eElements,
			name,
			model: item,
			returnValue: true,
		} );
	}

	static repeaterRemove( eElement, name, index ) {
		return $e.run( 'document/elements/repeater/remove', {
			element: eElement,
			name,
			index,
			returnValue: true,
		} );
	}

	static multiRepeaterRemove( eElements, name, index ) {
		return $e.run( 'document/elements/repeater/remove', {
			elements: eElements,
			name,
			index,
			returnValue: true,
		} );
	}

	static repeaterSettings( eElement, name, index, settings ) {
		$e.run( 'document/elements/repeater/settings', {
			element: eElement,
			name,
			index,
			settings,
		} );
	}

	static multiRepeaterSettings( eElements, name, index, settings ) {
		$e.run( 'document/elements/repeater/settings', {
			elements: eElements,
			name,
			index,
			settings,
		} );
	}

	static repeaterDuplicate( eElement, name, index ) {
		return $e.run( 'document/elements/repeater/duplicate', {
			element: eElement,
			name,
			index,
			returnValue: true,
		} );
	}

	static multiRepeaterDuplicate( eElements, name, index ) {
		return $e.run( 'document/elements/repeater/duplicate', {
			elements: eElements,
			name,
			index,
			returnValue: true,
		} );
	}

	static repeaterMove( eElement, name, sourceIndex, targetIndex ) {
		$e.run( 'document/elements/repeater/move', {
			element: eElement,
			name,
			sourceIndex,
			targetIndex,
		} );
	}

	static multiRepeaterMove( eElements, name, sourceIndex, targetIndex ) {
		$e.run( 'document/elements/repeater/move', {
			elements: eElements,
			name,
			sourceIndex,
			targetIndex,
		} );
	}
}
