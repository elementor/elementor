import { type DesignSystemTab } from './initial-tab';

export type SectionCloseAttempts = Record< DesignSystemTab, ( () => void ) | null >;

export function getSectionCloseAttempt(
	section: DesignSystemTab,
	attempts: SectionCloseAttempts
): ( () => void ) | null {
	return attempts[ section ];
}
