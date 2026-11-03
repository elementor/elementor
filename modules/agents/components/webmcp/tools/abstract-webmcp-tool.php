<?php

namespace Elementor\Modules\Agents\Components\Webmcp\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Webmcp_Tool {

	const CATEGORY = 'elementor-webmcp';

	const ERROR_NOT_FOUND = 'webmcp_not_found';

	const ERROR_UNAVAILABLE = 'webmcp_unavailable';

	abstract public function get_slug(): string;

	abstract public function get_label(): string;

	abstract public function get_description(): string;

	abstract public function get_admin_description(): string;

	abstract public function get_input_schema(): array;

	/**
	 * @param mixed $input Validated input.
	 * @return array|\WP_Error
	 */
	abstract public function execute( $input = null );

	abstract public function is_relevant(): bool;

	public function get_ability_name(): string {
		return self::CATEGORY . '/' . $this->get_slug();
	}

	public function register(): void {
		wp_register_ability( $this->get_ability_name(), [
			'label' => $this->get_label(),
			'description' => $this->get_description(),
			'category' => self::CATEGORY,
			'input_schema' => $this->get_input_schema(),
			'execute_callback' => [ $this, 'execute' ],
			'permission_callback' => '__return_true',
			'meta' => [
				'webmcp' => true,
				'annotations' => [ 'readonly' => true ],
			],
		] );
	}
}
