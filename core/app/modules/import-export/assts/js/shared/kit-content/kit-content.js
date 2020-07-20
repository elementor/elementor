import { useContext, useMemo } from 'react';

import { Context as KitContext } from '../../context/kit-content';

import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	const context = useContext( KitContext );

	return useMemo( () => {
		return (
			<KitContentList type={ props.type } setIncludes={ context.setIncludes } />
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
