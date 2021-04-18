import Header from './layout/header';
import { useMemo } from 'react';

import './index-header.scss';

export default function IndexHeader( props ) {
	const buttons = useMemo( () => [
		{
			id: 'info',
			text: __( 'Info', 'elementor-pro' ),
			hideText: true,
			icon: 'eicon-info-circle-o',
			onClick: () => {
				// TODO: Open info modal.
			},
		},
		{
			id: 'refetch',
			text: __( 'Refetch', 'elementor-pro' ),
			hideText: true,
			icon: `eicon-sync ${ props.isFetching ? 'eicon-animation-spin' : '' }`,
			onClick: props.refetch,
		},
	], [ props.isFetching, props.refetch ] );

	return ( <Header buttons={ buttons }/> );
}

IndexHeader.propTypes = {
	refetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
};
