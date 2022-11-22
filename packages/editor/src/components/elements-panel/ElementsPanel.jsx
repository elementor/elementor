import {GlobalElements} from './GlobalElements';
import {Elements} from './Elements';
import {useState} from "react";

export const ElementsPanel = (props ) => {
	const [route, setRoute] = useState('local');
	const [search, setSearch] = useState('');

	return (
		<div id="elementor-panel-page-elements">
			<div id="elementor-panel-elements-navigation" className="elementor-panel-navigation">
				<div
					className={`elementor-component-tab elementor-panel-navigation-tab ${'local' === route ? 'elementor-active' : ''}`}
					data-tab="categories" onClick={() => setRoute('local')}>
					Elements
				</div>
				<div
					className={`elementor-component-tab elementor-panel-navigation-tab ${'global' === route ? 'elementor-active' : ''}`}
					data-tab="global" onClick={() => setRoute('global')}>
					Global
				</div>
			</div>
			<div id="elementor-panel-elements-search-area">
				<div id="elementor-panel-elements-search-wrapper">
					<label htmlFor="elementor-panel-elements-search-input" className="screen-reader-text">
						Search Widget:
					</label>
					<input
						type="search"
						id="elementor-panel-elements-search-input"
						value={search}
						placeholder="Search Widget..."
						autoComplete="off"
						onInput={(e) => setSearch(e.target.value)}
					/>
					<i className="eicon-search-bold" aria-hidden="true"></i>
				</div>
			</div>

			{
				('local' === route) &&
				<Elements
					route="local"
					search={search}
					elements={props.elements}
					categories={props.categories}

				/>}
			{('global' === route) && <GlobalElements route="global"/>}
		</div>
	);
};
