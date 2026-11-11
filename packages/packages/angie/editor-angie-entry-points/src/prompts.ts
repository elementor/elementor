import { type ComponentInstanceHeaderProps } from '@elementor/editor-components';
import { type ControlHeaderProps } from '@elementor/editor-controls';
import { type StyleSectionHeaderProps, type StyleTabHeaderProps } from '@elementor/editor-editing-panel';
import { type InteractionsHeaderProps } from '@elementor/editor-interactions';
import { type VariableFormHeaderProps } from '@elementor/editor-variables';

const BACKGROUND_PROP_KEY = 'background';

type ControlHeaderPromptParams = Pick< ControlHeaderProps, 'controlType' | 'bind' | 'path' > & {
	elementId: string;
};

type AngiePromptBuilders = {
	backgroundImage: ( elementId: string ) => string;
	classManager: () => string;
	classSelector: ( elementId: string, classLabel: string ) => string;
	componentInstance: ( params: ComponentInstanceHeaderProps ) => string;
	componentsTab: () => string;
	controlHeader: ( params: ControlHeaderPromptParams ) => string | null;
	customCss: ( params: StyleSectionHeaderProps ) => string;
	image: ( elementId: string ) => string;
	interactions: ( params: InteractionsHeaderProps ) => string;
	namedImage: ( elementId: string, bind: string ) => string;
	styleTab: ( params: StyleTabHeaderProps ) => string;
	text: ( elementId: string ) => string;
	variableForm: ( params: VariableFormHeaderProps ) => string;
	variablesManager: () => string;
};

export const ANGIE_PROMPTS: AngiePromptBuilders = {
	backgroundImage: ( elementId: string ) => `At element ${ elementId }, background image, I want: `,
	classManager: () => 'In the design system global classes, I want: ',
	classSelector: ( elementId: string, classLabel: string ) =>
		`At element ${ elementId }, class "${ classLabel }", I want: `,
	componentInstance: ( { componentId, elementId }: ComponentInstanceHeaderProps ) =>
		`At component ${ componentId } (instance ${ elementId }) I want: `,
	componentsTab: () => 'In components, I want: ',
	controlHeader: ( { elementId, controlType, bind, path }: ControlHeaderPromptParams ) => {
		if ( 'inline-editing' === controlType ) {
			return ANGIE_PROMPTS.text( elementId );
		}

		if ( 'image' === controlType && path.includes( BACKGROUND_PROP_KEY ) ) {
			return ANGIE_PROMPTS.backgroundImage( elementId );
		}

		if ( 'image' === controlType ) {
			if ( 'image' === bind ) {
				return ANGIE_PROMPTS.image( elementId );
			}

			return ANGIE_PROMPTS.namedImage( elementId, bind );
		}

		return null;
	},
	customCss: ( { elementId }: StyleSectionHeaderProps ) => `At element ${ elementId }, custom CSS, I want: `,
	image: ( elementId: string ) => `At element ${ elementId }, image, I want: `,
	interactions: ( { elementId }: InteractionsHeaderProps ) => `At element ${ elementId }, interactions, I want: `,
	namedImage: ( elementId: string, bind: string ) => `At element ${ elementId }, image "${ bind }", I want: `,
	styleTab: ( { elementId }: StyleTabHeaderProps ) => `At element ${ elementId }, styles, I want: `,
	text: ( elementId: string ) => `At element ${ elementId } I want: `,
	variableForm: ( { variableType, label }: VariableFormHeaderProps ) => {
		if ( label ) {
			return `For ${ variableType } variable "${ label }" I want: `;
		}

		return `For new ${ variableType } variable I want: `;
	},
	variablesManager: () => 'In the design system variables, I want: ',
};
