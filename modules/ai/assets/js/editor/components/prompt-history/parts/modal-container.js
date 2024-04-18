import { Backdrop, Box, Modal, Slide, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { usePromptHistoryContext } from '../context/prompt-history-context';

const StyledContent = styled( Box )`
  width: 360px;
  position: relative;
  margin-top: ${ ( { theme } ) => theme.spacing( 2 ) };
  margin-right: ${ ( { theme } ) => theme.spacing( 2 ) };
  background-color: ${ ( { theme } ) => theme.palette.background.paper };
  border-radius: ${ ( { theme } ) => `${ theme.shape.borderRadius }px` };
  height: ${ ( { height } ) => `calc( ${ height }px - 32px )` };

  @media screen and (max-width: 456px) {
    width: 320px;
  }

  @media screen and (max-width: 420px) {
    width: 230px;
  }
`;

const ModalContainer = ( { children, ...props } ) => {
	const { isOpen, isModalOpen, onClose, getContainerHeight, getContainer } = usePromptHistoryContext();

	return (
		<Modal
			container={ getContainer() }
			open={ isModalOpen }
			hideBackdrop={ true }
			onClose={ onClose }
			sx={ { position: 'absolute' } }
			{ ...props }>
			<Backdrop
				open={ true }
				sx={ { position: 'absolute', justifyContent: 'flex-end', alignItems: 'flex-start' } }
				aria-hidden={ false }>
				<Slide direction="left" in={ isOpen } timeout={ 500 } easing="ease-in-out">
					<StyledContent aria-label={ __( 'Prompt history modal', 'elementor' ) } height={ getContainerHeight() }>
						{ children }
					</StyledContent>
				</Slide>
			</Backdrop>
		</Modal>
	);
};

ModalContainer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	isModalOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node,
	] ),
};

export default ModalContainer;
