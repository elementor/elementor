import { useContext, useMemo, useEffect } from 'react';

import { Context } from '../../../../../../../context/export/export-context';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function KitContentCheckbox( props ) {
	const exportContext = useContext( Context ),
		isSelected = () => exportContext.data.includes.includes( props.type ),
		setIncludes = ( event ) => {
			const isChecked = event.target.checked,
				actionType = isChecked ? 'ADD_INCLUDE' : 'REMOVE_INCLUDE';

			exportContext.dispatch( { type: actionType, payload: props.type } );
		};

	useEffect( () => {
		exportContext.dispatch( { type: 'ADD_INCLUDE', payload: props.type } );
	}, [] );

	return useMemo( () => (
		<Checkbox checked={ isSelected() } onChange={ setIncludes } className={ props.className } />
	), [ exportContext.data.includes ] );
}

KitContentCheckbox.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContentCheckbox.defaultProps = {
	className: '',
};
