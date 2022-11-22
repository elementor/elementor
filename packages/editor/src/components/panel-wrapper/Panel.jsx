/* global $e */
import {useState} from "react";
import {SwitchMode} from "./SwitchMode";
import {Loading} from "./Loading";
import {Header} from "./Header";
import {Main} from "./Main";

export const Panel = (props) => {
	const [useOldPanel, setUseOldPanel] = useState(false);

	return (
		<div id="e-panel" className="elementor-panel">
			{
				<div id="elementor-panel-inner" style={{
					display: useOldPanel ? 'none' : 'block',
				}}>
					<SwitchMode/>
					<Loading/>
					<Header setUseOldPanel={setUseOldPanel}/>
					<Main>
						{props.children}
					</Main>
				</div>
			}
			{
				<div id="elementor-panel" style={{
					display: useOldPanel ? 'block' : 'none',
					zIndex: 99,
					position: 'absolute',
					top: 0,
					left: 0,
					height: '100vh',
					width: '300px',
				}}></div>
			}
		</div>
	);
}
