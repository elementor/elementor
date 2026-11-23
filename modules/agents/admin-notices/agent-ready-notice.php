<?php

namespace Elementor\Modules\Agents\AdminNotices;

use Elementor\Core\Admin\Notices\Base_Notice;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Module;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Agent_Ready_Notice extends Base_Notice {

	const NOTICE_ID = 'agent_ready_promotion';

	const ELEMENTOR_SCREEN_IDS = [
		'elementor_page_elementor-mcp',
		Source_Local::ADMIN_SCREEN_ID,
		'elementor_page_elementor-settings',
	];

	const WORDPRESS_SCREEN_IDS = [ 'dashboard', 'edit-post', 'edit-page' ];

	const NOTICE_CLASSES = [ 'notice', 'e-notice', 'inline' ];

	private Agent_Ready_Settings $settings;

	private Scanner_Report_Store $scanner_store;

	public function __construct( Agent_Ready_Settings $settings, Scanner_Report_Store $scanner_store ) {
		$this->settings = $settings;
		$this->scanner_store = $scanner_store;
	}

	public function should_print() {
		return current_user_can( 'manage_options' )
			&& $this->is_allowed_screen()
			&& ! $this->settings->is_activated()
			&& null === $this->scanner_store->get_last_report()
			&& ! User::is_user_notice_viewed( self::NOTICE_ID );
	}

	public function get_config() {
		return [
			'id' => self::NOTICE_ID,
			'type' => 'inline',
			'classes' => self::NOTICE_CLASSES,
			'description' => sprintf(
				'%1$s <a href="%2$s">%3$s</a>',
				esc_html__( 'Can AI agents find your site? Check how AI agents find, read and act on your site, free.', 'elementor' ),
				esc_url( admin_url( 'admin.php?page=' . Module::PAGE_ID ) ),
				esc_html__( 'Scan & Fix', 'elementor' )
			),
		];
	}

	private function is_allowed_screen(): bool {
		$screen = get_current_screen();

		return null !== $screen && in_array(
			$screen->id,
			array_merge( self::ELEMENTOR_SCREEN_IDS, self::WORDPRESS_SCREEN_IDS ),
			true
		);
	}
}
