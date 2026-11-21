import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { useDashboardStore } from '../src/app/dashboardStore';

window.scrollTo = vi.fn();

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

// jsdom не вимірює розміри елементів. Самі графіки тут не підміняються.
class TestResizeObserver implements ResizeObserver {
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { width: 640, height: 300 },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
}
vi.stubGlobal('ResizeObserver', TestResizeObserver);

afterEach(cleanup);
