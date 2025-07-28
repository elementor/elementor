import * as React from 'react';
import { useState } from 'react';

import { usePermissions } from '../hooks/use-permissions';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { type Variable } from '../types';
import { ColorVariableCreation } from './color-variable-creation';
import { ColorVariableEdit } from './color-variable-edit';
import { ColorVariablesSelection } from './color-variables-selection';
import { FontVariableCreation } from './font-variable-creation';
import { FontVariableEdit } from './font-variable-edit';
import { FontVariablesSelection } from './font-variables-selection';
import { PopoverContentRefContextProvider } from './variable-selection-popover.context';

const VIEW_LIST = 'list';
const VIEW_ADD = 'add';
const VIEW_EDIT = 'edit';

type View = typeof VIEW_LIST | typeof VIEW_ADD | typeof VIEW_EDIT;

type Props = {
	closePopover: () => void;
	propTypeKey: string;
	selectedVariable?: Variable;
};

export const VariableSelectionPopover = ( { closePopover, propTypeKey, selectedVariable }: Props ) => {
	const [ currentView, setCurrentView ] = useState< View >( VIEW_LIST );
	const [ editId, setEditId ] = useState< string >( '' );

	return (
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

	if ( fontVariablePropTypeUtil.key === props.propTypeKey ) {
		if ( VIEW_LIST === props.currentView ) {
			return (
				<FontVariablesSelection
					closePopover={ handlers.onClose }
					onAdd={ handlers.onAdd }
					onEdit={ handlers.onEdit }
				/>
			);
		}

		if ( VIEW_ADD === props.currentView ) {
			return <FontVariableCreation onGoBack={ handlers.onGoBack } onClose={ handlers.onClose } />;
		}

		if ( VIEW_EDIT === props.currentView ) {
			return (
				<FontVariableEdit
					editId={ props.editId }
					onGoBack={ handlers.onGoBack }
					onClose={ handlers.onClose }
					onSubmit={ handleSubmitOnEdit }
				/>
			);
		}
	}

	if ( colorVariablePropTypeUtil.key === props.propTypeKey ) {
		if ( VIEW_LIST === props.currentView ) {
			return (
				<ColorVariablesSelection
					closePopover={ handlers.onClose }
					onAdd={ handlers.onAdd }
					onEdit={ handlers.onEdit }
				/>
			);
		}

		if ( VIEW_ADD === props.currentView ) {
			return <ColorVariableCreation onGoBack={ handlers.onGoBack } onClose={ handlers.onClose } />;
		}

		if ( VIEW_EDIT === props.currentView ) {
			return (
				<ColorVariableEdit
					editId={ props.editId }
					onGoBack={ handlers.onGoBack }
					onClose={ handlers.onClose }
					onSubmit={ handleSubmitOnEdit }
				/>
			);
		}
	}

	return null;
}
