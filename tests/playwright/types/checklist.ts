const stepIds = [ 'add_logo', 'set_fonts_and_colors', 'create_pages', 'setup_header', 'assign_homepage' ] as const;
export type StepId = typeof stepIds[ number ];

export const immutableStepIds: StepId[] = [ 'create_pages' ] as const;

export const proStepIds: StepId[] = [ 'setup_header' ] as const;

export type StepConfig = {
	id: StepId,
	title: string,
	description: string,
	learn_more_text: string,
	learn_more_url: string,
	cta_text: string,
	cta_url: string,
	image_src: string,
	is_locked: boolean,
	required_license: string,
	promotion_url: string,
};

export type Step = {
	is_marked_completed: boolean,
	is_absolute_completed: boolean,
	is_immutable_completed: boolean,
	config: StepConfig,
};
