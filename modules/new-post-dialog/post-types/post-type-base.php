<?php
namespace Elementor\Modules\NewPostDialog\PostTypes;

abstract class Post_Type_Base {

	abstract function get_post_type(): string;

	abstract function get_capability(): string;

	abstract function print_dialog_form(): void;

	abstract function get_default_title(): string;

	abstract function get_dialog_title(): string;

	function do_override_every_link(): bool {
		return true;
	}
}
