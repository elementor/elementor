<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\App\Modules\KitLibrary\AdminMenuItems\Editor_One_Website_Templates_Menu;
use Elementor\Modules\LandingPages\AdminMenuItems\Editor_One_Landing_Pages_Menu;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Flow_Config {
	const PARENT_HOME = 'elementor-home';
	const PARENT_AGENT_READY = 'elementor-agents-ready';
	const PARENT_MCP = 'elementor-mcp';
	const PARENT_TEMPLATES = 'elementor-templates';
	const PARENT_THEME_BUILDER = 'elementor-theme-builder';
	const PARENT_POPUPS = 'elementor-popups';
	const PARENT_SITE_ASSETS = 'elementor-site-assets';
	const PARENT_SUBMISSIONS = 'e-form-submissions';
	const PARENT_SETTINGS = 'elementor-settings';
	const PARENT_TOOLS = 'elementor-tools';
	const PARENT_ACCOUNT = 'elementor-account';

	const GROUP_AGENT_READY = 'agent-ready';
	const GROUP_MCP = 'mcp';
	const GROUP_TEMPLATES = 'templates';
	const GROUP_SITE_ASSETS = 'site-assets';
	const GROUP_SUBMISSIONS = 'submissions';
	const GROUP_SETTINGS = 'settings';
	const GROUP_ACCOUNT = 'account';

	const CODE_SNIPPETS_SLUG = 'elementor-code-snippets';

	public static function get_config(): array {
		$config = [
			'parents' => self::get_parents(),
			'groups' => self::get_groups(),
			'pages' => self::get_pages(),
		];

		return apply_filters( 'elementor/editor-one/admin-flow/config', $config );
	}

	private static function get_parents(): array {
		return [
			self::PARENT_HOME => [],
			self::PARENT_AGENT_READY => [
				'group' => self::GROUP_AGENT_READY,
				'default_tab' => 'readiness-score',
			],
			self::PARENT_MCP => [
				'group' => self::GROUP_MCP,
				'default_tab' => 'mcp',
			],
			self::PARENT_TEMPLATES => [
				'group' => self::GROUP_TEMPLATES,
				'default_tab' => 'saved-templates',
			],
			self::PARENT_THEME_BUILDER => [
				'group' => self::GROUP_TEMPLATES,
				'default_tab' => 'theme-builder',
			],
			self::PARENT_POPUPS => [
				'group' => self::GROUP_TEMPLATES,
				'default_tab' => 'popups',
			],
			self::PARENT_SITE_ASSETS => [
				'group' => self::GROUP_SITE_ASSETS,
				'default_tab' => 'code',
			],
			self::PARENT_SUBMISSIONS => [
				'group' => self::GROUP_SUBMISSIONS,
				'default_tab' => 'submissions',
			],
			self::PARENT_SETTINGS => [
				'group' => self::GROUP_SETTINGS,
				'default_tab' => 'settings',
			],
			self::PARENT_TOOLS => [
				'group' => self::GROUP_SETTINGS,
				'default_tab' => 'tools',
			],
			self::PARENT_ACCOUNT => [
				'group' => self::GROUP_ACCOUNT,
				'default_tab' => 'account',
			],
		];
	}

	private static function get_groups(): array {
		return [
			self::GROUP_AGENT_READY => [
				'readiness-score' => [
					'parent' => self::PARENT_AGENT_READY,
					'items' => [ 'elementor-agents-ready' ],
				],
				'agent-access' => [
					'parent' => self::PARENT_AGENT_READY,
					'items' => [ 'elementor-agent-access' ],
				],
			],
			self::GROUP_MCP => [
				'mcp' => [
					'parent' => self::PARENT_MCP,
					'items' => [ 'elementor-mcp' ],
				],
			],
			self::GROUP_TEMPLATES => [
				'saved-templates' => [
					'parent' => self::PARENT_TEMPLATES,
					'items' => [ Menu_Config::LEGACY_TEMPLATES_SLUG ],
				],
				'theme-builder' => [
					'parent' => self::PARENT_THEME_BUILDER,
					'items' => [ 'elementor-theme-builder', 'elementor-app' ],
					'url' => [ Menu_Data_Provider::instance(), 'get_theme_builder_url' ],
					'routes' => [
						[
							'post_type' => 'elementor_library',
							'tabs_group' => 'theme',
						],
					],
				],
				'popups' => [
					'parent' => self::PARENT_POPUPS,
					'items' => [
						'edit.php?post_type=elementor_library&tabs_group=popup&elementor_library_type=popup',
						'e-popups',
						'popup_templates',
					],
				],
				'website-templates' => [
					'parent' => self::PARENT_TEMPLATES,
					'items' => [ Editor_One_Website_Templates_Menu::class ],
				],
				'floating-elements' => [
					'parent' => self::PARENT_TEMPLATES,
					'items' => [ 'edit.php?post_type=e-floating-buttons' ],
				],
				'landing-pages' => [
					'parent' => self::PARENT_TEMPLATES,
					'items' => [ Editor_One_Landing_Pages_Menu::class ],
				],
			],
			self::GROUP_SITE_ASSETS => [
				'code' => [
					'parent' => self::PARENT_SITE_ASSETS,
					'items' => [ 'edit.php?post_type=elementor_snippet', 'e-custom-code', 'elementor_custom_code' ],
				],
				'fonts' => [
					'parent' => self::PARENT_SITE_ASSETS,
					'items' => [ 'edit.php?post_type=elementor_font', 'e-custom-fonts', 'elementor_custom_fonts' ],
				],
				'icons' => [
					'parent' => self::PARENT_SITE_ASSETS,
					'items' => [ 'edit.php?post_type=elementor_icons', 'e-custom-icons', 'elementor_custom_icons' ],
				],
				'code-snippets' => [
					'parent' => self::PARENT_SITE_ASSETS,
					'items' => [ self::CODE_SNIPPETS_SLUG ],
				],
			],
			self::GROUP_SUBMISSIONS => [
				'submissions' => [
					'parent' => self::PARENT_SUBMISSIONS,
					'items' => [ 'e-form-submissions' ],
				],
			],
			self::GROUP_SETTINGS => [
				'settings' => [
					'parent' => self::PARENT_SETTINGS,
					'items' => [ 'elementor-settings' ],
				],
				'tools' => [
					'parent' => self::PARENT_TOOLS,
					'items' => [ 'elementor-tools' ],
				],
				'role-manager' => [
					'parent' => self::PARENT_SETTINGS,
					'items' => [ 'elementor-role-manager' ],
				],
				'element-manager' => [
					'parent' => self::PARENT_SETTINGS,
					'items' => [ 'elementor-element-manager' ],
				],
			],
			self::GROUP_ACCOUNT => [
				'account' => [
					'parent' => self::PARENT_ACCOUNT,
					'items' => [ 'elementor-license', 'elementor-connect-account' ],
				],
				'system-info' => [
					'parent' => self::PARENT_ACCOUNT,
					'items' => [ 'elementor-system-info' ],
				],
			],
		];
	}

	private static function get_pages(): array {
		return [
			Menu_Config::ELEMENTOR_MENU_SLUG => self::PARENT_HOME,
			Menu_Config::EDITOR_MENU_SLUG => self::PARENT_HOME,
			'elementor-connect' => self::PARENT_ACCOUNT,
		];
	}
}
