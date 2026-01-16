'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService, type Category } from '@/lib/api';
import { metricsService, type PerformanceMetrics } from '@/lib/metrics';
import Loader from '@/components/Loader';

export default function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        lcp: 0, cls: 0, inp: 0, ttfb: 0, bundleSize: 0, processingTime: 0
    });

    useEffect(() => {
        loadCategories();

        const unsubscribe = metricsService.subscribe((newMetrics) => {
            setMetrics(newMetrics);
        });

        const unsubscribeRedis = apiService.onRedisToggle(() => {
            loadCategories();
        });

        return () => {
            unsubscribe();
            unsubscribeRedis();
        };
    }, []);

    async function loadCategories() {
        setLoading(true);
        try {
            const cats = await apiService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loader />;

    return (
        <>
            {/* Breadcrumbs */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-3">
                <div className="text-sm text-gray-500 flex items-center">
                    <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">E-Menu</span>
                    <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-blue-600 font-medium">Home</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-8 py-10 max-w-6xl">
                {/* Stats Cards */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                    {/* LCP Card */}
                    <div className="px-6 py-3 bg-white border border-blue-200 rounded-xl shadow-sm ring-2 ring-blue-50 ring-offset-2 transition-all hover:shadow-md flex flex-col justify-center min-w-[140px]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">LCP</span>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-xl text-blue-700">{metrics.lcp}ms</span>
                            <span className={`w-2 h-2 rounded-full ${metrics.lcp > 0 && metrics.lcp < 2500 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        </div>
                    </div>
                    {/* CLS Card - Fixed Precision */}
                    <div className="w-auto min-w-[100px] h-auto p-3 flex flex-col justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer group">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">CLS</span>
                        <div className="font-bold text-lg text-gray-700 group-hover:text-gray-900">{metrics.cls.toFixed(4)}</div>
                    </div>
                    {/* INP Card */}
                    <div className="w-auto min-w-[100px] h-auto p-3 flex flex-col justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer group">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">INP</span>
                        <div className="font-bold text-lg text-gray-700 group-hover:text-gray-900">{metrics.inp}ms</div>
                    </div>
                    {/* TTFB Card */}
                    <div className="w-auto min-w-[100px] h-auto p-3 flex flex-col justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer group">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">TTFB</span>
                        <div className="font-bold text-lg text-gray-700 group-hover:text-gray-900">{metrics.ttfb}ms</div>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Categories Table</h2>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg shadow-gray-100/50">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Thumbnail</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category Name</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categories.map((cat, index) => (
                                    <tr key={`${cat.id}-${cat.name}-${index}`} className="group hover:bg-blue-50/30 transition-colors duration-200">
                                        <td className="px-6 py-4 w-24">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 p-1 border border-gray-100 group-hover:border-blue-200 transition-colors">
                                                <img src={cat.image} className="w-full h-full object-cover rounded-md" alt={cat.name} loading="lazy" width="48" height="48" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-base">{cat.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">ID: {cat.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200">Active</span>
                                                <span className="text-xs text-gray-400">24 Items</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/category/${cat.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                <span>Loading Data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
