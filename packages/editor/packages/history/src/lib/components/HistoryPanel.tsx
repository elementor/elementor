import HistoryEmpty from './HistoryEmpty';
import HistoryListView from './HistoryListView';
import React from "react";
import { ApplyItem, Item } from "../types/Item";
import useTranslation from "../hooks/useTranslation";

type Props = {
	items: Item[],
	currentItem: number,
	applyItem: ApplyItem,
};

const HistoryPanel : React.VFC<Props> = ( props ) => {
	const { t } = useTranslation(),
		isEmpty = ( 0 === props.items.length );

	return (
		<div id="elementor-panel-history" className={ isEmpty ? 'elementor-empty' : '' }>
			<div id="elementor-history-list">
				{ isEmpty
					? <HistoryEmpty />
					: <HistoryListView
						items={ props.items }
						onItemClick={ props.applyItem }
						currentItem={ props.currentItem }
					/>
				}
			</div>

			<div className="elementor-history-revisions-message">
				{ t( 'Switch to Revisions tab for older versions' ) }
			</div>
		</div>
	);
}

export default HistoryPanel;
