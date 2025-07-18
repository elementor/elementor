import * as React from 'react';

import { LogicSlot, TopSlot } from '../locations';

export default function Shell() {
	return (
		<>
			<TopSlot />
			<div style={ { display: 'none' } }>
				<LogicSlot />
			</div>
		</>
	);
}
