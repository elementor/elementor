import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		Object.defineProperty( this, 'autoSaveTimer', {
			get() {
				elementorDevTools.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers" );
				return $e.components.get( 'editor/documents' ).autoSaveTimers;
			},

			set( value ) {
				elementorDevTools.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ]" );

				const documentId = elementor.documents.getCurrent();

				$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ] = value;
			},
		} );

		const onOrig = this.on;

		this.on = ( eventName, callback, context ) => {
			elementorDevTools.deprecation.deprecated( 'elementor.saver.on', '2.9.0',
				'$e.hooks' );

			onOrig( eventName, callback, context );
		};

		elementor.on( 'document:loaded', () => {
			if ( elementor.channels.editor._events && elementor.channels.editor._events.saved ) {
				elementorDevTools.deprecation.deprecated( "elementor.channels.editor.on( 'saved', ... )", '2.9.0',
					'$e.hooks' );
			}
		} );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/default' )` instead.
	 */
	defaultSave() {
		elementorDevTools.deprecation.deprecated( 'defaultSave()', '2.9.0', "$e.run( 'document/save/default' )" );

		return $e.run( 'document/save/default' );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/discard' )` instead.
	 */
	discard() {
		elementorDevTools.deprecation.deprecated( 'discard()', '2.9.0', "$e.run( 'document/save/discard' )" );

		return $e.run( 'document/save/discard' );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/auto' )` instead.
	 */
	doAutoSave() {
		elementorDevTools.deprecation.deprecated( 'doAutoSave()', '2.9.0', "$e.run( 'document/save/auto' )" );

		return $e.run( 'document/save/auto' );
	}

	/**
	 * @param {*} options
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/publish', { options } )` instead.
	 */
	publish( options ) {
		elementorDevTools.deprecation.deprecated( 'publish( options )', '2.9.0', "$e.run( 'document/save/publish', { options } )" );

		return $e.run( 'document/save/auto', { options } );
	}

	/**
	 * @param {*} options
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/auto', { force: true } )` instead.
	 */
	saveAutoSave( options ) {
		elementorDevTools.deprecation.deprecated( 'saveAutoSave()', '2.9.0', "$e.run( 'document/save/auto', { force: true } )" );

		options.force = true;

		return $e.run( 'document/save/auto', options );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/draft' )` instead.
	 */
	saveDraft() {
		elementorDevTools.deprecation.deprecated( 'saveDraft()', '2.9.0', "$e.run( 'document/save/draft' )" );

		return $e.run( 'document/save/draft' );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/pending' )` instead.
	 */
	savePending() {
		elementorDevTools.deprecation.deprecated( 'savePending()', '2.9.0', "$e.run( 'document/save/pending' )" );

		return $e.run( 'document/save/pending' );
	}

	/**
	 * @param {*} options
	 * @deprecated since 2.9.0, use `$e.run( 'document/save/update', options )` instead.
	 */
	update( options ) {
		elementorDevTools.deprecation.deprecated( 'update( options )', '2.9.0', "$e.run( 'document/save/update', options )" );

		return $e.run( 'document/save/update', options );
	}

	/**
	 * @deprecated since 2.9.0, use `$e.components.get( 'document/save' ).startAutoSave` instead.
	 */
	startTimer() {
		elementorDevTools.deprecation.deprecated( 'startTimer()', '2.9.0', "$e.components.get( 'document/save' ).startAutoSave" );

		throw Error( 'Deprecated' );
	}

	/**
	 * @param {*} options
	 * @deprecated since 2.9.0, use `$e.internal( 'document/save/save', options )` instead.
	 */
	saveEditor( options ) {
		elementorDevTools.deprecation.deprecated( 'saveEditor( options )', '2.9.0', "$e.internal( 'document/save/save', options )" );

		$e.internal( 'document/save/save', options );
	}

	/**
	 * @param {*} status
	 * @deprecated since 2.9.0, use `$e.internal( 'document/save/set-is-modified', { status } )` instead.
	 */
	setFlagEditorChange( status ) {
		elementorDevTools.deprecation.deprecated( 'setFlagEditorChange( status )', '2.9.0', "$e.internal( 'document/save/set-is-modified', { status } )" );

		$e.internal( 'document/save/set-is-modified', { status } );
	}
}
