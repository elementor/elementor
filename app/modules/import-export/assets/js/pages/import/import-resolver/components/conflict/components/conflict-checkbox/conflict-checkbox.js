import { useContext, useEffect } from 'react';

import { ImportContext } from '../../../../../../../context/import-context/import-context-provider';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function ConflictCheckbox( props ) {
	const importContext = useContext( ImportContext ),
		isSelected = () => importContext.data.overrideConditions.includes( props.id ),
		updateOverrideCondition = ( event ) => {
			const isChecked = event.target.checked,
				actionType = isChecked ? 'ADD_OVERRIDE_CONDITION' : 'REMOVE_OVERRIDE_CONDITION';
			if ( props.onCheck ) {
				props.onCheck( isChecked );
			}
			importContext.dispatch( { type: actionType, payload: props.id } );
		};

	useEffect( () => {
		if ( ! importContext.data.overrideConditions.length ) {
			importContext.dispatch( { type: 'ADD_OVERRIDE_CONDITION', payload: props.id } );
		}
	}, [] );

	return (
		<Checkbox
			checked={ isSelected() }
			onChange={ updateOverrideCondition }
			className={ props.className }
		/>
	);
}

ConflictCheckbox.propTypes = {
	className: PropTypes.string,
	id: PropTypes.number.isRequired,
	onCheck: PropTypes.func,
};

ConflictCheckbox.defaultProps = {
	className: '',
};
