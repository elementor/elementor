import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { HISTORY_TYPES } from '../history-types';
import { usePromptHistoryContext } from './prompt-history-context';

export const PromptHistoryActionContext = createContext( {} );

const initialActionValue = {
	type: '',
	id: '',
	data: null,
};

export const ACTION_TYPES = Object.freeze( {
	REUSE: 'reuse',
	EDIT: 'edit',
	RESTORE: 'restore',
	REMOVE: 'remove',
} );

const ENABLED_ACTIONS_BY_TYPE = {
	[ HISTORY_TYPES.TEXT ]: {
		[ ACTION_TYPES.REUSE ]: true,
		[ ACTION_TYPES.EDIT ]: true,
		[ ACTION_TYPES.REMOVE ]: true,
	},
	[ HISTORY_TYPES.CODE ]: {
		[ ACTION_TYPES.REUSE ]: true,
		[ ACTION_TYPES.REMOVE ]: true,
	},
	[ HISTORY_TYPES.IMAGE ]: {
		[ ACTION_TYPES.RESTORE ]: true,
		[ ACTION_TYPES.REMOVE ]: true,
	},
};

export const PromptHistoryActionProvider = ( { children } ) => {
	const [ state, dispatch ] = useState( initialActionValue );

	return (
		<PromptHistoryActionContext.Provider value={ { state, dispatch } }>
			{ children }
		</PromptHistoryActionContext.Provider>
	);
};

PromptHistoryActionProvider.propTypes = {
	children: PropTypes.node,
};

export const usePromptHistoryAction = () => {
	const { state, dispatch } = useContext( PromptHistoryActionContext );
	const { historyType, onClose } = usePromptHistoryContext();

	const closeModalAfterAction = ( action ) => ( ...data ) => {
		action( ...data );
		onClose();
	};

	const getAllowedActions = () => ENABLED_ACTIONS_BY_TYPE[ historyType ] || {};

	const onPromptReuse = ( id, data ) => dispatch( { type: ACTION_TYPES.REUSE, id, data } );
	const onResultEdit = ( id, data ) => dispatch( { type: ACTION_TYPES.EDIT, id, data } );
	const onImagesRestore = ( id, data ) => dispatch( { type: ACTION_TYPES.RESTORE, id, data } );

	return {
		promptHistoryAction: state,
		onPromptReuse: closeModalAfterAction( onPromptReuse ),
		onResultEdit: closeModalAfterAction( onResultEdit ),
		onImagesRestore: closeModalAfterAction( onImagesRestore ),
		getAllowedActions,
	};
};

/**
 *
 * @param {{type: string, handler: Function}[]} actions
 */
export const useSubscribeOnPromptHistoryAction = ( actions ) => {
	const { state } = useContext( PromptHistoryActionContext );

	useEffect( () => {
		if ( ! state.type ) {
			return;
		}

		for ( const action of actions ) {
			if ( state.type === action?.type ) {
				action?.handler( state );
			}
		}
	}, [ state ] );
};
