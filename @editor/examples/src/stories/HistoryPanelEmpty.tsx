import {Panel} from "@editor/ui-panel";
import {HistoryPanel} from "@editor/ui-history-panel";

export const HistoryPanelEmpty = () => {
	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: '400px',
			height: '100vh',
		}}>
			<Panel>
				<HistoryPanel items={ [] } currentItem={ 0 } />
			</Panel>
		</div>
	);
}
