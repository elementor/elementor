<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\EditorOneMenu\Mock;

use Elementor\Core\Admin\EditorOneMenu\Base_Third_Party_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mock_Third_Party_Menu_Item extends Base_Third_Party_Menu_Item {

	private string $id;
	private string $label;
	private string $capability;
	private string $target_url;
	private string $owner;

	public function __construct(
		string $id,
		string $label = 'Test Label',
		string $capability = 'manage_options',
		string $target_url = 'https://example.com',
		string $owner = 'test-plugin'
	) {
		$this->id = $id;
		$this->label = $label;
		$this->capability = $capability;
		$this->target_url = $target_url;
		$this->owner = $owner;
	}

	public function get_id(): string {
		return $this->id;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_capability(): string {
		return $this->capability;
	}

	public function get_target_url(): string {
		return $this->target_url;
	}

	public function get_owner(): string {
		return $this->owner;
	}
}

