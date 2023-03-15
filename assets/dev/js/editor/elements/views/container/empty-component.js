/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
export default function EmptyComponent() {
	return (
		<div className="elementor-first-add">
			<div className="elementor-icon eicon-plus" onClick={ () => $e.route( 'panel/elements/categories' ) } />
		</div>
	);
}
