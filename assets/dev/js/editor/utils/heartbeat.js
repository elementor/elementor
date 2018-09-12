class Heartbeat {
	constructor() {
		let modal;

		this.getModal = () => {
			if ( ! modal ) {
				modal = this.initModal();
			}

			return modal;
		};

		jQuery( document ).on( {
			'heartbeat-send': ( event, data ) => {
				data.elementor_post_lock = {
					post_ID: elementor.config.document.id
				};
			},
			'heartbeat-tick': ( event, response ) => {
				if ( response.locked_user ) {
					if ( elementor.saver.isEditorChanged() ) {
						elementor.saver.saveEditor( {
							status: 'autosave'
						} );
					}

					this.showLockMessage( response.locked_user );
				} else {
					this.getModal().hide();
				}

				elementor.config.nonce = response.elementorNonce;
			},
			'heartbeat-tick.wp-refresh-nonces': ( event, response ) => {
				const nonces = response['elementor-refresh-nonces'];

				if ( nonces ) {
					if ( nonces.heartbeatNonce ) {
						elementor.config.nonce = nonces.elementorNonce;
					}

					if ( nonces.heartbeatNonce ) {
						window.heartbeatSettings.nonce = nonces.heartbeatNonce;
					}
				}
			}
		} );

		if ( elementor.config.locked_user ) {
			this.showLockMessage( elementor.config.locked_user );
		}
	}

	initModal() {
		const modal = elementor.dialogsManager.createWidget( 'lightbox', {
			headerMessage: elementor.translate( 'take_over' )
		} );

		modal.addButton( {
			name: 'go_back',
			text: elementor.translate( 'go_back' ),
			callback() {
				parent.history.go( -1 );
			}
		} );

		modal.addButton( {
			name: 'take_over',
			text: elementor.translate( 'take_over' ),
			callback() {
				wp.heartbeat.enqueue( 'elementor_force_post_lock', true );
				wp.heartbeat.connectNow();
			}
		} );

		return modal;
	}

	showLockMessage( lockedUser ) {
		const modal = this.getModal();

		modal
			.setMessage( elementor.translate( 'dialog_user_taken_over', [ lockedUser ] ) )
			.show();
	}
}

export default Heartbeat;
