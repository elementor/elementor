import { useContext, useMemo } from 'react';

import { Context as KitContext } from '../../context/kit-context';

import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	const context = useContext( KitContext );

	return useMemo( () => {
		console.log( 'RE RENDER KIT CONTENT LIST' );
		return (
			<KitContentList type={ props.type } dispatch={ context.dispatch } />
		);
	}, [] );
}

KitContent.propTypes = {
	classname: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContent.defaultProps = {
	className: '',
};
