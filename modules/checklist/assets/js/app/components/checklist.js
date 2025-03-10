import Header from './header';
import CheckListWrapper from './checklist-wrapper';
import { useEffect, useState } from 'react';
import { Paper } from '@elementor/ui';
import { USER_PROGRESS } from '../../utils/consts';
import { updateUserProgress } from '../../utils/functions';

const { IS_POPUP_MINIMIZED } = USER_PROGRESS;

const Checklist = ( props ) => {
	const [ steps, setSteps ] = useState( props.steps ),
		[ isMinimized, setIsMinimized ] = useState( !! props.userProgress[ IS_POPUP_MINIMIZED ] );

	const toggleIsMinimized = async () => {
		const currState = isMinimized;

		try {
			setIsMinimized( ! currState );

			await updateUserProgress( { [ IS_POPUP_MINIMIZED ]: ! currState } );
		} catch ( e ) {
			setIsMinimized( currState );
		}
	};

	useEffect( () => {
		setSteps( props.steps );
	}, [ props.steps ] );

	return (
		<Paper elevation={ 5 } sx={ {
			position: 'fixed',
			width: '360px',
			bottom: '40px',
			insetInlineEnd: '40px',
			zIndex: '99999',
			hidden: true,
			maxHeight: '645px',
			overflowY: 'auto',
		} }>
			<Header steps={ steps } isMinimized={ isMinimized } toggleIsMinimized={ toggleIsMinimized } />
			<CheckListWrapper steps={ steps } setSteps={ setSteps } isMinimized={ isMinimized } />
		</Paper>
	);
};

Checklist.propTypes = {
	steps: PropTypes.array.isRequired,
	userProgress: PropTypes.object.isRequired,
};

export default Checklist;
