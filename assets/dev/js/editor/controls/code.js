var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlCodeEditorItemView;

ControlCodeEditorItemView = ControlBaseDataView.extend( {
	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.editor = '.elementor-code-editor';

		return ui;
	},

	loadAce() {
		if ( 'undefined' !== typeof ace ) {
			return Promise.resolve();
		}

		const { ace: aceSrc, aceLangTools } = window._elementorLazyScripts || {};

		return this.lazyLoadScripts( 'ace', [ aceSrc, aceLangTools ] );
	},

	onReady() {
		var self = this;

		this.$spinner = jQuery( '<span>', { class: 'elementor-control-spinner' } )
			.html( '<i class="eicon-spinner eicon-animation-spin"></i>' );

		this.ui.editor.attr( 'disabled', true );
		this.ui.editor.after( this.$spinner );

		this.loadAce()
			.then( () => {
				self.$spinner.remove();
				self.ui.editor.removeAttr( 'disabled' );
				self.initAceEditor();
			} )
			.catch( ( error ) => {
				self.$spinner.remove();
				self.ui.editor.removeAttr( 'disabled' );
				if ( window.elementorCommon?.debug ) {
					// eslint-disable-next-line no-console
					console.warn( 'ACE Editor failed to load:', error );
				}
			} );
	},

	initAceEditor() {
		var self = this;

		const langTools = ace.require( 'ace/ext/language_tools' ),
			uiTheme = elementor.settings.editorPreferences.model.get( 'ui_theme' ),
			userPrefersDark = matchMedia( '(prefers-color-scheme: dark)' ).matches;

		self.editor = ace.edit( this.ui.editor[ 0 ] );

		// Since the code control is wrapped with a dynamic div, the class elementor-control-tag-area need to be had dynamically to handle the dynamic tag functionality.
		jQuery( self.editor.container ).addClass( 'e-input-style elementor-code-editor elementor-control-tag-area' );

		self.editor.setOptions( {
			mode: 'ace/mode/' + self.model.attributes.language,
			minLines: 10,
			maxLines: Infinity,
			showGutter: true,
			useWorker: true,
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
		} );

		if ( 'dark' === uiTheme || ( 'auto' === uiTheme && userPrefersDark ) ) {
			self.editor.setTheme( 'ace/theme/merbivore_soft' );
		}

		self.editor.getSession().setUseWrapMode( true );

		elementor.panel.$el.on( 'resize.aceEditor', self.onResize.bind( this ) );

		if ( 'css' === self.model.attributes.language ) {
			var selectorCompleter = {
				getCompletions( editor, session, pos, prefix, callback ) {
					var list = [],
						token = session.getTokenAt( pos.row, pos.column );

					if ( 0 < prefix.length && 'selector'.match( prefix ) && 'constant' === token.type ) {
						list = [ {
							name: 'selector',
							value: 'selector',
							score: 1,
							meta: 'Elementor',
						} ];
					}

					callback( null, list );
				},
			};

			langTools.addCompleter( selectorCompleter );
		}

		self.editor.setValue( self.getControlValue(), -1 ); // -1 =  move cursor to the start

		if ( this.isEditable() ) {
			self.editor.on( 'change', function() {
				self.setValue( self.editor.getValue() );
			} );
		}

		if ( 'html' === self.model.attributes.language ) {
			// Remove the `doctype` annotation
			var session = self.editor.getSession();

			session.on( 'changeAnnotation', function() {
				var annotations = session.getAnnotations() || [],
					annotationsLength = annotations.length,
					index = annotations.length;

				while ( index-- ) {
					if ( /doctype first\. Expected/.test( annotations[ index ].text ) ) {
						annotations.splice( index, 1 );
					}
				}

				if ( annotationsLength > annotations.length ) {
					session.setAnnotations( annotations );
				}
			} );
		}
	},

	onResize() {
		this.editor.resize();
	},

	onDestroy() {
		elementor.panel.$el.off( 'resize.aceEditor' );
	},

	isEditable() {
		const isEditable = this.model.get( 'is_editable' );

		return undefined !== isEditable ? isEditable : true;
	},
} );

function scheduleAcePreload() {
	const { ace: aceSrc, aceLangTools } = window._elementorLazyScripts || {};

	if ( ! aceSrc ) {
		return;
	}

	const doPreload = () => ControlBaseDataView.prototype.lazyLoadScripts.call( {}, 'ace', [ aceSrc, aceLangTools ] );

	if ( 'function' === typeof requestIdleCallback ) {
		requestIdleCallback( doPreload );
	} else {
		setTimeout( doPreload, 0 );
	}
}

window.addEventListener( 'elementor/init', scheduleAcePreload, { once: true } );

module.exports = ControlCodeEditorItemView;
