export const Element = (props) => {
	return (
		<div className="elementor-element-wrapper">
			<div className="elementor-element" draggable="true" data-name={props.name}>
				<div className="icon">
					<i className={props.icon} aria-hidden="true"></i>
				</div>
				<div className="elementor-element-title-wrapper">
					<div className="title">{props.title}</div>
				</div>
			</div>
		</div>
	);
};
