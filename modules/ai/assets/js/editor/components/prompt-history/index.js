import PromptHistoryButton from './history-button';
import PromptHistoryModal from './history-modal';
import { usePromptHistoryContext } from './context/prompt-history-context';

const PROMPT_HISTORY_MODAL_ID = 'prompt-history-modal';

const PromptHistory = () => {
	const { isOpen, isModalOpen, onOpen, onClose } = usePromptHistoryContext();

	return (
		<>
			<PromptHistoryButton
				isActive={ isOpen }
				onClick={ () => isOpen ? onClose() : onOpen() }
				aria-haspopup="dialog"
				aria-controls={ PROMPT_HISTORY_MODAL_ID } />

			{ isModalOpen && <PromptHistoryModal id={ PROMPT_HISTORY_MODAL_ID } /> }
		</>
	);
};

export default PromptHistory;
