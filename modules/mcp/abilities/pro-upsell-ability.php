<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Upsell_Ability extends Abstract_Ability {

	const ERROR_CODE = 'pro_license_required';

	private string $id;
	private string $label;
	private string $description;
	private string $error_message;
	private string $description_notice;
	private string $upgrade_url;
	private array $input_schema;

	public function __construct( string $id, string $label, string $description, string $error_message, string $description_notice, string $upgrade_url, array $input_schema = [] ) {
		$this->id = $id;
		$this->label = $label;
		$this->description = $description;
		$this->error_message = $error_message;
		$this->description_notice = $description_notice;
		$this->upgrade_url = $upgrade_url;
		$this->input_schema = $input_schema;
	}

	protected function get_ability_id(): string {
		return $this->id;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			$this->label,
			$this->description,
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'edit_posts' ),
			$this->input_schema
		);
	}

	public function is_available() {
		return $this->pro_required_error();
	}

	public function execute( $input = [] ) {
		return $this->pro_required_error();
	}

	private function pro_required_error(): \WP_Error {
		return new \WP_Error(
			self::ERROR_CODE,
			sprintf( $this->error_message, $this->upgrade_url ),
			[
				'status' => \WP_Http::FORBIDDEN,
				'upgrade_url' => $this->upgrade_url,
				'description_notice' => $this->description_notice,
			]
		);
	}
}
