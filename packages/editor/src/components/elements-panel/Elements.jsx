import {SearchResults} from "./SearchResults";
import {Categories} from "./Categories";
import {NerdBox} from "./NerdBox";

export const Elements = (props) => {
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
