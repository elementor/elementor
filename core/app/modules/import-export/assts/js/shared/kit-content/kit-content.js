import { useContext, useMemo } from 'react';

import { Context as ExportContext } from '../../context/export';
import { Context as ImportContext } from '../../context/import';

import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	const contextType = 'export' === props.type ? ExportContext : ImportContext,
		context = useContext( contextType );

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
