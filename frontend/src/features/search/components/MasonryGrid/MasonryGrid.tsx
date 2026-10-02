"use client";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./masonry-grid.module.scss";

type Props<T> = {
  items: T[];
  getKey: (item: T) => string | number;
  getAspect: (item: T) => number;
  renderItem: (item: T, index: number) => ReactNode;
  captionHeight: number;
  minColumnWidth?: number;
  gap?: number;
};

// Each item in the grid goes into the currently shortest column.
export default function MasonryGrid<T>({
  items,
  getKey,
  getAspect,
  renderItem,
  captionHeight,
  minColumnWidth = 220,
  gap = 24,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Measure before paint so the first frame already has the right number of columns.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (!width) return [];
    const count = Math.max(2, Math.floor((width + gap) / (minColumnWidth + gap)));
    const columnWidth = (width - gap * (count - 1)) / count;
    const heights = new Array<number>(count).fill(0);
    const cols: { item: T; index: number }[][] = Array.from({ length: count }, () => []);

    items.forEach((item, index) => {
      let shortest = 0;
      for (let c = 1; c < count; c++) if (heights[c] < heights[shortest]) shortest = c;
      cols[shortest].push({ item, index });
      heights[shortest] += columnWidth / getAspect(item) + captionHeight + gap;
    });
    return cols;
  }, [items, width, gap, minColumnWidth, captionHeight, getAspect]);

  return (
    <div ref={ref} className={styles.grid} style={{ gap }}>
      {columns.map((column, c) => (
        <ul key={c} className={styles.column} style={{ gap }}>
          {column.map(({ item, index }) => (
            <li key={getKey(item)}>{renderItem(item, index)}</li>
          ))}
        </ul>
      ))}
    </div>
  );
}
