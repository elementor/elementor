import React from "react";
import {Header} from "./Header";
import {Main} from "./Main";
import {Footer} from "./Footer";

type Props = {
	children: React.ReactNode;
}

export const Panel: React.VFC<Props> = ( props ) => {
	return (
		<div id="elementor-panel" className="elementor-panel">
			<Header setUseOldPanel={()=>{}} />
			<Main>
				{props.children}
			</Main>
			<Footer />
		</div>
	);
}
