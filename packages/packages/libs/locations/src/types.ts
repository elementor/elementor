import { type ComponentType, type PropsWithChildren } from 'react';

// Allow passing the `key` prop even when there are no props for the component
export type AnyProps = object;

export type InjectedComponent< TProps extends object = AnyProps > = ComponentType< TProps >;
export type Id = string;
export type Priority = number;

export type Injection< TProps extends object = AnyProps > = {
	/**
	 * A unique id (per location) of the injected component.
	 */
	id: Id;
	/**
	 * The injected component.
	 */
	component: InjectedComponent< TProps >;
	/**
	 * Priority of the injected component inside the location. Lower value means higher priority.
	 */
	priority: Priority;
};

export type ReplaceableInjection< TProps extends object = AnyProps > = Injection< TProps > & {
	/**
	 * A function that returns a boolean indicating whether the injection should be applied or not.
	 */
	condition?: ( props: TProps ) => boolean;
};

export type InjectArgs< TProps extends object = AnyProps > = {
	/**
	 * A unique id (per location) of the component to be injected.
	 */
	id: Id;
	/**
	 * The component to be injected.
	 */
	component: InjectedComponent< TProps >;

	options?: {
		/**
		 * Priority of the injected component inside the location. Lower value means higher priority.
		 */
		priority?: Priority;
		/**
		 * When true, if an injected component with the same id already exists it will be overridden with this one. Otherwise, this injection will be ignored. Default is false.
		 */
		overwrite?: boolean;
	};
};

export type ReplaceableInjectArgs< TProps extends object = AnyProps > = Pick<
	InjectArgs< TProps >,
	'id' | 'component'
> & {
	/**
	 * A function that returns a boolean indicating whether the injection should be applied or not.
	 */
	condition?: ( props: TProps ) => boolean;

	options?: {
		/**
		 * Priority of the injected component inside the location. Lower value means higher priority.
		 */
		priority?: Priority;
	};
};

export type Location< TProps extends object = AnyProps > = {
	/**
	 * Inject a component into the location.
	 */
	inject: ( args: InjectArgs< TProps > ) => void;
	/**
	 *
	 * @return All the injections in the location.
	 */
	getInjections: () => Injection< TProps >[];
	useInjections: () => Injection< TProps >[];
	Slot: ComponentType< TProps >;
};

export type ReplaceableLocation< TProps extends object = AnyProps > = {
	/**
	 * Register a component into the location.
	 */
	inject: ( args: ReplaceableInjectArgs< TProps > ) => void;
	/**
	 *
	 * @return All the injections in the location.
	 */
	getInjections: () => ReplaceableInjection< TProps >[];
	useInjections: () => ReplaceableInjection< TProps >[];
	Slot: ComponentType< PropsWithChildren< TProps > >;
};
