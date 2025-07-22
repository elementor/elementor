export default class extends elementorModules.Module {
	defaultOptions = {
		title: '',
		content: '',
		targetElement: null,
		position: {
			blockStart: null,
			inlineStart: null,
		},
		actionButton: {
			url: null,
			text: null,
			classes: [ 'elementor-button', 'e-accent' ],
		},
		hideProTag: false,
	};

	elements = {
		$title: null,
		$titleBadge: null,
		$closeButton: null,
		$header: null,
	};

	constructor() {
		super();

		this.initDialog();
	}

	initDialog() {
		this.dialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-element--promotion__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			hide: {
				onOutsideClick: false,
			},
			position: {
				my: ( elementorCommon.config.isRTL ? 'right' : 'left' ) + '+5 top',
			},
			onHide: () => {
				if ( this.hideProTag ) {
					this.resetProTag();
				}
			},
		} );

		this.elements.$header = this.dialog.getElements( 'header' );

		this.elements.$title = jQuery( '<div>', { id: 'elementor-element--promotion__dialog__title' } );
		this.elements.$titleBadge = jQuery( '<i>', { class: 'eicon-pro-icon' } );
		this.elements.$closeButton = jQuery( '<i>', { class: 'eicon-close' } );

		this.elements.$closeButton.on( 'click', () => this.dialog.hide() );

		this.elements.$header.append(
			this.elements.$title,
			this.elements.$titleBadge,
			this.elements.$closeButton,
		);
	}

	hideProTag() {
		this.elements.$titleBadge.css( 'display', 'none' );
		this.elements.$freeBadge = jQuery( '<span>', { class: 'e-free-badge' } );
		this.elements.$freeBadge.text( 'Free' );
		this.elements.$freeBadge.css( {
			'border-radius': 'var(--e-a-border-radius)',
    			'background-color': 'var(--e-a-btn-bg)',
    			'color': 'var(--e-a-btn-color-invert)',
			'padding': '3px',
		} );
		this.elements.$titleBadge.after( this.elements.$freeBadge );
		this.elements.$header.css( 'justify-content', 'space-between' );
		const $actionButton = this.dialog.getElements( 'action' );
		$actionButton.removeClass( 'go-pro' );
		$actionButton.css( 'background-color', 'var(--e-a-btn-bg-info)' );
	}

	resetProTag() {
		this.elements.$titleBadge.css( 'display', 'inline-block' );
		this.elements.$freeBadge.remove();
		this.dialog.getElements( 'action' ).addClass( 'go-pro' );
	}

	createButton( options ) {
		const $actionButton = this.dialog.getElements( 'action' );

		if ( $actionButton ) {
			$actionButton.remove();
		}

		this.dialog.addButton( {
			name: 'action',
			text: options.text,
			classes: options.classes.join( ' ' ),
			callback: () => open( options.url, '_blank' ),
		} );
	}

	parseOptions( options = {} ) {
		return {
			...this.defaultOptions,
			...options,
			position: {
				...this.defaultOptions.position,
				...( options?.position || {} ),
			},
			actionButton: {
				...this.defaultOptions.actionButton,
				...( options?.actionButton || {} ),
			},
		};
	}

	showDialog( options = {} ) {
		if ( ! this.dialog ) {
			this.initDialog();
		}

		options = this.parseOptions( options );

		this.createButton( options.actionButton );

		this.elements.$title.text( options.title );

		const inlineStartKey = elementorCommon.config.isRTL ? 'left' : 'right';

		this.dialog
			.setMessage( options.content )
			.setSettings( 'position', {
				of: options.targetElement,
				at: `${ inlineStartKey }${ options.position.inlineStart || '' } top${ options.position.blockStart || '' }`,
			} );

		if ( options.hideProTag ) {
			this.hideProTag();
		}

		return this.dialog.show();
	}
}
