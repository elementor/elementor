import {Panel} from "@editor/ui-panel";
import React from "react";

export const PanelEmpty: React.VFC = () => {
	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			height: '100vh',
		}}>
			<Panel>
				<div style={{
					padding: '20px',
				}}>
					Main
				</div>
			</Panel>
		</div>
	);
}
