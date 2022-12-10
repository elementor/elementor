import Page from 'elementor-app/layout/page';

export default function NotFound() {
	const config = {
		title: __( 'Not Found', 'elementor' ),
		className: 'eps-app__not-found',
		content: <h1> { __( 'Not Found', 'elementor' ) } </h1>,
		sidebar: <></>,
	};

	return (
		<Page { ...config } />
	);
}
