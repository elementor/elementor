// TODO: Refactor this class.
export default class {
	static createSection( columns = 1, returnFirstColumn = false ) {
		const eSection = $e.run( 'document/elements/create', {
			model: {
				elType: 'section',
			},
			container: elementor.getPreviewContainer(),
			columns,
			returnValue: true,
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
			returnValue: true,
		} );
	}

	static multiCreateColumn( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'column',
			},
			returnValue: true,
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
			returnValue: true,
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
			returnValue: true,
		} );
	}

	static createInnerSection( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'section',
				isInner: true,
			},
			returnValue: true,
		} );
	}

	static multiCreateInnerSection( eContainers ) {
		return $e.run( 'document/elements/create', {
			containers: eContainers,
			model: {
				elType: 'section',
				isInner: true,
			},
			returnValue: true,
		} );
	}

	static createTabs( eContainer ) {
		return $e.run( 'document/elements/create', {
			container: eContainer,
			model: {
				elType: 'widget',
				widgetType: 'tabs',
			},
			returnValue: true,
		} );

	}

	// TODO: rename function.
	static createMockButtonWidget( eContainer = null ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createButton( eContainer );
	}

	// TODO: rename function.
	static multiCreateMockButtonWidget( eContainers = null ) {
		if ( ! eContainers ) {
			eContainers = [];
			eContainers.push( this.createSection( 1, true ) );
			eContainers.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eContainers );
	}

	// TODO: rename function.
	static createMockButtonStyled( eContainer = null ) {
		if ( ! eContainer ) {
			eContainer = this.createSection( 1, true );
		}

		return this.createButton( eContainer, {
			text: 'createMockButtonStyled',
			background_color: '#000000',
		} );
	}

	// TODO: rename function.
	static multiCreateMockButtonStyled( eContainers = null ) {
		if ( ! eContainers ) {
			eContainers = [];
			eContainers.push( this.createSection( 1, true ) );
			eContainers.push( this.createSection( 1, true ) );
		}

		return this.multiCreateButton( eContainers, {
			text: 'createMockButtonStyled',
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
		$e.run( 'document/elements/copyAll' );
	}

	static paste( eContainer, rebuild = false ) {
		return $e.run( 'document/elements/paste', {
			container: eContainer,
			rebuild,
			returnValue: true,
		} );
	}

	static multiPaste( eContainers ) {
		return $e.run( 'document/elements/paste', {
			containers: eContainers,
			returnValue: true,
		} );
	}

	static pasteStyle( eContainer ) {
		$e.run( 'document/elements/pasteStyle', {
			container: eContainer,
		} );
	}

	static multiPasteStyle( eContainers ) {
		$e.run( 'document/elements/pasteStyle', {
			containers: eContainers,
		} );
	}


	static resetStyle( eContainer ) {
		$e.run( 'document/elements/resetStyle', {
			container: eContainer,
		} );
	}

	static multiResetStyle( eContainers ) {
		$e.run( 'document/elements/resetStyle', {
			containers: eContainers,
		} );
	}

	static duplicate( eContainer ) {
		return $e.run( 'document/elements/duplicate', {
			container: eContainer,
			returnValue: true,
		} );
	}

	static multiDuplicate( eContainers ) {
		return $e.run( 'document/elements/duplicate', {
			containers: eContainers,
			returnValue: true,
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

	static subSettings( eContainer, key, settings ) {
		$e.run( 'document/elements/subSettings', {
			container: eContainer,
			key,
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

	static repeaterInsert( eContainer, name, item ) {
		return $e.run( 'document/elements/repeater/insert', {
			container: eContainer,
			name,
			model: item,
			returnValue: true,
		} );
	}

	static multiRepeaterInsert( eContainers, name, item ) {
		return $e.run( 'document/elements/repeater/insert', {
			containers: eContainers,
			name,
			model: item,
			returnValue: true,
		} );
	}

	static repeaterRemove( eContainer, name, index ) {
		return $e.run( 'document/elements/repeater/remove', {
			container: eContainer,
			name,
			index,
			returnValue: true,
		} );
	}

	static multiRepeaterRemove( eContainers, name, index ) {
		return $e.run( 'document/elements/repeater/remove', {
			containers: eContainers,
			name,
			index,
			returnValue: true,
		} );
	}

	static repeaterSettings( eContainer, name, index, settings ) {
		$e.run( 'document/elements/repeater/settings', {
			container: eContainer,
			name,
			index,
			settings,
		} );
	}

	static multiRepeaterSettings( eContainers, name, index, settings ) {
		$e.run( 'document/elements/repeater/settings', {
			containers: eContainers,
			name,
			index,
			settings,
		} );
	}

	static repeaterDuplicate( eContainer, name, index ) {
		return $e.run( 'document/elements/repeater/duplicate', {
			container: eContainer,
			name,
			index,
			returnValue: true,
		} );
	}

	static multiRepeaterDuplicate( eContainers, name, index ) {
		return $e.run( 'document/elements/repeater/duplicate', {
			containers: eContainers,
			name,
			index,
			returnValue: true,
		} );
	}

	static repeaterMove( eContainer, name, sourceIndex, targetIndex ) {
		$e.run( 'document/elements/repeater/move', {
			container: eContainer,
			name,
			sourceIndex,
			targetIndex,
		} );
	}

	static multiRepeaterMove( eContainers, name, sourceIndex, targetIndex ) {
		$e.run( 'document/elements/repeater/move', {
			containers: eContainers,
			name,
			sourceIndex,
			targetIndex,
		} );
	}
}
// For run in Devtools.
if ( ! window.assert ) {
	window.assert = {}; window.assert.equal = (a,b,c) => { if (a !== b) throw Error(`${a}!=${b} ${c}`) }
}
