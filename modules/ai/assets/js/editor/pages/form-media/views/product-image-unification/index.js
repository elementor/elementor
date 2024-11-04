import { useCallback, useMemo, useState } from 'react';
import { Avatar, Box, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';
import ImageRatioSelect from '../../components/image-ratio-select';
import ColorInput from '../../components/color-picker';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateSubmit from '../../components/generate-submit';
import ImagesDisplay from '../../components/images-display';
import ProductImage from './components/product-image';
import ImageActions from '../../components/image-actions';
import useImageActions from '../../hooks/use-image-actions';

const ProductImageUnification = () => {
	const { setGenerate } = useRequestIds();
	const { editImage: products } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( );
	const [ productsData, setProductsData ] = useState( {} );
	const [ loadingMap, setLoadingMap ] = useState( {} );
	const [ errorMap, setErrorMap ] = useState( {} );
	const [ checkboxColorMap, setCheckboxColorMap ] = useState( {} );
	const [ wasGeneratedOnce, setWasGeneratedOnce ] = useState( false );
	const { useMultipleImages } = useImageActions();
	const [ isSavingImages, setIsSavingImages ] = useState( false );
	const errorlessProducts = Object.values( productsData ).filter( ( { productId } ) => ! errorMap[ productId ]?.errorGenerating );
	const use = useCallback( async () => {
		setIsSavingImages( true );
		const imagesToSave = errorlessProducts
			.filter( ( { data, wasGenerated } ) => wasGenerated && data?.isChecked && data?.productId !== undefined )
			.map( ( { data } ) => ( {
				...data,
				editor_post_id: data.productId,
				unique_id: `ai-product-unification-${ data.productId }`,
			} ) );
		// eslint-disable-next-line react-hooks/rules-of-hooks
		await useMultipleImages( imagesToSave );
	}, [ errorlessProducts, useMultipleImages ] );
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ settings ] );
	const generatedBgColor = useMemo( () => settings[ IMAGE_BACKGROUND_COLOR ], [ settings ] );
	const onProductUpdate = useCallback( ( res, isLoadingResult, errorGenerating, req, productId, ratio, bgColor, image ) => {
		setLoadingMap( ( prevState ) => ( { ...prevState, [ productId ]: !! isLoadingResult } ) );
		setErrorMap( ( prevState ) => ( { ...prevState, [ productId ]: { errorGenerating } } ) );

		setProductsData( ( prevState ) => ( { ...prevState, [ productId ]: {
			...prevState[ productId ],
			productId,
			res,
			req: ( () => req( {
				postId: productId,
				settings: {
					[ IMAGE_RATIO ]: ratio,
					[ IMAGE_BACKGROUND_COLOR ]: bgColor,
				},
				image,
			} ) ),
			wasGenerated: res?.result?.[ 0 ] !== undefined,
			data: {
				productId,
				...( ! errorGenerating ? res?.result?.[ 0 ] ?? image ?? prevState[ productId ]?.image : {} ),
				seed: productId,
				isChecked: prevState[ productId ]?.data?.isChecked ?? true,
				isLoading: isLoadingResult,
				checkboxColor: checkboxColorMap[ productId ] ?? 'rgba(0, 0, 0, 0.54)',
			} } } ) );
	}, [ checkboxColorMap ] );
	const isLoading = errorlessProducts.some( ( { productId } ) => loadingMap[ productId ] );
	const isError = Object.values( errorMap ).length && Object.values( errorMap ).every( ( { errorGenerating } ) => errorGenerating );
	const handleSubmit = useCallback( ( event ) => {
		event.preventDefault();

		setGenerate();
		setWasGeneratedOnce( true );
		const isLightColor = ( color ) => {
			const rgb = parseInt( color.slice( 1 ), 16 ); // Convert hex to decimal
			// eslint-disable-next-line no-bitwise
			const r = ( rgb >> 16 ) & 0xff;
			// eslint-disable-next-line no-bitwise
			const g = ( rgb >> 8 ) & 0xff;
			// eslint-disable-next-line no-bitwise
			const b = ( rgb >> 0 ) & 0xff;
			const luminance = ( 0.299 * r ) + ( 0.587 * g ) + ( 0.114 * b );
			return luminance > 128;
		};

		const productsToUnify = ( errorlessProducts.length ? errorlessProducts : Object.values( productsData ) )
			.filter( ( product ) => product.data?.isChecked && product.req );

		const newCheckboxColor = isLightColor( generatedBgColor ) ? 'rgba(0, 0, 0, 0.54)' : 'rgba( 255, 255, 255, 0.7 )';
		if ( productsToUnify.find( ( product ) => checkboxColorMap[ product.productId ] !== newCheckboxColor ) ) {
			setCheckboxColorMap( ( prevState ) => {
				const newColorMap = { ...prevState };
				productsToUnify.forEach( ( product ) => {
					newColorMap[ product.productId ] = newCheckboxColor;
				} );
				return newColorMap;
			} );
		}

		productsToUnify.forEach( ( product ) => product.req().catch( ( ) => {} ) );
	}, [ checkboxColorMap, errorlessProducts, generatedBgColor, setGenerate ] );

	const getCols = ( dataLength = 1 ) => {
		return Math.min( Math.ceil( Math.sqrt( dataLength ?? 1 ) ), 4 );
	};

	return (
		<View>
			<View.Panel>
				<View.PanelHeading
					primary={ __( 'Unify images', 'elementor' ) }
					secondary={ __( 'Select a set of parameters and AI will automate your adjustments:', 'elementor' ) }
				/>
				{ isError && <View.ErrorMessage error={ Object.values( errorMap )?.[ 0 ]?.errorGenerating } onRetry={ handleSubmit } /> }
				<Stack gap={ 2 }>
					<Box
						sx={ {
							display: 'flex',
							flexWrap: 'wrap',
							width: '100%',
							'& .MuiAvatar-root': {
								margin: 0.5,
							},
						} }
					>
						{ products?.images.slice( 0, 9 ).map( ( img ) =>
							<Avatar
								key={ img.productId }
								alt={ img.productId + '' }
								src={ img.image_url }
								variant="square"
								sx={ {
									width: 50,
									height: 50,
								} } /> ) }
						{ ( ( products?.images?.length ?? 0 ) - 9 > 0 ) && <Avatar variant="square" sx={ { bgcolor: 'lightgray', width: 50, height: 50 } }>
							{ ( products?.images?.length ?? 0 ) - 9 }
						</Avatar> }
					</Box>
					<ImageForm onSubmit={ handleSubmit }>
						<Stack gap={ 2 } sx={ { my: 2.5 } }>
							<ColorInput
								label={ __( 'Background Color', 'elementor' ) }
								color={ generatedBgColor }
								onChange={ ( color ) => updateSettings( { [ IMAGE_BACKGROUND_COLOR ]: color } ) }
								disabled={ isLoading }
							/>
							<ImageRatioSelect
								disabled={ true }
								value={ generatedAspectRatio }
								onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
							/>
							<Stack gap={ 2 } sx={ { my: 2.5 } }>
								{
									wasGeneratedOnce ? (
										<GenerateAgainSubmit disabled={ isLoading } />
									) : (
										<GenerateSubmit disabled={ isLoading } />
									)
								}
							</Stack>
						</Stack>

					</ImageForm>
				</Stack>
			</View.Panel>
			<View.Content isGenerating={ isSavingImages }>
				<Box sx={ { display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '76vh' } }>
					<Box sx={ { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' } }>
						{ wasGeneratedOnce ? <ImagesDisplay
							images={ errorlessProducts.map( ( product ) => product.data ) }
							cols={ getCols( errorlessProducts.length ?? 1 ) }
							overlay={ false }
							onSelectChange={ ( productId, isChecked ) => setProductsData( ( prevState ) => {
								if ( prevState[ productId ]?.data ) {
									prevState[ productId ].data.isChecked = isChecked;
								}
								return { ...prevState };
							} ) }
						/> : <Box
							component="img"
							src={ window.UnifyProductImagesConfig.placeholder }
							alt={ __( 'Example GIF', 'elementor' ) }
						/> }
					</Box>
					{ wasGeneratedOnce && ! isError && errorlessProducts.length &&
					errorlessProducts.some( ( { data, errorGenerating, wasGenerated } ) =>
						data?.isChecked && ! data?.isLoadingResult && ! errorGenerating && wasGenerated ) &&
						<ImageActions.UseImage onClick={ use } sx={ { alignSelf: 'flex-end', mt: 2 } } />
					}
				</Box>
			</View.Content>
			{ products.images
				?.filter( ( img ) => img.productId )
				.map( ( img ) => <ProductImage key={ `product-${ img.productId }` }
					productId={ img.productId }
					ratio={ settings[ IMAGE_RATIO ] }
					bgColor={ settings[ IMAGE_BACKGROUND_COLOR ] }
					image={ img }
					onUpdate={ onProductUpdate } /> ) }
		</View>
	);
};

export default ProductImageUnification;
