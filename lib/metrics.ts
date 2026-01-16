// Accurate performance metrics tracking using web-vitals
import { onLCP, onCLS, onINP, onTTFB, type Metric } from 'web-vitals';
export interface PerformanceMetrics {
    lcp: number;
    cls: number;
    inp: number;
    ttfb: number;
    bundleSize: number;
    processingTime: number;
}
class MetricsService {
    private startTime = typeof window !== 'undefined' ? performance.now() : 0;
    private metrics: PerformanceMetrics = {
        lcp: 0,
        cls: 0,
        inp: 0,
        ttfb: 0,
        bundleSize: 0,
        processingTime: 0
    };
    private listeners: Array<(metrics: PerformanceMetrics) => void> = [];
    constructor() {
        if (typeof window !== 'undefined') {
            this.initMetrics();
            this.trackProcessingTime();
        }
    }
    private initMetrics() {
        // reportAllChanges: true ensures we get the current value even if it hasn't "finalized"
        onLCP((metric: Metric) => this.updateMetric('lcp', metric.value), { reportAllChanges: true });
        onCLS((metric: Metric) => this.updateMetric('cls', metric.value), { reportAllChanges: true });
        onINP((metric: Metric) => this.updateMetric('inp', metric.value), { reportAllChanges: true });
        onTTFB((metric: Metric) => this.updateMetric('ttfb', metric.value));
        this.estimateBundleSize();
    }
    private trackProcessingTime() {
        setInterval(() => {
            const processingTime = performance.now() - this.startTime;
            this.updateMetric('processingTime', processingTime);
        }, 100);
    }
    private updateMetric(key: keyof PerformanceMetrics, value: number) {
        // Only round LCP, INP, TTFB, and ProcessingTime to integers for display, 
        // but keep CLS as a high-precision decimal.
        const newValue = key === 'cls' ? value : Math.round(value);
        if (this.metrics[key] !== newValue) {
            this.metrics[key] = newValue;
            this.notifyListeners();
        }
    }
    private estimateBundleSize() {
        setTimeout(() => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                const jsResources = resources.filter(r => r.name.endsWith('.js'));
                const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
                this.updateMetric('bundleSize', totalSize / 1024);
            }
        }, 2000);
    }
    subscribe(callback: (metrics: PerformanceMetrics) => void) {
        this.listeners.push(callback);
        callback(this.metrics);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    private notifyListeners() {
        if (typeof window !== 'undefined') {
            this.listeners.forEach(listener => listener({ ...this.metrics }));
        }
    }
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }
}
export const metricsService = new MetricsService();