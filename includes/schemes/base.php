<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Scheme_Base implements Scheme_Interface {

	const LAST_UPDATED_META = '_elementor_scheme_last_updated';

	private $_system_schemes;

	abstract protected function _init_system_schemes();

	public static function get_description() {
		return '';
	}

	final public function get_system_schemes() {
		if ( null === $this->_system_schemes ) {
			$this->_system_schemes = $this->_init_system_schemes();
		}

		return $this->_system_schemes;
	}

	public function get_scheme_value() {
		$scheme_value = get_option( 'elementor_scheme_' . static::get_type() );

		if ( ! $scheme_value ) {
			$scheme_value = $this->get_default_scheme();

			update_option( 'elementor_scheme_' . static::get_type(), $scheme_value );
		}

		return $scheme_value;
	}

	public function save_scheme( array $posted ) {
		$scheme_value = $this->get_scheme_value();

		update_option( 'elementor_scheme_' . static::get_type(), array_replace( $scheme_value, array_intersect_key( $posted, $scheme_value ) ) );

		update_option( self::LAST_UPDATED_META, time() );
	}

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

	final public function print_template() {
		?>
		<script type="text/template" id="tmpl-elementor-panel-schemes-<?php echo static::get_type(); ?>">
			<div class="elementor-panel-scheme-buttons">
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-reset">
					<button class="elementor-button">
						<i class="fa fa-undo"></i><?php _e( 'Reset', 'elementor' ); ?>
					</button>
				</div>
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
					<button class="elementor-button">
						<i class="fa fa-times"></i><?php _e( 'Discard', 'elementor' ); ?>
					</button>
				</div>
				<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
					<button class="elementor-button elementor-button-success" disabled><?php _e( 'Apply', 'elementor' ); ?></button>
				</div>
			</div>
			<?php $this->print_template_content(); ?>
		</script>
		<?php
	}
}
