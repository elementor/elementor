import { useNavigate } from '@reach/router';

const { useMemo } = React;

export default function useHeadersButtons( buttonsKeys, id ) {
	const navigate = useNavigate();

	const buttons = useMemo( () => ( {
		info: {
			id: 'info',
			text: __( 'Info', 'elementor-pro' ),
			hideText: true,
			icon: 'eicon-info-circle-o',
			onClick: () => {
				// TODO: Link to the info
			},
		},
		'insert-kit': {
			id: 'insert-kit',
			text: __( 'Insert Kit', 'elementor' ),
			hideText: false,
			variant: 'contained',
			color: 'primary',
			size: 'sm',
			onClick: () => navigate( '/kit-library' ),
		},
		'view-demo': {
			id: 'view-demo',
			text: __( 'View Demo', 'elementor' ),
			hideText: false,
			variant: 'outlined',
			color: 'primary',
			size: 'sm',
			onClick: () => navigate( `/kit-library/preview/${ id }` ),
		},
	} ), [ navigate, id ] );

	return useMemo( () => {
		return buttonsKeys.map( ( key ) => {
			return buttons[ key ];
		} );
	}, [ buttonsKeys ] );
}
