<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Tag_Expanders;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Composite widgets in MCP, owned by this module: the `<e-widget>` composition tag, the widgets resource
 * and their prompt sections. MCP itself knows only the generic hooks.
 */
class Mcp_Integration {
	const MCP_MODULE_NAME = 'mcp';
	const PROMPT_SECTIONS = [
		'build-composition' => 'prompts/build-composition.md',
	];

	/** @var callable(): Widgets_Definitions_Registry */
	private $get_registry;

	/**
	 * @param callable(): Widgets_Definitions_Registry $get_registry
	 */
	public function __construct( callable $get_registry ) {
		$this->get_registry = $get_registry;
	}

	public function register_hooks(): void {
		add_filter( Tag_Expanders::FILTER, fn ( $expanders ) => $this->add_tag_expander( $expanders ) );
		add_filter( Prompt_Loader::PROMPT_FILTER, fn ( $prompt, $name ) => $this->add_prompt_section( $prompt, $name ), 10, 2 );
		add_action( 'elementor/init', fn () => $this->register_resource() );
	}

	public function add_resource( Ability_Registry $registry ): void {
		$registry->add( new Composite_Widgets_Resource_Ability( $this->get_registry ) );
	}

	/**
	 * Runs once every module exists: the MCP registry belongs to another module, inactive without the MCP adapter.
	 */
	private function register_resource(): void {
		$mcp_module = Plugin::$instance->modules_manager->get_modules( self::MCP_MODULE_NAME );

		if ( $mcp_module instanceof Mcp_Module ) {
			$this->add_resource( $mcp_module->registry() );
		}
	}

	private function add_tag_expander( $expanders ): array {
		$expanders = is_array( $expanders ) ? $expanders : [];
		$expanders[] = new Widget_Instance_Expander( $this->get_registry );

		return $expanders;
	}

	private function add_prompt_section( $prompt, $name ) {
		$section = self::PROMPT_SECTIONS[ $name ] ?? null;

		if ( null === $section || ! is_string( $prompt ) ) {
			return $prompt;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return implode( "\n\n", array_filter( [ $prompt, rtrim( (string) file_get_contents( __DIR__ . '/' . $section ) ) ] ) );
	}
}
