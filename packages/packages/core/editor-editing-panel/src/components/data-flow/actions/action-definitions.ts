import { type ArgPropType } from './actions-props';

export type ActionDefinition = {
  name: string;
  label: string;
  description: string;
  source: 'built-in' | 'plugin' | 'custom';
  args: Record< string, ArgPropType >;
};

export const EVENTS = [
  'click',
  'dblclick',
  'pointerenter',
  'pointerleave',
  'pointerdown',
  'pointerup',
  'focus',
  'blur',
  'input',
  'change',
  'submit',
  'load',
  'state',
] as const;

export const STATE_EVENT = 'state';

export const INPUT_VALUES: Record< string, string[] > = {
  pointer: [ 'x', 'y', 'px', 'py', 'inside' ],
  scroll: [ 'y', 'progress', 'velocity', 'speed' ],
  drag: [ 'x', 'y', 'angle', 'velocity', 'dragging' ],
  time: [ 't' ],
};

export const INPUTS_WITH_SPACE = [ 'pointer', 'scroll' ];

export function getActionDefinitions(): ActionDefinition[] {
  return ( window.elementor?.config?.dataFlow?.actions ?? [] ) as ActionDefinition[];
}

export function getActionArgsSchema( name: string ): Record< string, ArgPropType > {
  return getActionDefinitions().find( ( definition ) => definition.name === name )?.args ?? {};
}
