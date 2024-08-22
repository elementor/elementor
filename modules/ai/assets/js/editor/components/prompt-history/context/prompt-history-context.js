import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { HISTORY_TYPES } from '../history-types';
import { vh } from '../../../helpers';

export const PromptHistoryContext = createContext( {} );

const DIALOG_CONTAINER_SELECTOR = '.e-ai-dialog-content';

const getContainer = () => {
	return document.querySelector( DIALOG_CONTAINER_SELECTOR );
};

const getContainerHeight = () => {
	const contentContainer = document.querySelector( DIALOG_CONTAINER_SELECTOR );
	return contentContainer?.clientHeight;
};

const getContentHeight = () => {
	const contentContainer = document.querySelector( DIALOG_CONTAINER_SELECTOR );
	return contentContainer.children[ 0 ].clientHeight + 50;
};

const setContentHeight = ( height ) => {
	const contentContainer = document.querySelector( DIALOG_CONTAINER_SELECTOR );

	if ( 'auto' === height ) {
		contentContainer.style.height = 'auto';
		return;
	}

	contentContainer.style.height = `${ height }px`;
};

export const PromptHistoryProvider = ( { historyType, children } ) => {
	const showHistoryState = useState( false );

	return (
		<PromptHistoryContext.Provider value={ { historyType, showHistoryState } }>
			{ children }
		</PromptHistoryContext.Provider>
	);
};

PromptHistoryProvider.propTypes = {
	historyType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
	children: PropTypes.node,
};

export const usePromptHistoryContext = () => {
	const { historyType, showHistoryState } = useContext( PromptHistoryContext );
	const [ showHistory, setShowHistory ] = showHistoryState;

	const [ showModalWrapper, setShowModalWrapper ] = useState( false );
	const [ showPromptHistory, setShowPromptHistory ] = useState( false );

	const handleFullScreenHistoryState = () => {
		if ( showHistory ) {
			setShowModalWrapper( true );
			setTimeout( () => setShowPromptHistory( true ), 200 );

			return;
		}

		setShowPromptHistory( false );
		setTimeout( () => setShowModalWrapper( false ), 500 );
	};

	const handleDefaultHistoryState = () => {
		if ( showHistory ) {
			const currentHeight = getContentHeight();

			// Set initial state
			setContentHeight( currentHeight );

			setTimeout( () => {
				if ( currentHeight < vh( 61 ) ) {
					setContentHeight( vh( 61 ) );

					setTimeout( () => setShowModalWrapper( true ), 200 );
					setTimeout( () => setShowPromptHistory( true ), 300 );

					return;
				}

				setShowModalWrapper( true );
				setShowPromptHistory( true );
			}, 20 );

			return;
		}

		setShowPromptHistory( false );

		setTimeout( () => {
			setShowModalWrapper( false );
			setContentHeight( getContentHeight() );

			setTimeout( () => setContentHeight( 'auto' ), 300 );
		}, 500 );
	};

	useEffect( () => {
		if ( showHistory === showModalWrapper && showHistory === showPromptHistory ) {
			return;
		}

		if ( historyType === HISTORY_TYPES.IMAGE ) {
			return handleFullScreenHistoryState();
		}

		handleDefaultHistoryState();
	}, [ showHistory ] );

	const onOpen = () => {
		setShowHistory( true );
	};

	const onClose = () => {
		setShowHistory( false );
	};

	return {
		historyType,
		isOpen: showPromptHistory,
		isModalOpen: showModalWrapper,
		showHistory,
		onOpen,
		onClose,
		getContainer,
		getContainerHeight,
	};
};
