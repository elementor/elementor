export type StepConfig = {
	id: string,
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
	is_completed: boolean,
	config: StepConfig,
};
