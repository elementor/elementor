<?php
namespace Elementor\Modules\NewPostDialog\PostTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page extends Post_Type_Base {

	public function get_post_type(): string {
		return 'page';
	}

	public function get_capability(): string {
		return 'edit_pages';
	}

	public function get_default_title(): string {
		return esc_html__( 'New Page {number}', 'elementor' );
	}

	public function get_dialog_title(): string {
		return esc_html__( 'Name your new page', 'elementor' );
	}

	/**
	 * Add the new page name input form to the page
	 */
	public function print_dialog_form(): void {
		?>
			<div><?= esc_html__( '(or rename it later)', 'elementor' ); ?></div>
			<input name="post_title" type="text" placeholder="<?= $this->get_default_title() ?>" />
		<?php
	}
}
