import { useContext, useMemo, useEffect } from 'react';

import { SharedContext } from '../../../../context/shared-context/shared-context-provider';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function KitContentCheckbox( props ) {
	const sharedContext = useContext( SharedContext ),
		isSelected = () => sharedContext.data.includes.includes( props.type ),
		setIncludes = ( event ) => {
			const isChecked = event.target.checked,
				actionType = isChecked ? 'ADD_INCLUDE' : 'REMOVE_INCLUDE';
				props.onCheck?.( event, props.type );

			sharedContext.dispatch( { type: actionType, payload: props.type } );
		};

	useEffect( () => {
		if ( ! sharedContext.data.includes.length ) {
			sharedContext.dispatch( { type: 'ADD_INCLUDE', payload: props.type } );
		}
	}, [] );

	return useMemo( () => (
		<Checkbox checked={ isSelected() } onChange={ setIncludes } className={ props.className } />
	), [ sharedContext.data.includes ] );
}

KitContentCheckbox.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContentCheckbox.defaultProps = {
	className: '',
};
