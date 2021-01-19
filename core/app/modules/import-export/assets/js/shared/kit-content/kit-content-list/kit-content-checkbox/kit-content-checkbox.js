import { useContext, useMemo } from 'react';

import { Context as KitContext } from '../../../../context/kit-context';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function KitContentCheckbox( props ) {
	const context = useContext( KitContext ),
		isSelected = () => context.kitContent.includes.includes( props.type ),
		setIncludes = ( event ) => {
			const isChecked = event.target.checked,
				actionType = isChecked ? 'ADD_INCLUDE' : 'REMOVE_INCLUDE';

			context.dispatch( { type: actionType, value: props.type } );
		};

	console.log( '--- RENDER: KitContentCheckbox() 222' );

	return useMemo( () => (
		<Checkbox checked={ isSelected() } onChange={ setIncludes } className={ props.className } />
	), [ context.kitContent.includes ] );
}

KitContentCheckbox.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContentCheckbox.defaultProps = {
	className: '',
};
