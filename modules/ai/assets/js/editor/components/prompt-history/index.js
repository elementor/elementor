import PromptHistoryButton from './history-button';
import PromptHistoryModal from './history-modal';
import { useState } from 'react';
import { HISTORY_TYPES } from './history-types';

export const PromptHistoryContext = React.createContext( {} );

const PROMPT_HISTORY_MODAL_ID = 'prompt-history-modal';

const PromptHistory = ( { promptType, onPromptReuse, onResultEdit, onImagesRestore, setIsPromptHistoryOpen } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	const onModalOpen = () => {
		if ( setIsPromptHistoryOpen ) {
			setIsPromptHistoryOpen( true );
		}

		setTimeout( () => {
			setIsOpen( true );
		}, 250 );
	};

	const onModalClose = () => {
		setIsOpen( false );

		if ( setIsPromptHistoryOpen ) {
			setTimeout( () => {
				setIsPromptHistoryOpen( false );
			}, 250 );
		}
	};

	const closeModalAfterAction = ( action ) => ( ...data ) => {
		action( ...data );
		onModalClose();
	};

	return (
		<PromptHistoryContext.Provider value={ {
			promptType,
			onModalClose,
			onPromptReuse: onPromptReuse ? closeModalAfterAction( onPromptReuse ) : null,
			onResultEdit: onResultEdit ? closeModalAfterAction( onResultEdit ) : null,
			onImagesRestore: onImagesRestore ? closeModalAfterAction( onImagesRestore ) : null,
		} }>
			<PromptHistoryButton
				isActive={ isOpen }
				onClick={ () => isOpen ? onModalClose() : onModalOpen() }
				aria-haspopup="dialog"
				aria-controls={ PROMPT_HISTORY_MODAL_ID } />

			{ isOpen && <PromptHistoryModal id={ PROMPT_HISTORY_MODAL_ID } /> }
		</PromptHistoryContext.Provider>
	);
};

PromptHistory.propTypes = {
	promptType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
	onPromptReuse: PropTypes.func,
	onResultEdit: PropTypes.func,
	onImagesRestore: PropTypes.func,
	setIsPromptHistoryOpen: PropTypes.func,
};

export default PromptHistory;
