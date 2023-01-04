class NewPostDialog {
	constructor() {
		this.getPostTypes();
		this.addButtonListeners();
	}

	getPostTypes() {
		this.postTypes = [];

		if ( ! window.elementorNewPostDialogsConfig ) {
			return;
		}

		// this.postTypes = window.elementorNewPostDialogsConfig.types
		// 	.reduce( ( types, type ) => {
		// 		types[ type ] = {};
		// 		return types;
		// 	}, {} );

		this.postTypes = window.elementorNewPostDialogsConfig.types ?? [];
	}

	addButtonListeners() {
		Object.keys( this.postTypes ).forEach( ( postType ) => {
			const postNewButtons = document.querySelectorAll( `a[href$="post-new.php?post_type=${ postType }"]` );

			if ( ! postNewButtons.length ) {
				return;
			}

			const self = this;
			postNewButtons.forEach( ( button ) => {
				button.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					self.getDialog( postType ).show();
				} );
			} );
		} );
	}

	getDialog = ( postType ) => {
		if ( this.postTypes[ postType ].dialog ) {
			return this.postTypes[ postType ].dialog;
		}

		const form = document.getElementById( `e_new_post_dialog_form_${ postType }` );
		const dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: form.querySelector( '.e-new-post-dialog__title' ),
			message: form,
			strings: {
				confirm: __( 'Save', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: () => {
				this.createPost( postType );
			},
		} );

		return this.postTypes[ postType ].dialog = dialog;
	};

	createPost( postType ) {
		const form = document.getElementById( `e_new_post_dialog_form_${ postType }` );
		const formData = new FormData( form );

		elementorCommon.ajax.addRequest( 'elementor_new_post_dialog_submit', {
			data: {
				post_type: postType,
				post_title: formData.get( 'post_title' ),
			},
			error: () => {
				elementor.notifications.showToast( {
					message: this.postTypes[ postType ].errorMessage,
				} );
			},
			success: ( result ) => {
				window.top.location = result;
			},
		} );
	}
}

new NewPostDialog();
