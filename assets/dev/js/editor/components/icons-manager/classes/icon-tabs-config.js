const iconTabs = [
	{
		name: 'all',
	},
	{
		name: 'solid',
		label: 'Solid',
		url: 'https://use.fontawesome.com/releases/v5.7.2/css/solid.css',
		prefix: 'fa-',
		displayPrefix: 'fas',
		ver: '5.7.2',
		enqueue: [
			'https://use.fontawesome.com/releases/v5.7.2/css/fontawesome.css',
		],
		fetchJson: 'json/solid.json',
		icons: [],
	},
	{
		name: 'regular',
		label: 'Regular',
		url: 'https://use.fontawesome.com/releases/v5.7.2/css/regular.css',
		enqueue: [
			'https://use.fontawesome.com/releases/v5.7.2/css/fontawesome.css',
		],
		prefix: 'fa-',
		displayPrefix: 'far',
		labelIcon: 'fa-flag',
		ver: '5.7.2',
		fetchJson: 'json/regular.json',
		icons: [],
	},
	{
		name: 'brands',
		label: 'Brands',
		url: 'https://use.fontawesome.com/releases/v5.7.2/css/brands.css',
		enqueue: [
			'https://use.fontawesome.com/releases/v5.7.2/css/fontawesome.css',
		],
		prefix: 'fa-',
		displayPrefix: 'fab',
		labelIcon: 'fa-flag',
		ver: '5.7.2',
		fetchJson: 'json/brands.json',
		icons: [],
	},
	{
		name: 'devicons',
		label: 'devicons',
		url: 'https://cdnjs.cloudflare.com/ajax/libs/devicon/2.2/devicon.css',
		prefix: 'devicon-',
		ver: '2.2',
		icons: [],
	},
];

export default iconTabs;
