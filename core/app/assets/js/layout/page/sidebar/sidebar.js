import './sidebar.scss';

export default function Sidebar( props ) {
	return (
		<div className="e-app__sidebar">
			{ props.children }
		</div>
	);
}

Sidebar.propTypes = {
	children: PropTypes.object,
};
