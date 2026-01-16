'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiService, type Product } from '@/lib/api';
import Loader from '@/components/Loader';

export default function ProductListing() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProducts();

    const unsubscribe = apiService.onRedisToggle(() => {
      loadProducts();
    });

    return () => unsubscribe();
  }, [currentPage]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await apiService.getProducts(currentPage);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  }

  function changePage(page: number) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex text-gray-500 text-sm mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-semibold">Products</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          {!loading && <p className="text-gray-500 mt-1">Showing {products.length} items</p>}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
            {/* Image Area */}
            <div className="relative h-64 bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={product.media_gallery?.[0]?.file?.startsWith('http') 
                  ? product.media_gallery[0].file 
                  : `https://media.box.co.uk/product${product.media_gallery?.[0]?.file || product.attributes?.image || product.image}`}
                alt={product.attributes?.name || product.name}
                loading="lazy"
                width="256"
                height="256"
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <Link href={`/product/${product.id}`} className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-blue-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                  View
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                {product.attributes?.brand || product.brand || 'Brand'}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                <Link href={`/product/${product.id}`}>{product.attributes?.name || product.name}</Link>
              </h3>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-2xl font-bold text-gray-900">
                    £{(typeof product.price === 'object' ? product.price?.price : product.price)?.toFixed(2)}
                  </span>
                </div>
                <button className="bg-gray-900 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md">
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center space-x-2">
        <button
          disabled={currentPage === 1}
          onClick={() => changePage(currentPage - 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-900 font-medium">Page {currentPage}</span>
        <button
          onClick={() => changePage(currentPage + 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}