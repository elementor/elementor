import * as React from 'react';
import { useState } from 'react';
import type { PropTypeKey } from '@elementor/editor-props';

import { PopoverContentRefContextProvider } from '../context/variable-selection-popover.context';
import { VariableTypeProvider } from '../context/variable-type-context';
import { usePermissions } from '../hooks/use-permissions';
import { type Variable } from '../types';
import { VariableCreation } from './variable-creation';
import { VariableEdit } from './variable-edit';
import { VariablesSelection } from './variables-selection';

const VIEW_LIST = 'list';
const VIEW_ADD = 'add';
const VIEW_EDIT = 'edit';

type View = typeof VIEW_LIST | typeof VIEW_ADD | typeof VIEW_EDIT;

type Props = {
	closePopover: () => void;
	selectedVariable?: Variable;
	propTypeKey: PropTypeKey;
};

export const VariableSelectionPopover = ( { closePopover, propTypeKey, selectedVariable }: Props ) => {
	const [ currentView, setCurrentView ] = useState< View >( VIEW_LIST );
	const [ editId, setEditId ] = useState< string >( '' );

	return (
		<VariableTypeProvider propTypeKey={ propTypeKey }>
			<PopoverContentRefContextProvider>
				{ RenderView( {
					propTypeKey,
					currentView,
					selectedVariable,
					editId,
					setEditId,
					setCurrentView,
					closePopover,
				} ) }
			</PopoverContentRefContextProvider>
		</VariableTypeProvider>
	);
};

type ViewProps = {
	propTypeKey: string;
	currentView: View;
	selectedVariable?: Variable;
	editId: string;
	setEditId: ( id: string ) => void;
	setCurrentView: ( stage: View ) => void;
	closePopover: () => void;
};

type Handlers = {
	onClose: () => void;
	onGoBack?: () => void;
	onAdd?: () => void;
	onEdit?: ( key: string ) => void;
};

function RenderView( props: ViewProps ): React.ReactNode {
	const userPermissions = usePermissions();

	const handlers: Handlers = {
		onClose: () => {
			props.closePopover();
		},
		onGoBack: () => {
			props.setCurrentView( VIEW_LIST );
		},
	};

	if ( userPermissions.canAdd() ) {
		handlers.onAdd = () => {
			props.setCurrentView( VIEW_ADD );
		};
	}

	if ( userPermissions.canEdit() ) {
		handlers.onEdit = ( key: string ) => {
			props.setEditId( key );
			props.setCurrentView( VIEW_EDIT );
		};
	}

	const handleSubmitOnEdit = () => {
		if ( props?.selectedVariable?.key === props.editId ) {
			handlers.onClose();
		} else {
			handlers.onGoBack?.();
		}
	};

	if ( VIEW_LIST === props.currentView ) {
		return (
			<VariablesSelection closePopover={ handlers.onClose } onAdd={ handlers.onAdd } onEdit={ handlers.onEdit } />
		);
	}

	if ( VIEW_ADD === props.currentView ) {
		return <VariableCreation onGoBack={ handlers.onGoBack } onClose={ handlers.onClose } />;
	}

	if ( VIEW_EDIT === props.currentView ) {
		return (
			<VariableEdit
				editId={ props.editId }
				onGoBack={ handlers.onGoBack }
				onClose={ handlers.onClose }
				onSubmit={ handleSubmitOnEdit }
			/>
		);
	}

	return null;
}
