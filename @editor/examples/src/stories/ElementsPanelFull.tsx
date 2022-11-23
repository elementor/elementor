import {Panel} from "@editor/ui-panel";
// @ts-ignore
import {ElementsPanel} from "@editor/ui-elements-panel";
import React from "react";

export const ElementsPanelFull: React.VFC = () => {
	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: '1200px',
			height: '100vh',
		}}>
			<Panel>
				<ElementsPanel

					categories={[
						{
							id: 'basic',
							name: 'Basic',
							isActive: true,
							icon: 'eicon-editor-list-ul'
						}
					]}
					elements={[
						{
							title: 'Text',
							icon: 'eicon-text',
							elType: 'widget',
							widgetType: 'text',
							categories: ['basic'],
						}]}
				/>
			</Panel>
		</div>
	);
}
