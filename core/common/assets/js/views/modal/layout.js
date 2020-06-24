import HeaderView from './header';
import LogoView from './logo';
import LoadingView from './loading';

export default class extends Marionette.LayoutView {
	el() {
		return this.getModal().getElements( 'widget' );
	}

	regions() {
		return {
			modalHeader: '.dialog-header',
			modalContent: '.dialog-lightbox-content',
			modalLoading: '.dialog-lightbox-loading',
		};
	}

	initialize() {
		this.modalHeader.show( new HeaderView( this.getHeaderOptions() ) );
	}

	getModal() {
		if ( ! this.modal ) {
			this.initModal();
		}

		return this.modal;
	}

	initModal() {
		const modalOptions = {
			className: 'elementor-templates-modal',
			closeButton: false,
			draggable: false,
			hide: {
				onOutsideClick: false,
				onEscKeyPress: false,
			},
		};

		jQuery.extend( true, modalOptions, this.getModalOptions() );

		this.modal = elementorCommon.dialogsManager.createWidget( 'lightbox', modalOptions );

		this.modal.getElements( 'message' ).append( this.modal.addElement( 'content' ), this.modal.addElement( 'loading' ) );

		if ( modalOptions.draggable ) {
			this.draggableModal();
		}
	}

	showModal() {
		this.getModal().show();
	}

	hideModal() {
		this.getModal().hide();
	}

	draggableModal() {
		const $modalWidgetContent = this.getModal().getElements( 'widgetContent' );

		$modalWidgetContent.draggable( {
			containment: 'parent',
			stop: () => {
				$modalWidgetContent.height( '' );
			},
		} );

		$modalWidgetContent.css( 'position', 'absolute' );
	}

	getModalOptions() {
		return {};
	}

	getLogoOptions() {
		return {};
	}

	getHeaderOptions() {
		return {
			closeType: 'normal',
		};
	}

	getHeaderView() {
		return this.modalHeader.currentView;
	}

	showLoadingView() {
		this.modalLoading.show( new LoadingView() );

		this.modalLoading.$el.show();

		this.modalContent.$el.hide();
	}

	hideLoadingView() {
		this.modalContent.$el.show();

		this.modalLoading.$el.hide();
	}

	showLogo() {
		this.getHeaderView().logoArea.show( new LogoView( this.getLogoOptions() ) );
	}
}
