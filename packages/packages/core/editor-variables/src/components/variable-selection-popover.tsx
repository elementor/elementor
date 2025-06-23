import * as React from 'react';
import { useRef, useState } from 'react';
import { Box } from '@elementor/ui';

import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { type Variable } from '../types';
import { ColorVariableCreation } from './color-variable-creation';
import { ColorVariableEdit } from './color-variable-edit';
import { ColorVariablesSelection } from './color-variables-selection';
import { FontVariableCreation } from './font-variable-creation';
import { FontVariableEdit } from './font-variable-edit';
import { FontVariablesSelection } from './font-variables-selection';
import { PopoverContentRefContext } from './variable-selection-popover.context';

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
	const editIdRef = useRef< string >( '' );
	const anchorRef = useRef< HTMLDivElement >( null );

	return (
		<PopoverContentRefContext.Provider value={ anchorRef }>
			<Box ref={ anchorRef }>
				{ renderStage( {
					propTypeKey,
					currentView,
					selectedVariable,
					editIdRef,
					setCurrentView,
					closePopover,
				} ) }
			</Box>
		</PopoverContentRefContext.Provider>
	);
};

type StageProps = {
	propTypeKey: string;
	currentView: View;
	selectedVariable?: Variable;
	editIdRef: React.MutableRefObject< string >;
	setCurrentView: ( stage: View ) => void;
	closePopover: () => void;
};

function renderStage( props: StageProps ): React.ReactNode {
	const handleSubmitOnEdit = () => {
		if ( props?.selectedVariable?.key === props.editIdRef.current ) {
			props.closePopover();
		} else {
			props.setCurrentView( VIEW_LIST );
		}
	};

	if ( fontVariablePropTypeUtil.key === props.propTypeKey ) {
		if ( VIEW_LIST === props.currentView ) {
			return (
				<FontVariablesSelection
					closePopover={ props.closePopover }
					onAdd={ () => {
						props.setCurrentView( VIEW_ADD );
					} }
					onEdit={ ( key ) => {
						props.editIdRef.current = key;
						props.setCurrentView( VIEW_EDIT );
					} }
				/>
			);
		}

		if ( VIEW_ADD === props.currentView ) {
			return (
				<FontVariableCreation
					onGoBack={ () => props.setCurrentView( VIEW_LIST ) }
					onClose={ props.closePopover }
				/>
			);
		}

		if ( VIEW_EDIT === props.currentView ) {
			return (
				<FontVariableEdit
					editId={ props.editIdRef.current ?? '' }
					onGoBack={ () => props.setCurrentView( VIEW_LIST ) }
					onClose={ props.closePopover }
					onSubmit={ handleSubmitOnEdit }
				/>
			);
		}
	}

	if ( colorVariablePropTypeUtil.key === props.propTypeKey ) {
		if ( VIEW_LIST === props.currentView ) {
			return (
				<ColorVariablesSelection
					closePopover={ props.closePopover }
					onAdd={ () => {
						props.setCurrentView( VIEW_ADD );
					} }
					onEdit={ ( key ) => {
						props.editIdRef.current = key;
						props.setCurrentView( VIEW_EDIT );
					} }
				/>
			);
		}

		if ( VIEW_ADD === props.currentView ) {
			return (
				<ColorVariableCreation
					onGoBack={ () => props.setCurrentView( VIEW_LIST ) }
					onClose={ props.closePopover }
				/>
			);
		}

		if ( VIEW_EDIT === props.currentView ) {
			return (
				<ColorVariableEdit
					editId={ props.editIdRef.current ?? '' }
					onGoBack={ () => props.setCurrentView( VIEW_LIST ) }
					onClose={ props.closePopover }
					onSubmit={ handleSubmitOnEdit }
				/>
			);
		}
	}

	return null;
}
