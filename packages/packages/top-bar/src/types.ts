import { registerAction, registerLink, registerToggleAction } from './locations';

type RegisterAction = typeof registerAction;
type RegisterLink = typeof registerLink;
type RegisterToggleAction = typeof registerToggleAction;

type ExtractProps<
	T extends RegisterAction | RegisterLink | RegisterToggleAction
	> = NonNullable<Parameters<T>[1]['props']>;

export type ActionProps = ExtractProps<RegisterAction>;
export type ToggleActionProps = ExtractProps<RegisterToggleAction>;
export type LinkProps = ExtractProps<RegisterLink>;
