export default class Heartbeat {
	modal = null;
	document = null;

	constructor( document ) {
		this.document = document;

		this.onSend = this.onSend.bind( this );
		this.onTick = this.onTick.bind( this );
		this.onRefreshNonce = this.onRefreshNonce.bind( this );

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

	bindEvents() {
		jQuery( document ).on( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );
	}

	destroy() {
		jQuery( document ).off( {
			'heartbeat-send': this.onSend,
			'heartbeat-tick': this.onTick,
			'heartbeat-tick.wp-refresh-nonces': this.onRefreshNonce,
		} );
	}
}
