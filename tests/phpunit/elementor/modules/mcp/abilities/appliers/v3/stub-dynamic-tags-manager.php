<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Core\DynamicTags\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Stub_Dynamic_Tags_Manager extends Manager {

	/** @var array<string, array<int, string>> */
	private $tag_categories = [];

	public function __construct() {
	}

	public function add_stub_tag( string $name, array $categories ): void {
		$this->tag_categories[ $name ] = $categories;
	}

	public function create_tag( $tag_id, $tag_name, array $settings = [] ) {
		if ( ! isset( $this->tag_categories[ $tag_name ] ) ) {
			return null;
		}

		return new Stub_Dynamic_Tag( (string) $tag_id, $tag_name, $this->tag_categories[ $tag_name ] );
	}

	public function tag_to_text( $tag ) {
		return sprintf( '[elementor-tag id="%s" name="%s"]', $tag->get_id(), $tag->get_name() );
	}
}

class Stub_Dynamic_Tag {

	private $tag_id;
	private $tag_name;
	private $categories;

	public function __construct( string $tag_id, string $tag_name, array $categories ) {
		$this->tag_id = $tag_id;
		$this->tag_name = $tag_name;
		$this->categories = $categories;
	}

	public function get_id() {
		return $this->tag_id;
	}

	public function get_name() {
		return $this->tag_name;
	}

	public function get_categories() {
		return $this->categories;
	}
}
