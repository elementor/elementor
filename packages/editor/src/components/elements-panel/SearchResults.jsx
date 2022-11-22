import {Element} from "./Element";

export const SearchResults = (props) => {
	return (
		<div className="elementor-panel-category-items elementor-responsive-panel">
			{props.elements
				.filter((element) => (!element.hide_on_search) && element.title.toLowerCase().includes(props.search))
				.map((element, index) => {
					return <Element key={index} {...element} />;
				})}
		</div>
	);
};
