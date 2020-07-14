export default function Sidebar( props ) {
	return (
		<div className="eps-app__sidebar">
			{ props.children }
		</div>
	);
}

Sidebar.propTypes = {
	children: PropTypes.object,
};
