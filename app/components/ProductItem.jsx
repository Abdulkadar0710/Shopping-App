import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useI18n} from '~/components/I18nContext';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */


export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  const data = useLoaderData();
  console.log('ProductItem data: ', data);

  const i18n = useI18n();

  console.log('i18n: ', i18n);

  return (
    <Link
      className="product-item block bg-white shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <Image
          alt={image.altText || product.title}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-800 truncate">
          {/* {i18n.t(product.title)} */}
        </h4>
        <small className="text-gray-600">
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
