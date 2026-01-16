'use client';
import { useEffect, useState } from 'react';
import { metricsService, type PerformanceMetrics } from '@/lib/metrics';
export default function Footer() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        lcp: 0,
        cls: 0,
        inp: 0,
        ttfb: 0,
        bundleSize: 0,
        processingTime: 0
    });
    useEffect(() => {
        const unsubscribe = metricsService.subscribe((newMetrics) => {
            setMetrics(newMetrics);
        });
        return () => unsubscribe();
    }, []);
    return (
        <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
            <div className="container mx-auto max-w-6xl flex justify-between items-center">
                <div className="text-xs text-gray-400 font-medium">
                    © 2026 Rivo-Benchmark Inc. layout v2.0
                </div>
                <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500">LCP:</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {metrics.lcp}ms
                        </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Processing Time:</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {(metrics.processingTime / 1000).toFixed(2)}s
                        </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${metrics.lcp > 0 && metrics.lcp < 2500 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className={`font-medium ${metrics.lcp > 0 && metrics.lcp < 2500 ? 'text-green-700' : 'text-yellow-700'}`}>
                            {metrics.lcp > 0 && metrics.lcp < 2500 ? 'Optimal' : (metrics.lcp === 0 ? 'Calculating...' : 'Needs Review')}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}