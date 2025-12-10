import * as React from 'react';
import { useState } from 'react';
import type { PropTypeKey } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { PopoverContentRefContextProvider } from '../context/variable-selection-popover.context';
import { VariableTypeProvider } from '../context/variable-type-context';
import { usePermissions } from '../hooks/use-permissions';
import { useQuotaPermissions } from '../hooks/use-quota-permissions';
import { type Variable } from '../types';
import { getVariableType } from '../variables-registry/variable-type-registry';
import { VariableCreation } from './variable-creation';
import { VariableEdit } from './variable-edit';
import { usePanelActions } from './variables-manager/variables-manager-panel';
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
	const { open } = usePanelActions();
	const onSettingsAvailable = isExperimentActive( 'e_variables_manager' )
		? () => {
				open();
		  }
		: undefined;

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
					onSettings: onSettingsAvailable,
				} ) }
			</PopoverContentRefContextProvider>
		</VariableTypeProvider>
	);
};

type ViewProps = {
	propTypeKey: string;
	currentView: View;
	selectedVariable?: Variable;
	disabled?: boolean;
	editId: string;
	setEditId: ( id: string ) => void;
	setCurrentView: ( stage: View ) => void;
	setDisabled?: ( disabled: boolean ) => void;
	closePopover: () => void;
	onSettings?: () => void;
};

type Handlers = {
	onClose: () => void;
	onGoBack?: () => void;
	onAdd?: () => void;
	onEdit?: ( key: string ) => void;
	onSettings?: () => void;
};

function RenderView( props: ViewProps ): React.ReactNode {
	const userPermissions = usePermissions();
	const userQuotaPremissions = useQuotaPermissions();

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

	if ( userPermissions.canManageSettings() && props.onSettings ) {
		handlers.onSettings = () => {
			props.closePopover();
			props.onSettings?.();
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
			<VariablesSelection
				closePopover={ handlers.onClose }
				onAdd={ handlers.onAdd }
				onEdit={ handlers.onEdit }
				onSettings={ handlers.onSettings }
				disabled={ userQuotaPremissions.canAdd() }
			/>
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
