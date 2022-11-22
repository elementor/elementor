import {useState} from "react";
import {Element} from "./Element";
import {EmptyCategory} from "./EmptyCategory";

export const Category = (props) => {
	const [isActive, setIsActive] = useState(props.isActive && !! props.elements.length),
		activeClass = isActive ? 'elementor-active' : '';

	if ( ! props.elements.length && props.hideIfEmpty !== false ) {
		return null;
	}

	let elements = props.elements;

	// eslint-disable-next-line default-case
	switch ( props.sort ) {
		case 'a-z':
			elements = elements.sort( ( a, b ) => a.title > b.title ? 1 : -1 );
			break;
	}

	const hasElements = !! elements.length && props.hideIfEmpty !== false;

	return (
		<div
			id={`elementor-panel-category-${props.id}`}
			className={`elementor-panel-category ${activeClass}`}
			style={{userSelect: 'none'}}
		>
			<div
				className="elementor-panel-category-title"
				onClick={() => {
					setIsActive(!isActive);
				}}
			>
				{props.title}
			</div>

			{isActive && <div className="elementor-panel-category-items elementor-responsive-panel">
				{
					hasElements && Object.values(elements)
						.filter((element) => element.show_in_panel)
						.map((element, index) => {
							return <Element key={index} {...element} />;
						})
				}
				{
					! hasElements && <EmptyCategory />
				}
			</div>}
		</div>);
};
