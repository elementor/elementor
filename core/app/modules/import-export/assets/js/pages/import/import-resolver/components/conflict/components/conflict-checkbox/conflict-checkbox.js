import { useContext, useEffect } from 'react';

import { ImportContext } from '../../../../../../../context/import-context/import-context-provider';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function ConflictCheckbox( props ) {
	const importContext = useContext( ImportContext ),
		{ referrer } = importContext.data,
		isSelected = () => importContext.data.overrideConditions.includes( props.id ),
		updateOverrideCondition = ( event ) => {
			const isChecked = event.target.checked,
				actionType = isChecked ? 'ADD_OVERRIDE_CONDITION' : 'REMOVE_OVERRIDE_CONDITION';
			if ( 'kit-library' === referrer ) {
				elementorCommon.events.eventTracking(
					'kit-library/choose-to-import-conflicting-parts-and-replace-existing',
					{
						placement: 'kit library',
						event: 'kit parts conflict',
					},
					{
						source: 'import',
						step: '3',
						action: event.target.checked ? 'check' : 'uncheck',
						site_part: props.title,
					},
				)
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
};

ConflictCheckbox.defaultProps = {
	className: '',
};
