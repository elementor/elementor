import * as React from 'react';
import { createContext, useContext } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import {
	__createSlice as createSlice,
	__useDispatch as useDispatch,
	__useSelector as useSelector,
} from '@elementor/store';
import { Box, DialogHeader, Stack, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import Dialog from '@elementor/ui/Dialog';
import DialogContent from '@elementor/ui/DialogContent';

import { type Suggestions, useSuggestions } from '../hooks/use-suggestions';
import { ClassesSteps } from './classes-steps';
import { VariablesSteps } from './variables-steps';

export const StepsDialog = () => {
	const { open, setOpen } = useDialog();

	const handleClose = () => {
		setOpen( false );
	};

	return (
		<ThemeProvider>
			<Dialog fullWidth maxWidth="lg" open={ open } onClose={ handleClose }>
				<Provider>
					<DialogTabs />
				</Provider>
			</Dialog>
		</ThemeProvider>
	);
};

const context = createContext< null | {
	isLoading: boolean;
	variables: Suggestions[ 'variables' ];
	classes: Suggestions[ 'classes' ];
} >( null );

export const useStylesMigrationContext = () => {
	const stylesMigrationContext = useContext( context );

	if ( ! stylesMigrationContext ) {
		throw new Error( 'useStylesMigrationContext must be used within a Provider' );
	}

	return stylesMigrationContext;
};

export const Provider = ( { children }: React.PropsWithChildren ) => {
	const { isLoading, data } = useSuggestions();

	const { variables = {} as Suggestions[ 'variables' ], classes = [] } = data || {};

	return <context.Provider value={ { isLoading, variables, classes } }>{ children }</context.Provider>;
};

type TabValue = 'variables' | 'classes';

const DialogTabs = () => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< TabValue >( 'variables' );

	console.log( 'DialogTabs rendered', getTabPanelProps( 'variables' ), getTabPanelProps( 'classes' ) );

	const variablesPanelStyles = {
		flexGrow: 1,
		p: 0,
		...( getTabPanelProps( 'variables' ).hidden === false && { display: 'flex' } ),
	};

	const classesPanelStyles = {
		flexGrow: 1,
		p: 0,
		...( getTabPanelProps( 'classes' ).hidden === false && { display: 'flex' } ),
	};

	return (
		<Stack sx={ { width: '100%', height: '100%' } }>
			<DialogHeader
				logo={ () => <></> }
				direction="row"
				justifyContent="center"
				sx={ { borderBottom: 1, borderColor: 'divider', maxWidth: '200px', margin: 'auto' } }
			>
				<Tabs { ...getTabsProps() }>
					<Tab label="Variables" { ...getTabProps( 'variables' ) } />
					<Tab label="Classes" { ...getTabProps( 'classes' ) } />
				</Tabs>
			</DialogHeader>
			<DialogContent
				dividers
				sx={ { height: '600px', display: 'flex', flexDirection: 'column', flexGrow: 1, p: 0 } }
			>
				<TabPanel
					size={ 'small' }
					{ ...getTabPanelProps( 'variables' ) }
					sx={ {
						flexGrow: 1,
						p: 0,
						...( getTabPanelProps( 'variables' ).hidden === false && { display: 'flex' } ),
					} }
				>
					<VariablesSteps />
				</TabPanel>
				<TabPanel
					size={ 'small' }
					{ ...getTabPanelProps( 'classes' ) }
					sx={ {
						flexGrow: 1,
						p: 0,
						...( getTabPanelProps( 'classes' ).hidden === false && { display: 'flex' } ),
					} }
				>
					<ClassesSteps />
				</TabPanel>
			</DialogContent>
		</Stack>
	);
};

export const slice = createSlice( {
	name: 'styles-migration-dialog',
	initialState: {
		open: false,
	},
	reducers: {
		setOpen: ( state, action ) => {
			state.open = action.payload;
		},
		reset: () => ( { open: false } ),
	},
} );

type State = {
	[ sliceName: string ]: {
		open: boolean;
	};
};

export const useDialog = () => {
	const dispatch = useDispatch();

	const open = useSelector( ( state: State ) => state[ slice.name ].open );

	const setOpen = ( value: boolean ) => {
		dispatch( slice.actions.setOpen( value ) );
	};

	return {
		open,
		setOpen,
	};
};
