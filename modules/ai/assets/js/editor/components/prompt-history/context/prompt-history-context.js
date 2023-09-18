import { createContext, useContext } from 'react';
import { HISTORY_TYPES } from '../history-types';

export const PromptHistoryContext = createContext( {} );

export const PromptHistoryProvider = ( { promptType, state, children } ) => {
	const { isPromptHistoryOpen, setIsPromptHistoryOpen } = state;

	return (
		<PromptHistoryContext.Provider value={ { promptType, isPromptHistoryOpen, setIsPromptHistoryOpen } }>
			{ children }
		</PromptHistoryContext.Provider>
	);
};

PromptHistoryProvider.propTypes = {
	promptType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
	state: PropTypes.object.isRequired,
	children: PropTypes.node,
};

export const usePromptHistoryContext = () => {
	const { promptType, isPromptHistoryOpen, setIsPromptHistoryOpen } = useContext( PromptHistoryContext );

	const onOpen = () => {
		setIsPromptHistoryOpen( true );
	};

	const onClose = () => {
		setIsPromptHistoryOpen( false );
	};

	return {
		promptType,
		isOpen: isPromptHistoryOpen,
		onOpen,
		onClose,
	};
};
