import {SearchResults} from "./SearchResults";
import {Categories} from "./Categories";
import {NerdBox} from "./NerdBox";
import {Category, Element} from "../types";
import React from "react";

type Props = {
	categories: Category[];
	elements: Element[],
	search: string,
}

export const Elements:React.VFC<Props> = (props) => {
	return (
		<div id="elementor-panel-elements-wrapper">
			<div id="elementor-panel-elements-categories">
				<div id="elementor-panel-categories">
					{
						props.search &&
						<SearchResults
							elements={props.elements}
							search={props.search}/>
					}
					{
						(!props.search) &&
						<Categories
							categories={props.categories}
							elements={props.elements}/>
					}
				</div>

				<NerdBox />
			</div>
		</div>
	);
};
