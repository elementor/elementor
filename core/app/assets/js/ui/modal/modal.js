import Button from 'elementor-app/ui/molecules/button';

import './modal.scss';

export default class ModalProvider extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			hideModal: this.hideModal,
			show: false,
			showModal: this.showModal,
		};
	}

	hideModal = () => {
		this.setState( {
			show: false,
		} );
	};

	showModal = () => {
		this.setState( {
			show: true,
		} );
	};

	render() {
		return (
			<>
				<Button { ... this.props.toggleButtonProps } onClick={ this.state.showModal } />
				<Modal modalProps={this.state}>
					{ this.props.children }
				</Modal>
			</>
		);
	}
}

ModalProvider.propTypes = {
	children: PropTypes.node.isRequired,
	toggleButtonProps: PropTypes.object.isRequired,
};

class Modal extends React.Component {
	modalRef = React.createRef();

	closeModal = ( e ) => {
		const { modalProps } = this.props;
		const node = this.modalRef.current;
		// ignore if click is inside the modal
		if ( node && node.contains( e.target ) ) {
			return;
		}

		modalProps.hideModal();
	};

	componentDidMount() {
		document.addEventListener( 'mousedown', this.closeModal, false );
	}

	componentWillUnmount() {
		document.removeEventListener( 'mousedown', this.closeModal, false );
	}

	render() {
		const { modalProps, children } = this.props;
		return modalProps.show ? (
			<div className="modal-overlay" ref={this.modalRef}>
				<div className="modal">
					{children}
				</div>
			</div>
		) : null;
	}
}

Modal.propTypes = {
	modalProps: PropTypes.object.isRequired,
	children: PropTypes.any.isRequired,
};
