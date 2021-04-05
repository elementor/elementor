import Header from './header';

const { useMemo } = React;

export default function IndexHeader() {
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
	], [] );

	return ( <Header buttons={ buttons }/> );
}
