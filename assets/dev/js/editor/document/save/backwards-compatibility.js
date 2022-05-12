import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		Object.defineProperty( this, 'autoSaveTimer', {
			get() {
				elementor.devTools.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers" );
				return $e.components.get( 'editor/documents' ).autoSaveTimers;
			},

			set( value ) {
				elementor.devTools.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ]" );

				const documentId = elementor.documents.getCurrent();

				$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ] = value;
			},
		} );

		const onOrig = this.on;

		this.on = ( eventName, callback, context ) => {
			elementor.devTools.deprecation.deprecated( 'elementor.saver.on', '2.9.0',
				'$e.hooks' );

			onOrig( eventName, callback, context );
		};

		elementor.on( 'document:loaded', () => {
			if ( elementor.channels.editor._events && elementor.channels.editor._events.saved ) {
				elementor.devTools.deprecation.deprecated( "elementor.channels.editor.on( 'saved', ... )", '2.9.0',
					'$e.hooks' );
			}
		} );
	}

	defaultSave() {
		elementor.devTools.deprecation.deprecated( 'defaultSave', '2.9.0', "$e.run( 'document/save/default' )" );

		return $e.run( 'document/save/default' );
	}

	discard() {
		elementor.devTools.deprecation.deprecated( 'discard', '2.9.0', "$e.run( 'document/save/discard' )" );

		return $e.run( 'document/save/discard' );
	}

	doAutoSave() {
		elementor.devTools.deprecation.deprecated( 'doAutoSave', '2.9.0', "$e.run( 'document/save/auto' )" );

		return $e.run( 'document/save/auto' );
	}

	publish( options ) {
		elementor.devTools.deprecation.deprecated( 'publish', '2.9.0', "$e.run( 'document/save/publish' )" );

		return $e.run( 'document/save/auto', { options } );
	}

	saveAutoSave( options ) {
		elementor.devTools.deprecation.deprecated( 'saveAutoSave', '2.9.0', "$e.run( 'document/save/auto', { force: true } )" );

		options.force = true;

		return $e.run( 'document/save/auto', options );
	}

	saveDraft() {
		elementor.devTools.deprecation.deprecated( 'saveDraft', '2.9.0', "$e.run( 'document/save/draft' )" );

		return $e.run( 'document/save/draft' );
	}

	savePending() {
		elementor.devTools.deprecation.deprecated( 'savePending', '2.9.0', "$e.run( 'document/save/pending' )" );

		return $e.run( 'document/save/pending' );
	}

	update( options ) {
		elementor.devTools.deprecation.deprecated( 'update', '2.9.0', "$e.run( 'document/save/update' )" );

		return $e.run( 'document/save/update', options );
	}

	startTimer() {
		elementor.devTools.deprecation.deprecated( 'startTimer', '2.9.0',
			"$e.components.get( 'document/save' ).startAutoSave" );

		throw Error( 'Deprecated' );
	}

	saveEditor( options ) {
		elementor.devTools.deprecation.deprecated( 'saveEditor', '2.9.0',
			"$e.internal( 'document/save/save' )" );

		$e.internal( 'document/save/save', options );
	}

	setFlagEditorChange( status ) {
		elementor.devTools.deprecation.deprecated( 'setFlagEditorChange', '2.9.0',
			"$e.internal( 'document/save/set-is-modified' )" );

		$e.internal( 'document/save/set-is-modified', { status } );
	}
}
