import { useEffect, useRef, useState } from "react";
import { Card, PrimaryButton, Row, ScreenHeader, Segmented, Toggle } from "../components/ui";
import { cn } from "../utils/cn";
import { feedback } from "../utils/feedback";
import { randomInt, shuffle } from "../utils/random";

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[13px] font-semibold tracking-wide text-label/70 uppercase">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const n = parseInt(text, 10);
          if (Number.isFinite(n)) onChange(Math.max(-99999, Math.min(99999, n)));
          else setText(String(value));
        }}
        className="w-28 rounded-2xl bg-white/50 py-2.5 text-center text-[24px] font-bold text-label outline-none focus:bg-white/80"
      />
    </label>
  );
}

export function NumberGame({ onBack }: { onBack: () => void }) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [tick, setTick] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const rangeSize = hi - lo + 1;
  const canUnique = rangeSize >= count;

  const finalNumbers = () => {
    if (unique && canUnique) {
      if (rangeSize <= 5000) {
        const all = Array.from({ length: rangeSize }, (_, i) => lo + i);
        return shuffle(all).slice(0, count);
      }
      const set = new Set<number>();
      while (set.size < count) set.add(randomInt(lo, hi));
      return [...set];
    }
    return Array.from({ length: count }, () => randomInt(lo, hi));
  };

  const generate = () => {
    if (rolling) return;
    setRolling(true);
    feedback.tap();
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setResults(Array.from({ length: count }, () => randomInt(lo, hi)));
          setTick((t) => t + 1);
          if (i % 2 === 0) feedback.tick();
        }, i * 55),
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        setResults(finalNumbers());
        setTick((t) => t + 1);
        setRolling(false);
        feedback.thud();
      }, steps * 55 + 40),
    );
  };

  const big = results.length <= 1;

  return (
    <div className="scroll-y absolute inset-0">
      <ScreenHeader title="Number" onBack={onBack} backLabel="Games" />
      <div className="space-y-4 px-6 pb-10">
        <Card className="flex min-h-[200px] items-center justify-center px-6 py-8">
          {results.length === 0 ? (
            <span className="text-[96px] leading-none font-bold tracking-tight text-white/55">
              00
            </span>
          ) : (
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-3",
                big ? "" : "max-w-full",
              )}
            >
              {results.map((n, i) => (
                <span
                  key={`${tick}-${i}`}
                  className={cn(
                    "anim-number-roll font-extrabold tracking-tight text-white drop-shadow",
                    big
                      ? "text-[96px] leading-none"
                      : "min-w-[64px] rounded-2xl bg-white/25 px-3 py-2 text-center text-[32px] leading-none",
                  )}
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="px-5 py-5">
          <div className="flex items-center justify-center gap-4">
            <NumberField label="Min" value={min} onChange={setMin} />
            <span className="mt-5 text-2xl font-bold text-label/50">–</span>
            <NumberField label="Max" value={max} onChange={setMax} />
          </div>
        </Card>

        <Card>
          <div className="divide-y divide-white/25">
            <Row label="Amount" hint="How many numbers">
              <Segmented<number>
                value={count}
                onChange={setCount}
                options={[1, 2, 3, 5, 10].map((v) => ({ value: v, label: String(v) }))}
                className="w-[210px]"
              />
            </Row>
            <Row
              label="No duplicates"
              hint={canUnique ? "Each number appears once" : "Range too small for that"}
            >
              <Toggle checked={unique && canUnique} onChange={setUnique} label="No duplicates" />
            </Row>
          </div>
        </Card>

        <div className="flex justify-center pt-2">
          <PrimaryButton onClick={generate} disabled={rolling} className="w-full max-w-xs">
            {rolling ? "Generating…" : "Generate"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
