import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		Object.defineProperty( this, 'autoSaveTimer', {
			get() {
				elementorDevToolsModule.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers" );
				return $e.components.get( 'editor/documents' ).autoSaveTimers;
			},

			set( value ) {
				elementorDevToolsModule.deprecation.deprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ]" );

				const documentId = elementor.documents.getCurrent();

				$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ] = value;
			},
		} );

		const onOrig = this.on;

		this.on = ( eventName, callback, context ) => {
			elementorDevToolsModule.deprecation.deprecated( 'elementor.saver.on', '2.9.0',
				'$e.hooks' );

			onOrig( eventName, callback, context );
		};

		elementor.on( 'document:loaded', () => {
			if ( elementor.channels.editor._events && elementor.channels.editor._events.saved ) {
				elementorDevToolsModule.deprecation.deprecated( "elementor.channels.editor.on( 'saved', ... )", '2.9.0',
					'$e.hooks' );
			}
		} );
	}

	defaultSave() {
		elementorDevToolsModule.deprecation.deprecated( 'defaultSave', '2.9.0', "$e.run( 'document/save/default' )" );

		return $e.run( 'document/save/default' );
	}

	discard() {
		elementorDevToolsModule.deprecation.deprecated( 'discard', '2.9.0', "$e.run( 'document/save/discard' )" );

		return $e.run( 'document/save/discard' );
	}

	doAutoSave() {
		elementorDevToolsModule.deprecation.deprecated( 'doAutoSave', '2.9.0', "$e.run( 'document/save/auto' )" );

		return $e.run( 'document/save/auto' );
	}

	publish( options ) {
		elementorDevToolsModule.deprecation.deprecated( 'publish', '2.9.0', "$e.run( 'document/save/publish' )" );

		return $e.run( 'document/save/auto', { options } );
	}

	saveAutoSave( options ) {
		elementorDevToolsModule.deprecation.deprecated( 'saveAutoSave', '2.9.0', "$e.run( 'document/save/auto', { force: true } )" );

		options.force = true;

		return $e.run( 'document/save/auto', options );
	}

	saveDraft() {
		elementorDevToolsModule.deprecation.deprecated( 'saveDraft', '2.9.0', "$e.run( 'document/save/draft' )" );

		return $e.run( 'document/save/draft' );
	}

	savePending() {
		elementorDevToolsModule.deprecation.deprecated( 'savePending', '2.9.0', "$e.run( 'document/save/pending' )" );

		return $e.run( 'document/save/pending' );
	}

	update( options ) {
		elementorDevToolsModule.deprecation.deprecated( 'update', '2.9.0', "$e.run( 'document/save/update' )" );

		return $e.run( 'document/save/update', options );
	}

	startTimer() {
		elementorDevToolsModule.deprecation.deprecated( 'startTimer', '2.9.0',
			"$e.components.get( 'document/save' ).startAutoSave" );

		throw Error( 'Deprecated' );
	}

	saveEditor( options ) {
		elementorDevToolsModule.deprecation.deprecated( 'saveEditor', '2.9.0',
			"$e.internal( 'document/save/save' )" );

		$e.internal( 'document/save/save', options );
	}

	setFlagEditorChange( status ) {
		elementorDevToolsModule.deprecation.deprecated( 'setFlagEditorChange', '2.9.0',
			"$e.internal( 'document/save/set-is-modified' )" );

		$e.internal( 'document/save/set-is-modified', { status } );
	}
}
