import { debounce } from '@elementor/utils';

import { getHistoryManager, type HistoryItem } from './get-history-manager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = Record< string, any > | undefined;

type LabelGenerator< TPayload extends Payload, TDoReturn > = ( payload: TPayload, doReturn: TDoReturn ) => string;

type Actions< TPayload extends Payload, TDoReturn, TUndoReturn > = {
	do: ( payload: TPayload ) => Awaited< TDoReturn >;
	undo: ( payload: TPayload, doReturn: Awaited< TDoReturn > ) => Awaited< TUndoReturn >;
	redo?: ( payload: TPayload, doReturn: Awaited< TDoReturn > ) => Awaited< TDoReturn >;
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

		let result = _actions.do( _payload );

		_addHistoryItem( {
			title: normalizeToGenerator( options.title )( _payload, result ),
			subTitle: normalizeToGenerator( options.subtitle )( _payload, result ),
			type: '',
			restore: ( _, isRedo ) => {
				if ( isRedo ) {
					result = _actions.redo( _payload, result );

					return;
				}

				_actions.undo( _payload, result );
			},
		} );

		return result;
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
