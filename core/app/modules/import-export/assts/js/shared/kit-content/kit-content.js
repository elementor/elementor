import { useContext, useMemo } from 'react';

import { Context as KitContext } from '../../context/kit-context';

import Box from '../../ui/box/box';
import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	const context = useContext( KitContext );

	return useMemo( () => (
		<Box>
			<KitContentList type={props.type} dispatch={context.dispatch}/>
		</Box>
	), [] );
}

KitContent.propTypes = {
	classname: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContent.defaultProps = {
	className: '',
};
