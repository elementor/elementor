export default class Heartbeat {
	modal = null;
	externalChangeModal = null;
	document = null;
	lastSyncedAt = 0;
	pendingSyncTime = true;
	lastStateOfDocumentChange = false;

	constructor( document ) {
		this.document = document;
		this.lastSyncedAt = document.config.server_time || 0;
		this.pendingSyncTime = ! this.lastSyncedAt;
		this.lastStateOfDocumentChange = document.editor.isChanged;

		this.onSend = this.onSend.bind( this );
		this.onTick = this.onTick.bind( this );
		this.onRefreshNonce = this.onRefreshNonce.bind( this );
		this.onDocumentChanged = this.onDocumentChanged.bind( this );
		this.onDocumentSaved = this.onDocumentSaved.bind( this );

		this.bindEvents();

		wp.heartbeat.connectNow();
	}

	getModal = () => {
		if ( ! this.modal ) {
			this.modal = this.initModal();
		}

		return this.modal;
	};

	initModal() {
		const modal = elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Take Over', 'elementor' ),
			strings: {
				confirm: __( 'Take Over', 'elementor' ),
				cancel: __( 'Go Back', 'elementor' ),
			},
			defaultOption: 'confirm',
			onConfirm() {
				wp.heartbeat.enqueue( 'elementor_force_post_lock', true );
				wp.heartbeat.connectNow();
			},
			onCancel() {
				parent.history.go( -1 );
			},
		} );

		return modal;
	}

	showLockMessage( lockedUser ) {
		const modal = this.getModal();

		// Translators: %s is locked username.
		modal.setMessage( sprintf( __( '%s has taken over and is currently editing. Do you want to take over this page editing?', 'elementor' ), lockedUser ) )
			.show();
	}

	onSend( event, data ) {
		data.elementor_post_lock = {
			post_ID: this.document.id,
		};

		data.elementor_has_unsaved = this.document.editor.isSaved ? null : this.document.id;
	}

	onTick( event, response ) {
		if ( this.pendingSyncTime && response.elementor_server_time ) {
			this.lastSyncedAt = response.elementor_server_time;
			this.pendingSyncTime = false;
		}

		if ( response.locked_user ) {
			if ( this.document.editor.isChanged ) {
				$e.run( 'document/save/auto', {
					document: this.document,
				} );
			}

			this.showLockMessage( response.locked_user );
		} else {
			this.getModal().hide();
		}

		const mutatedAt = response.elementor_mcp_mutation?.mutated_at;

		if ( mutatedAt && mutatedAt > this.lastSyncedAt ) {
			this.lastSyncedAt = mutatedAt;
			$e.components.get( 'document/save' ).stopAutoSave( this.document );
			this.showExternalChangeModal();
		}

		elementorCommon.ajax.addRequestConstant( '_nonce', response.elementorNonce );
	}

	onRefreshNonce( event, response ) {
		const nonces = response[ 'elementor-refresh-nonces' ];

		if ( nonces ) {
			if ( nonces.heartbeatNonce ) {
				elementorCommon.ajax.addRequestConstant( '_nonce', nonces.elementorNonce );
			}

			if ( nonces.heartbeatNonce ) {
				window.heartbeatSettings.nonce = nonces.heartbeatNonce;
			}
		}
	}

	reloadDocument() {
		$e.internal( 'document/save/set-is-modified', { status: false } );
		this._doReload();
	}

	_doReload() {
		window.location.reload();
	}

	forceSave() {
		this.pendingSyncTime = true;
		$e.run( 'document/save/save', { document: this.document } );
	}

	showExternalChangeModal() {
		if ( this.externalChangeModal ) {
			return;
		}

		const isDirty = this.document.editor.isChanged;

		const baseConfig = {
			headerMessage: __( 'Page Updated by AI', 'elementor' ),
			defaultOption: 'confirm',
			onConfirm: () => this.reloadDocument(),
		};

		const config = isDirty
			? {
				...baseConfig,
				message: __( 'This page was changed externally. Save your changes or reload to get the latest version.', 'elementor' ),
				strings: {
					confirm: __( 'Force Save', 'elementor' ),
					cancel: __( 'Reload', 'elementor' ),
				},
				onConfirm: () => this.forceSave(),
				onCancel: () => this.reloadDocument(),
			}
			: {
				...baseConfig,
				message: __( 'This page was changed externally. Reload to get the latest version.', 'elementor' ),
				strings: {
					confirm: __( 'Reload', 'elementor' ),
				},
			};

		this.externalChangeModal = elementorCommon.dialogsManager.createWidget( isDirty ? 'confirm' : 'alert', {
			...config,
			closeButton: false,
			hide: {
				onOutsideClick: false,
				onEscKeyPress: false,
				onBackgroundClick: false,
			},
			onHide: () => {
				this.externalChangeModal = null;
			},
		} );

		this.externalChangeModal.show();
	}

	onDocumentChanged() {
		const newChangeOfDocumentState = this.document.editor.isChanged;
		if (newChangeOfDocumentState === this.lastStateOfDocumentChange) {
			return;
		}
		if ( newChangeOfDocumentState ) {
			wp.heartbeat.connectNow();
		}
		this.lastStateOfDocumentChange = newChangeOfDocumentState;
	}

	onDocumentSaved() {
		if ( this.document.editor.isSaved ) {
			wp.heartbeat.connectNow();
		}
	}

	bindEvents() {
		jQuery( document ).on( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );

		elementor.channels.editor.on( 'status:change', this.onDocumentChanged );
		elementor.channels.editor.on( 'saved', this.onDocumentSaved );
	}

	destroy() {
		jQuery( document ).off( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );

		elementor.channels.editor.off( 'status:change', this.onDocumentChanged );
		elementor.channels.editor.off( 'saved', this.onDocumentSaved );
	}
}
