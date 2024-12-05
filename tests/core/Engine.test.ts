import { test, expect } from "bun:test";
import { TradingEngine } from '../../src/core/Engine';

let engine: TradingEngine;

test('should start the engine', () => {
    engine = TradingEngine.getInstance();
    engine.start();
    expect(engine.isEngineRunning()).toBe(true);
});

test('should stop the engine', () => {
    engine = TradingEngine.getInstance();
    engine.start();
    engine.stop();
    expect(engine.isEngineRunning()).toBe(false);
});
