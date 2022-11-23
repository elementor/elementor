export type Category = {
	id: string;
	title: string;
	sort: string;
	hideIfEmpty: boolean;
	isActive: boolean;
};

export type Element = {
	name: string;
	title: string;
	icon: string;
	show_in_panel: boolean;
	categories: string[];
	hide_on_search: boolean;
};
