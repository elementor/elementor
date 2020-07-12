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
	closeRef = React.createRef();

	closeModal = ( e ) => {
		const { modalProps } = this.props;
		const node = this.modalRef.current,
			closeNode = this.closeRef.current,
			isInCloseNode = closeNode && closeNode.contains( e.target );
		// ignore if click is inside the modal
		if ( node && node.contains( e.target ) && ! isInCloseNode ) {
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
			<div className="modal-overlay">
				<div className="modal" ref={ this.modalRef }>
					<div className="modal-close-wrapper" ref={ this.closeRef }>
						<Button text={ __( 'Close', 'elementor' ) } icon="eicon eicon-close" onClick={ this.closeModal } />
					</div>
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
