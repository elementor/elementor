export default class Heartbeat {
	modal = null;
	document = null;
	lastSyncedAt = 0;
	lastStateOfDocumentChange = false;

	constructor( document ) {
		this.document = document;
		this.lastSyncedAt = Math.floor( Date.now() / 1000 );

		this.onSend = this.onSend.bind( this );
		this.onTick = this.onTick.bind( this );
		this.onRefreshNonce = this.onRefreshNonce.bind( this );
		this.onDocumentChanged = this.onDocumentChanged.bind( this );
		this.onDocumentLoaded = this.onDocumentLoaded.bind( this );

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

		if ( this.document.editor.isChanged ) {
			data.elementor_has_unsaved = this.document.id;
		}
	}

	onTick( event, response ) {
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

	onDocumentLoaded() {
		this.lastSyncedAt = Math.floor( Date.now() / 1000 );
	}

	reloadDocument() {
		$e.internal( 'document/save/set-is-modified', { status: false } );
		this._doReload();
	}

	_doReload() {
		window.location.reload();
	}

	forceSave() {
		this.lastSyncedAt = Math.floor( Date.now() / 1000 );
		$e.run( 'document/save/save', { document: this.document } );
	}

	showExternalChangeModal() {
		const isDirty = this.document.editor.isChanged;

		const config = isDirty
			? {
				headerMessage: __( 'Page Updated by AI', 'elementor' ),
				message: __( 'This page was changed externally. Save your changes or reload to get the latest version.', 'elementor' ),
				strings: {
					confirm: __( 'Force Save', 'elementor' ),
					cancel: __( 'Reload', 'elementor' ),
				},
				defaultOption: 'confirm',
				onConfirm: () => this.forceSave(),
				onCancel: () => this.reloadDocument(),
			}
			: {
				headerMessage: __( 'Page Updated by AI', 'elementor' ),
				message: __( 'This page was changed externally. Reload to get the latest version.', 'elementor' ),
				strings: {
					confirm: __( 'Reload', 'elementor' ),
				},
				defaultOption: 'confirm',
				onConfirm: () => this.reloadDocument(),
			};

		const modal = elementorCommon.dialogsManager.createWidget( isDirty ? 'confirm' : 'alert', {
			...config,
			closeButton: false,
			closeButtonOptions: { iconClass: '' },
			hide: {
				onOutsideClick: false,
				onEscKeyPress: false,
				onBackgroundClick: false,
			},
		} );

		modal.show();
	}

	onDocumentChanged() {
		const newChangeOfDocumentState = this.document.editor.isChanged;
		if (newChangeOfDocumentState === this.lastStateOfDocumentChange) {
			return;
		}
		if (newChangeOfDocumentState) {
			wp.heartbeat.enqueue( 'elementor_has_unsaved', this.document.id );
		} else {
			wp.heartbeat.enqueue( 'elementor_has_unsaved', null );
		}
		wp.heartbeat.connectNow();
		this.lastStateOfDocumentChange = newChangeOfDocumentState;
	}

	bindEvents() {
		jQuery( document ).on( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );

		elementor.channels.editor.on( 'status:change', this.onDocumentChanged );
		elementor.on( 'document:loaded', this.onDocumentLoaded );
	}

	destroy() {
		jQuery( document ).off( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );

		elementor.channels.editor.off( 'status:change', this.onDocumentChanged );
		elementor.off( 'document:loaded', this.onDocumentLoaded );
	}
}
