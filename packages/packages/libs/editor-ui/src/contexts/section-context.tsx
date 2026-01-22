import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

const FALLBACK_SECTION_WIDTH = 320;

export const SectionRefContext = createContext< RefObject< HTMLElement > | null >( null );

const useSectionRef = () => useContext( SectionRefContext );

export const useSectionWidth = (): number => {
	const sectionRef = useSectionRef();

	return sectionRef?.current?.offsetWidth ?? FALLBACK_SECTION_WIDTH;
};
