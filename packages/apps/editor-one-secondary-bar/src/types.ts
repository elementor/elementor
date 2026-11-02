export type SecondaryBarTab = {
	id: string;
	label: string;
	url: string;
	is_active: boolean;
};

export type SecondaryBarLink = {
	label: string;
	url: string;
};

export type SecondaryBarConfig = {
	label: string;
	tabs: SecondaryBarTab[];
	addons: SecondaryBarLink[];
};
