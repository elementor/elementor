import PromptHistoryButton from './history-button';
import PromptHistoryModal from './history-modal';
import { useState } from 'react';
import { HISTORY_TYPES } from './history-types';

export const PromptHistoryContext = React.createContext( {} );

const PROMPT_HISTORY_MODAL_ID = 'prompt-history-modal';

const PromptHistory = ( { promptType, onPromptReuse, onResultEdit, setIsPromptHistoryOpen } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	const onModalOpen = () => {
		setIsPromptHistoryOpen( true );

		setTimeout( () => {
			setIsOpen( true );
		}, 250 );
	};

	const onModalClose = () => {
		setIsOpen( false );

		setTimeout( () => {
			setIsPromptHistoryOpen( false );
		}, 250 );
	};

	const closeModalAfterAction = ( action ) => ( ...data ) => {
		action( ...data );
		onModalClose();
	};

	return (
		<PromptHistoryContext.Provider value={ {
			promptType,
			onModalClose,
			onPromptReuse: closeModalAfterAction( onPromptReuse ),
			onResultEdit: onResultEdit ? closeModalAfterAction( onResultEdit ) : null,
		} }>
			<PromptHistoryButton
				isActive={ isOpen }
				onClick={ () => isOpen ? onModalClose() : onModalOpen() }
				aria-haspopup="dialog"
				aria-controls={ PROMPT_HISTORY_MODAL_ID } />

			{ isOpen && <PromptHistoryModal id={ PROMPT_HISTORY_MODAL_ID } promptType={ promptType } /> }
		</PromptHistoryContext.Provider>
	);
};

PromptHistory.propTypes = {
	promptType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
	onPromptReuse: PropTypes.func.isRequired,
	onResultEdit: PropTypes.func,
	setIsPromptHistoryOpen: PropTypes.func.isRequired,
};

export default PromptHistory;
