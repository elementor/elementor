<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Resources_Ability extends Abstract_Ability {

	private ?Ability_Registry $registry;

	public function __construct( ?Ability_Registry $registry = null ) {
		$this->registry = $registry;
	}

	protected function get_ability_id(): string {
		return 'elementor/list-resources';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Resources', 'elementor' ),
			Prompt_Loader::load( 'list-resources' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'resources' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'uri' => [ 'type' => 'string' ],
								'name' => [ 'type' => 'string' ],
								'description' => [ 'type' => 'string' ],
								'mimeType' => [ 'type' => 'string' ],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		return [
			'resources' => $this->build_catalog(),
		];
	}

	private function build_catalog(): array {
		$catalog = [];

		foreach ( $this->resolve_registry()->resources() as $ability ) {
			if ( ! $ability->is_exposed_via_proxy() ) {
				continue;
			}

			$catalog[] = [
				'uri' => (string) $ability->get_uri(),
				'name' => $ability->get_display_name(),
				'description' => (string) ( $ability->get_resource_description() ?? '' ),
				'mimeType' => (string) ( $ability->get_mime_type() ?? '' ),
			];
		}

		return $catalog;
	}

	private function resolve_registry(): Ability_Registry {
		if ( $this->registry instanceof Ability_Registry ) {
			return $this->registry;
		}

		$module = Plugin::$instance->modules_manager->get_modules( 'mcp' );

		$this->registry = $module instanceof Mcp_Module
			? $module->registry()
			: Mcp_Module::build_core_registry();

		return $this->registry;
	}
}
