import {Element as ElementType} from "../types";
import React from "react";
import {Element} from "./Element";

type Props = {
	elements: ElementType[],
	search: string,
}
export const SearchResults: React.VFC<Props> = (props) => {
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
