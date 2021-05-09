export default function BarButton( props ) {
	return (
		<button className="top-bar-button-wrapper" onClick={props.onClick}>
			<i className={props.icon}></i>
			<h1 className="top-bar-button-title">{ props.children }</h1>
		</button>
	);
}

BarButton.propTypes = {
	children: PropTypes.any,
	icon: PropTypes.any,
	onClick: PropTypes.func,
};
