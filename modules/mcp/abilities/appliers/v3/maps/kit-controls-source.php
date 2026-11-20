<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The active kit tab sections whose controls store a kit-hosted target's settings.
 */
class Kit_Controls_Source {

	private string $tab_id;

	/**
	 * @var string[]
	 */
	private array $sections;

	/**
	 * @var string[]
	 */
	private array $required_controls;

	/**
	 * @param string   $tab_id
	 * @param string[] $sections
	 * @param string[] $required_controls Kit controls the targets cannot work without.
	 */
	public function __construct( string $tab_id, array $sections, array $required_controls = [] ) {
		$this->tab_id = $tab_id;
		$this->sections = $sections;
		$this->required_controls = $required_controls;
	}

	public function get_tab_id(): string {
		return $this->tab_id;
	}

	/**
	 * @return string[]
	 */
	public function get_sections(): array {
		return $this->sections;
	}

	/**
	 * @return string[]
	 */
	public function get_required_controls(): array {
		return $this->required_controls;
	}
}
