<?php

namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_UI extends Base {

	/**
	 * System schemes.
	 *
	 * Holds the list of all the system schemes.
	 *
	 * @since 2.8.0
	 * @access private
	 *
	 * @var array System schemes.
	 */
	private $_system_schemes;

	/**
	 * Get scheme title.
	 *
	 * Retrieve the scheme title.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	abstract public function get_title();

	/**
	 * Get scheme disabled title.
	 *
	 * Retrieve the scheme disabled title.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	abstract public function get_disabled_title();

	/**
	 * Get scheme titles.
	 *
	 * Retrieve the scheme titles.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	abstract public function get_scheme_titles();

	/**
	 * Print scheme content template.
	 *
	 * Used to generate the HTML in the editor using Underscore JS template. The
	 * variables for the class are available using `data` JS object.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	abstract public function print_template_content();

	/**
	 * Init system schemes.
	 *
	 * Initialize the system schemes.
	 *
	 * @since 2.8.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function _init_system_schemes();

	/**
	 * Get system schemes.
	 *
	 * Retrieve the system schemes.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array System schemes.
	 */
	final public function get_system_schemes() {
		if ( null === $this->_system_schemes ) {
			$this->_system_schemes = $this->_init_system_schemes();
		}

		return $this->_system_schemes;
	}

	/**
	 * Print scheme template.
	 *
	 * Used to generate the scheme template on the editor using Underscore JS
	 * template.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	final public function print_template() {
		?>
		<script type="text/template" id="tmpl-elementor-panel-schemes-<?php echo static::get_type(); ?>">
			<div class="elementor-panel-scheme-buttons">
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-reset">
					<button class="elementor-button">
						<i class="fa fa-undo" aria-hidden="true"></i>
						<?php echo __( 'Reset', 'elementor' ); ?>
					</button>
				</div>
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
					<button class="elementor-button">
						<i class="eicon-close" aria-hidden="true"></i>
						<?php echo __( 'Discard', 'elementor' ); ?>
					</button>
				</div>
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
					<button class="elementor-button elementor-button-success" disabled><?php echo __( 'Apply', 'elementor' ); ?></button>
				</div>
			</div>
			<?php $this->print_template_content(); ?>
		</script>
		<?php
	}

	/**
	 * Get scheme.
	 *
	 * Retrieve the scheme.
	 *
	 * @since 2.8.0
	 * @access public
	 *
	 * @return array The scheme.
	 */
	public function get_scheme() {
		$scheme = [];

		$titles = $this->get_scheme_titles();

		foreach ( $this->get_scheme_value() as $scheme_key => $scheme_value ) {
			$scheme[ $scheme_key ] = [
				'title' => isset( $titles[ $scheme_key ] ) ? $titles[ $scheme_key ] : '',
				'value' => $scheme_value,
			];
		}

		return $scheme;
	}
}
