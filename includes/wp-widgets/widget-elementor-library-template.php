<?php
namespace Elementor;

class Widget_Elementor_Library_Template extends \WP_Widget {

	public function __construct() {
		parent::__construct(
			'elementor-library-template',
			esc_html__( 'Elementor Library Template', 'elementor' ),
			[
				'description' => esc_html__( 'Include your Elementor template anywhere', 'elementor' ),
			]
		);
	}

	/**
	 * @param array $args
	 * @param array $instance
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];

		if ( ! empty( $instance['title'] ) ) {
			echo $args['before_title'] . apply_filters( 'widget_title', $instance['title'] ) . $args['after_title'];
		}

		if ( ! empty( $instance['template_id'] ) ) {
			echo Plugin::instance()->frontend->get_builder_content_for_display( $instance['template_id'] );
		}

		echo $args['after_widget'];
	}

	/**
	 * @param array $instance
	 *
	 * @return void
	 */
	public function form( $instance ) {
		if ( ! isset( $instance['title'] ) ) :
			$instance['title'] = '';
		endif;
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_attr_e( 'Title:', 'elementor' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $instance['title'] ); ?>">
		</p>

		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'template_id' ) ); ?>"><?php esc_attr_e( 'Template ID:', 'elementor' ); ?></label>
			<select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'template_id' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'template_id' ) ); ?>">
				<option value=""><?php _e( 'Please Choose', 'elementor' ) ?></option>
				<?php
				$source = Plugin::instance()->templates_manager->get_source( 'local' );
				$templates = $source->get_items();

				foreach ( $templates as $template ) :
					$selected = selected( $template['template_id'], $instance['template_id'] );
					?>
					<option value="<?php echo $template['template_id'] ?>" <?php echo $selected ?>>
						<?php echo $template['title'] ?>
					</option>
				<?php endforeach; ?>
			</select>
		</p>
		<?php
	}

	/**
	 *
	 * @param array $new_instance
	 * @param array $old_instance
	 *
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = [];
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		$instance['template_id'] = $new_instance['template_id'];

		return $instance;
	}
}
