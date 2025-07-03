import { type SliceState } from '@elementor/store';

import type slice from './slice';

type State = SliceState< typeof slice >;

export const selectOpenId = ( state: State ) => state.panels.openId;
