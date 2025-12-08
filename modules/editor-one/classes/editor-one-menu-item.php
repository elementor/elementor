<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Menu_Item implements Admin_Menu_Item_With_Page, Admin_Menu_Item_Has_Position {

	private $original_item;

	private $new_parent_slug;

	private $slug;

	private $position;

	private $label;

	public function __construct(
		Admin_Menu_Item $original_item,
		string $new_parent_slug,
		string $slug = '',
		?string $label = null,
		?int $position = null,
	) {
		$this->original_item = $original_item;
		$this->new_parent_slug = $new_parent_slug;
		$this->slug = $slug;
		$this->position = $position;
		$this->label = $label;
	}

	public function get_slug(): string {
		return $this->slug;
	}

	public function get_capability(): string {
		return $this->original_item->get_capability();
	}

	public function get_label(): string {
		return $this->label ?? $this->original_item->get_label();
	}

	public function get_parent_slug(): string {
		return $this->new_parent_slug;
	}

	public function is_visible(): bool {
		return $this->original_item->is_visible();
	}

	public function get_page_title(): string {
		if ( $this->original_item instanceof Admin_Menu_Item_With_Page ) {
			return $this->original_item->get_page_title();
		}

		return $this->get_label();
	}

	public function render(): void {
		if ( $this->original_item instanceof Admin_Menu_Item_With_Page ) {
			$this->original_item->render();
		}
	}

	public function get_original_item(): Admin_Menu_Item {
		return $this->original_item;
	}

	public function get_original_parent_slug(): ?string {
		return $this->original_item->get_parent_slug();
	}

	public function get_position() {
		if ( null !== $this->position ) {
			return $this->position;
		}

		if ( $this->original_item instanceof Admin_Menu_Item_Has_Position ) {
			return $this->original_item->get_position();
		}

		return null;
	}
}
