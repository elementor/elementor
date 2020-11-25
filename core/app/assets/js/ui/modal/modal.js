import Button from 'elementor-app/ui/molecules/button';
import Grid from 'elementor-app/ui/grid/grid';
import Icon from 'elementor-app/ui/atoms/icon';
import Text from 'elementor-app/ui/atoms/text';

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
				<Modal modalProps={this.state} { ... this.props }>
					{ this.props.children }
				</Modal>
			</>
		);
	}
}

ModalProvider.propTypes = {
	children: PropTypes.node.isRequired,
	toggleButtonProps: PropTypes.object.isRequired,
	title: PropTypes.string,
	icon: PropTypes.string,
};

export class Modal extends React.Component {
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
		const { modalProps, children, icon } = this.props;
		return modalProps.show ? (
			<div className="eps-modal__overlay" onClick={ this.closeModal }>
				<div className="eps-modal" ref={ this.modalRef } >
					<Grid container className="eps-modal__header" justify="space-between" alignItems="center">
						<Grid item>
							<Icon className={`eps-modal__icon ${ icon }`} />
							<Text className="title" tag="span">{ this.props.title }</Text>
						</Grid>
						<Grid item>
							<div className="eps-modal__close-wrapper" ref={ this.closeRef }>
								<Button text={ __( 'Close', 'elementor' ) } hideText icon="eicon-close" onClick={ this.closeModal } />
							</div>
						</Grid>
					</Grid>
					<div className="eps-modal__body">
						{children}
					</div>
				</div>
			</div>
		) : null;
	}
}

Modal.propTypes = {
	modalProps: PropTypes.object.isRequired,
	children: PropTypes.any.isRequired,
	title: PropTypes.string.isRequired,
	icon: PropTypes.string,
};
