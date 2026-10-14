import { debounce } from '@elementor/utils';

import { getHistoryManager, type HistoryItem } from './get-history-manager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = Record< string, any > | undefined;

type LabelGenerator< TPayload extends Payload, TDoReturn > = ( payload: TPayload, doReturn: TDoReturn ) => string;

type Actions< TPayload extends Payload, TDoReturn, TUndoReturn > = {
	do: ( payload: TPayload ) => Awaited< TDoReturn >;
	undo: ( payload: TPayload, doReturn: Awaited< TDoReturn > ) => Awaited< TUndoReturn >;
	redo?: (
		payload: TPayload,
		doReturn: Awaited< TDoReturn >,
		undoReturn: Awaited< TUndoReturn >
	) => Awaited< TDoReturn >;
};

type Options< TPayload extends Payload, TDoReturn > = {
	title: string | LabelGenerator< TPayload, TDoReturn >;
	subtitle?: string | LabelGenerator< TPayload, TDoReturn >;
	debounce?: { wait: number };
};

// Action WITHOUT a payload.
export function undoable< TDoReturn, TUndoReturn >(
	actions: Actions< undefined, TDoReturn, TUndoReturn >,
	options: Options< undefined, NoInfer< TDoReturn > >
): () => TDoReturn;

// Action WITH a payload.
export function undoable< TPayload extends NonNullable< Payload >, TDoReturn, TUndoReturn >(
	actions: Actions< TPayload, TDoReturn, TUndoReturn >,
	options: Options< TPayload, NoInfer< TDoReturn > >
): ( payload: TPayload ) => TDoReturn;

export function undoable< TPayload extends Payload, TDoReturn, TUndoReturn >(
	actions: Actions< TPayload, TDoReturn, TUndoReturn >,
	options: Options< TPayload, NoInfer< TDoReturn > >
): ( payload?: Payload ) => TDoReturn {
	actions.redo ??= actions.do;

	const _addHistoryItem = options.debounce ? debounce( addHistoryItem, options.debounce.wait ) : addHistoryItem;

	return ( payload ) => {
		const _payload = payload as TPayload;
		const _actions = actions as Required< Actions< TPayload, TDoReturn, TUndoReturn > >;

		let doReturn = _actions.do( _payload );
		let undoReturn: Awaited< TUndoReturn >;

		_addHistoryItem( {
			title: normalizeToGenerator( options.title )( _payload, doReturn ),
			subTitle: normalizeToGenerator( options.subtitle )( _payload, doReturn ),
			type: '',
			restore: ( _, isRedo ) => {
				if ( isRedo ) {
					doReturn = _actions.redo( _payload, doReturn, undoReturn );

					return;
				}

				undoReturn = _actions.undo( _payload, doReturn );
			},
		} );

		return doReturn;
	};
}

function normalizeToGenerator< TPayload extends Payload, TDoReturn >(
	value: string | undefined | LabelGenerator< TPayload, TDoReturn >
) {
	return typeof value === 'function' ? value : () => value ?? '';
}

function addHistoryItem( item: HistoryItem ) {
	const history = getHistoryManager();
	history.addItem( item );
}
