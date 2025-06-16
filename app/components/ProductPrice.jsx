import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  return (
    <div className="product-price flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      {compareAtPrice ? (
        <div className="product-price-on-sale flex items-center space-x-2">
          {price ? (
            <span className="text-lg font-semibold text-green-600">
              <Money data={price} />
            </span>
          ) : null}
          <s className="text-sm text-red-500 line-through">
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <span className="text-lg font-semibold text-gray-800">
          <Money data={price} />
        </span>
      ) : (
        <span className="text-sm text-gray-400">&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
