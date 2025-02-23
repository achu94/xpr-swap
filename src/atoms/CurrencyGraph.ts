import type { TradingPairType } from "@/store/tradingPairStore";
import TinyQueue from "tinyqueue";

type CurrencyGraphStructure = {
    [key: string]: { [key: string]: number };
};

export default class CurrencyGraph {
    graph: CurrencyGraphStructure;
    minHeap: TinyQueue<[number, string, string | null]>;
    markets: TradingPairType[];

    constructor(markets: TradingPairType[]) {
        this.graph = {};
        this.minHeap = new TinyQueue([], (a, b) => a[0] - b[0]);
        this.markets = markets;

        this.buildGraph();
    }

    buildGraph(): void {
        this.markets.forEach(market => {
            if (!market.active) return;
            if (!market.pool1.quantity || !market.pool2.quantity) return;

            const firstPool = this.getPoolQuantityAndSymbol(market.pool1.quantity);
            const secondPool = this.getPoolQuantityAndSymbol(market.pool2.quantity);

            if (!firstPool || !secondPool) return;

            const pool1Amount = parseFloat(firstPool.quantity);
            const pool2Amount = parseFloat(secondPool.quantity);

            if (isNaN(pool1Amount) || isNaN(pool2Amount)) return;

            const fee = market.fee.exchange_fee === null ? 0 : market.fee.exchange_fee;

            const rateForward = this.calculateRate(
                pool1Amount,
                pool2Amount,
                fee
            );
            const rateBackward = this.calculateRate(
                pool2Amount,
                pool1Amount,
                fee
            );

            this.addEdge(firstPool.symbol, secondPool.symbol, rateForward);
            this.addEdge(secondPool.symbol, firstPool.symbol, rateBackward);
        });
    }

    private getPoolQuantityAndSymbol(poolQuantity: string): {
        quantity: string;
        symbol: string;
    } | null {
        const poolItems = poolQuantity.split(' ');
        if (poolItems.length < 2) return null;

        return {
            quantity: poolItems[0],
            symbol: poolItems[1]
        };
    }

    private calculateRate(pool1: number, pool2: number, fee: number): number {
        if (pool1 === 0) return 0;
        const feeMultiplier = 1 - (fee || 0) / 1000;
        return (pool2 / pool1) * feeMultiplier;
    }

    private addEdge(from: string, to: string, rate: number): void {
        if (!this.graph[from]) {
            this.graph[from] = {};
        }
        this.graph[from][to] = rate;
    }

    convertCurrency(
        startCurrency: string,
        targetCurrency: string,
        amount: number
    ): { amount: number; path: string[]; rate: number } {
        if (!this.graph[startCurrency] || !this.graph[targetCurrency]) {
            throw new Error("Invalid currency");
        }

        this.minHeap = new TinyQueue([], (a, b) => a[0] - b[0]);
        this.minHeap.push([1.0, startCurrency, null]);

        const visited = new Set<string>();
        const predecessors = new Map<string, string | null>();
        const rates: { [key: string]: number } = { [startCurrency]: 1.0 };

        while (this.minHeap.length > 0) {
            const [currentRate, currentCurrency, predecessor] = this.minHeap.pop()!;

            if (visited.has(currentCurrency)) continue;
            visited.add(currentCurrency);
            predecessors.set(currentCurrency, predecessor);

            if (currentCurrency === targetCurrency) {
                return {
                    amount: amount * currentRate,
                    path: this.reconstructPath(predecessors, targetCurrency),
                    rate: currentRate,
                };
            }

            const neighbors = this.graph[currentCurrency] || {};
            for (const [neighbor, rate] of Object.entries(neighbors)) {
                if (!visited.has(neighbor)) {
                    const newRate = currentRate * rate;
                    if (!rates[neighbor] || newRate > rates[neighbor]) {
                        rates[neighbor] = newRate;
                        this.minHeap.push([newRate, neighbor, currentCurrency]);
                    }
                }
            }
        }

        throw new Error("No conversion path found");
    }

    private reconstructPath(
        predecessors: Map<string, string | null>,
        targetCurrency: string
    ): string[] {
        const path: string[] = [];
        let current: string | null | undefined = targetCurrency;

        while (current !== null && current !== undefined) {
            path.unshift(current);
            current = predecessors.get(current);
        }

        return path;
    }
}