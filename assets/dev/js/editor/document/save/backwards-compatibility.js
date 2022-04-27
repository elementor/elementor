import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		Object.defineProperty( this, 'autoSaveTimer', {
			get() {
				elementorCommon.helpers.hardDeprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers" );
				return $e.components.get( 'editor/documents' ).autoSaveTimers;
			},

			set( value ) {
				elementorCommon.helpers.hardDeprecated( 'elementor.saver.autoSaveTimer', '2.9.0',
					"$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ]" );

				const documentId = elementor.documents.getCurrent();

				$e.components.get( 'editor/documents' ).autoSaveTimers[ documentId ] = value;
			},
		} );

		const onOrig = this.on;

		this.on = ( eventName, callback, context ) => {
			elementorCommon.helpers.hardDeprecated( 'elementor.saver.on', '2.9.0',
				'$e.hooks' );

			onOrig( eventName, callback, context );
		};

		elementor.on( 'document:loaded', () => {
			if ( elementor.channels.editor._events && elementor.channels.editor._events.saved ) {
				elementorCommon.helpers.hardDeprecated( "elementor.channels.editor.on( 'saved', ... )", '2.9.0',
					'$e.hooks' );
			}
		} );
	}

	defaultSave() {
		elementorCommon.helpers.hardDeprecated( 'defaultSave', '2.9.0', "$e.run( 'document/save/default' )" );

		return $e.run( 'document/save/default' );
	}

	discard() {
		elementorCommon.helpers.hardDeprecated( 'discard', '2.9.0', "$e.run( 'document/save/discard' )" );

		return $e.run( 'document/save/discard' );
	}

	doAutoSave() {
		elementorCommon.helpers.hardDeprecated( 'doAutoSave', '2.9.0', "$e.run( 'document/save/auto' )" );

		return $e.run( 'document/save/auto' );
	}

	publish( options ) {
		elementorCommon.helpers.hardDeprecated( 'publish', '2.9.0', "$e.run( 'document/save/publish' )" );

		return $e.run( 'document/save/auto', { options } );
	}

	saveAutoSave( options ) {
		elementorCommon.helpers.hardDeprecated( 'saveAutoSave', '2.9.0', "$e.run( 'document/save/auto', { force: true } )" );

		options.force = true;

		return $e.run( 'document/save/auto', options );
	}

	saveDraft() {
		elementorCommon.helpers.hardDeprecated( 'saveDraft', '2.9.0', "$e.run( 'document/save/draft' )" );

		return $e.run( 'document/save/draft' );
	}

	savePending() {
		elementorCommon.helpers.hardDeprecated( 'savePending', '2.9.0', "$e.run( 'document/save/pending' )" );

		return $e.run( 'document/save/pending' );
	}

	update( options ) {
		elementorCommon.helpers.hardDeprecated( 'update', '2.9.0', "$e.run( 'document/save/update' )" );

		return $e.run( 'document/save/update', options );
	}

	startTimer() {
		elementorCommon.helpers.hardDeprecated( 'startTimer', '2.9.0',
			"$e.components.get( 'document/save' ).startAutoSave" );

		throw Error( 'Deprecated' );
	}

	saveEditor( options ) {
		elementorCommon.helpers.hardDeprecated( 'saveEditor', '2.9.0',
			"$e.internal( 'document/save/save' )" );

		$e.internal( 'document/save/save', options );
	}

	setFlagEditorChange( status ) {
		elementorCommon.helpers.hardDeprecated( 'setFlagEditorChange', '2.9.0',
			"$e.internal( 'document/save/set-is-modified' )" );

		$e.internal( 'document/save/set-is-modified', { status } );
	}
}
