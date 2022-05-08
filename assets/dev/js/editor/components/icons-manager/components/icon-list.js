import PropTypes from 'prop-types';
import React, { Fragment, Component } from 'react';

class LazyIconList extends Component {
	state = {
		itemSize: {
			width: 0,
			height: 0,
		},
		wrapperSize: {
			width: 0,
			height: 0,
		},
		firstRowInView: 0,
	};

	selectors = {
		item: '.elementor-icons-manager__tab__item',
		wrapper: 'elementor-icons-manager__tab__wrapper',
	};

	attachScrollListener = () => {
		const element = document.getElementById( this.selectors.wrapper );
		if ( element ) {
			element.addEventListener( 'scroll', this.handleScroll );
		}
	};

	maybeMeasureItem = () => {
		if ( this.state.itemSize.width ) {
			return;
		}
		// CSS Item Padding
		const itemPadding = 20,
			testElement = document.querySelector( this.selectors.item );

		if ( ! testElement ) {
			return;
		}

		const wrapper = document.getElementById( this.selectors.wrapper );
		const newState = {
			itemSize: {
				width: testElement.offsetWidth + itemPadding,
				height: testElement.offsetHeight + itemPadding,
			},
			wrapperSize: {
				width: wrapper.offsetWidth,
				height: wrapper.clientHeight,
			},
		};

		return this.setState( newState, () => {
			this.maybeScrollToSelected();
		} );
	};

	maybeScrollToSelected = () => {
		if ( ! this.hasSelected() ) {
			return;
		}
		const { selectedIndex } = this.props,
			{ wrapperSize, itemSize } = this.state,
			itemsInRow = Math.floor( wrapperSize.width / itemSize.width ),
			selectedItemRow = Math.ceil( selectedIndex / itemsInRow ) - 1,
			scrollTop = selectedItemRow * itemSize.height;

		setTimeout( () => {
			this.props.parentRef.current.scrollTo( {
				top: scrollTop,
				left: 0,
				behavior: 'auto',
			} );
		}, 0 );
	};

	componentDidMount() {
		this.attachScrollListener();
		this.maybeMeasureItem();
	}

	componentWillUnmount() {
		this.clearDebounceScrollCallback();
		const element = document.getElementById( this.selectors.wrapper );
		if ( element ) {
			element.removeEventListener( 'scroll', this.handleScroll );
		}
	}

	handleScroll = () => {
		this.clearDebounceScrollCallback();
		this._debounce = setTimeout( () => {
			const element = document.getElementById( this.selectors.wrapper );
			const { itemSize } = this.state;
			this.setState( {
				firstRowInView: Math.floor( element.scrollTop / itemSize.height ),
			} );
		}, 10 );
	};

	clearDebounceScrollCallback() {
		clearTimeout( this._debounce );
	}

	renderFirstElementForMeasurement() {
		return <div id={ 'elementor-icons-manager__tab__content' }>
			{ this.props.items[ 0 ] }
		</div>;
	}

	hasSelected() {
		return -1 !== this.props.selectedIndex;
	}

	render = () => {
		const { itemSize, wrapperSize } = this.state;
		let { firstRowInView } = this.state;
		if ( ! itemSize.width ) {
			return this.renderFirstElementForMeasurement();
		}

		const { items } = this.props,
			itemsInRow = Math.floor( wrapperSize.width / itemSize.width ),
			totalRows = Math.ceil( items.length / itemsInRow ),
			spareRows = 4;
		let rowsInView = Math.ceil( wrapperSize.height / itemSize.height ) + spareRows;

		if ( rowsInView > totalRows ) {
			rowsInView = totalRows;
		}

		// Prevent scroll overflow
		if ( firstRowInView > ( totalRows - rowsInView ) ) {
			firstRowInView = totalRows - rowsInView;
		}

		const tailRows = ( totalRows - firstRowInView ) - rowsInView,
			firstItemIndexInWindow = firstRowInView * itemsInRow,
			lastItemIndexInWindow = ( ( firstRowInView + rowsInView ) * itemsInRow ) - 1,
			itemsInView = items.slice( firstItemIndexInWindow, lastItemIndexInWindow + 1 ),
			offsetStyle = {
				height: `${ firstRowInView * itemSize.height }px`,
			},
			tailStyle = {
				height: `${ tailRows * itemSize.height }px`,
			};

		return <Fragment>
			<div className={ 'elementor-icons-manager__tab__content__offset' } style={ offsetStyle }></div>
			<div id={ 'elementor-icons-manager__tab__content' }>
				{ itemsInView }
			</div>
			<div className={ 'elementor-icons-manager__tab__content__tail' } style={ tailStyle }></div>
		</Fragment>;
	};
}

export default LazyIconList;

LazyIconList.propTypes = {
	items: PropTypes.array,
	selectedIndex: PropTypes.number,
	parentRef: PropTypes.any,
};
