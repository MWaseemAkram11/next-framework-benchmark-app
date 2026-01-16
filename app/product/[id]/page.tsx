'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiService, type Product } from '@/lib/api';
import Loader from '@/components/Loader';


export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }

    const unsubscribe = apiService.onRedisToggle(() => {
      if (params.id) {
        loadProduct(params.id as string);
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  async function loadProduct(id: string) {
    setLoading(true);
    try {
      const response = await apiService.getProductDetail(id);
      console.log('PDP API Response:', response);
      
      if (response && response.products && response.products.length > 0) {
        setProduct(response.products[0]);
      }
    } catch (error) {
      console.error('Failed to load product', error);
    } finally {
      setLoading(false);
    }
  }

  function parseHighlights(jsonString: string): string[] {
    if (!jsonString) return [];
    
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (Array.isArray(item)) return item[0];
          if (typeof item === 'string') return item;
          return item?.text || item?.value || '';
        }).filter((i: any) => i);
      }
      return [];
    } catch (e) {
      console.error('Failed to parse highlights:', e);
      return [];
    }
  }

  function getDescription(): string {
    if (!product) return '';
    return product.attributes?.description || 
           product.attributes?.short_description || 
           '';
  }

  function hasHighlights(): boolean {
    return !!(product?.attributes?.listing_highlights_section);
  }

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">Sorry, we couldn&apos;t load this product.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex text-sm mb-8 text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-3 text-gray-300">/</span>
          <Link href="/category/55873" className="hover:text-blue-600 transition-colors">Products</Link>
          <span className="mx-3 text-gray-300">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.attributes?.name || product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gray-50/50 group-hover:bg-transparent transition-colors duration-500"></div>
            <img
              src={product.attributes?.image || product.image || `https://media.box.co.uk/product${product.media_gallery?.[0]?.file}`}
              alt={product.attributes?.name || product.name}
              width="500"
              height="500"
              className="relative z-10 max-h-[500px] w-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full">
                {product.attributes?.brand || product.brand || 'MOZA'}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {product.attributes?.name || product.name}
            </h1>

            <div className="flex items-end space-x-4 mb-8 pb-8 border-b border-gray-100">
              <div className="text-5xl font-bold text-gray-900 tracking-tight">
                £{(typeof product.price === 'object' ? product.price?.price : product.price)?.toFixed(2)}
              </div>
             {((product as any)?.attributes?.stock_msg || (product as any)?.stock_msg) && (
                <div className="px-4 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-bold flex items-center mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {(product as any)?.attributes?.stock_msg || (product as any)?.stock_msg || 'In Stock'}
                </div>
                )}
            </div>

            <div className="prose prose-blue max-w-none text-gray-600 mb-8">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Product Highlights</h3>

              {hasHighlights() && (
                <ul className="space-y-2 list-none pl-0">
                  {parseHighlights(product.attributes!.listing_highlights_section!).map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}

              {!hasHighlights() && getDescription() && (
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getDescription() }}></div>
              )}

              {!hasHighlights() && !getDescription() && (
                <p className="text-gray-500 italic">No detailed description available for this product.</p>
              )}
            </div>

            <div className="mt-auto flex space-x-4">
              <button className="flex-1 bg-gray-900 text-white px-8 py-5 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300 flex items-center justify-center">
                Add to Basket
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between text-xs text-gray-400 uppercase tracking-widest font-semibold">
              <p>SKU: {product.sku || product.attributes?.sku || 'N/A'}</p>
              <p>Free Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}