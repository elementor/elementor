import * as React from 'react';
import { EditIcon, ExpandDiagonalIcon, SearchIcon } from '@elementor/icons';
import {
	__createSlice as createSlice,
	__useDispatch as useDispatch,
	__useSelector as useSelector,
} from '@elementor/store';
import Button from '@elementor/ui/Button';
import Chip from '@elementor/ui/Chip';
import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogContentText from '@elementor/ui/DialogContentText';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogHeaderGroup from '@elementor/ui/DialogHeaderGroup';
import DialogTitle from '@elementor/ui/DialogTitle';
import IconButton from '@elementor/ui/IconButton';

export const StepsDialog = () => {
	const { open, setOpen } = useDialog();

	const handleClose = () => {
		setOpen( false );
	};

	const handleNext = () => {
		// Logic for next step goes here
	};

	const handlePrevious = () => {
		// Logic for previous step goes here
	};

	return (
		<Dialog fullScreen open={ open } onClose={ handleClose }>
			<DialogHeader onClose={ () => setOpen( false ) }></DialogHeader>
			<DialogContent dividers>
				<DialogContentText>YO</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={ handlePrevious } color="secondary">
					Previous
				</Button>
				<Button onClick={ handleNext } variant="contained">
					Next
				</Button>
			</DialogActions>
		</Dialog>
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
