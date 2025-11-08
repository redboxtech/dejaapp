// @ts-nocheck
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

const DEFAULT_DAYS_OF_WEEK = [
  { value: "Segunda", label: "Segunda" },
  { value: "Terça", label: "Terça" },
  { value: "Quarta", label: "Quarta" },
  { value: "Quinta", label: "Quinta" },
  { value: "Sexta", label: "Sexta" },
  { value: "Sábado", label: "Sábado" },
  { value: "Domingo", label: "Domingo" },
];

const DEFAULT_START_HOUR = 0;
const DEFAULT_END_HOUR = 24;
const DEFAULT_CELL_HEIGHT = 60;

export interface WeeklyCalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  daysOfWeek: string[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color?: string;
  borderColor?: string;
  metadata?: Record<string, unknown>;
}

export interface WeeklyCalendarProps {
  events: WeeklyCalendarEvent[];
  onEventClick?: (event: WeeklyCalendarEvent) => void;
  renderEventContent?: (event: WeeklyCalendarEvent) => ReactNode;
  daysOfWeek?: { value: string; label: string }[];
  startHour?: number;
  endHour?: number;
  className?: string;
  cellHeight?: number;
  showCurrentTime?: boolean;
}

export function WeeklyCalendar({
  events,
  onEventClick,
  renderEventContent,
  daysOfWeek = DEFAULT_DAYS_OF_WEEK,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  className = "",
  cellHeight = DEFAULT_CELL_HEIGHT,
  showCurrentTime = true,
}: WeeklyCalendarProps) {
  const hourCellRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [measuredCellHeight, setMeasuredCellHeight] =
    useState<number>(cellHeight);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<number>(40);
  const [gridWidth, setGridWidth] = useState<number>(0);

  useEffect(() => {
    const measure = () => {
      if (hourCellRef.current) {
        const rect = hourCellRef.current.getBoundingClientRect();
        setMeasuredCellHeight(rect.height || cellHeight);
        const parent = hourCellRef.current.parentElement;
        if (parent) {
          const childTop =
            (
              parent.firstElementChild as HTMLElement | null
            )?.getBoundingClientRect().top || 0;
          const slotsTop = hourCellRef.current.getBoundingClientRect().top;
          const headerH = Math.max(0, Math.round(slotsTop - childTop));
          setMeasuredHeaderHeight(headerH || 40);
        }
      }
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth || 0);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cellHeight]);

  const hours = useMemo(() => {
    const safeStart = Math.max(0, Math.min(23, startHour));
    const safeEnd = Math.max(safeStart + 1, Math.min(24, endHour));
    return Array.from(
      { length: safeEnd - safeStart },
      (_, index) => safeStart + index
    );
  }, [startHour, endHour]);

  const scheduleBlocks = useMemo(() => {
    if (!events || events.length === 0) return [];

    const hourColWidthPx = 80;
    const dayColWidthPx =
      gridWidth > hourColWidthPx
        ? (gridWidth - hourColWidthPx) / daysOfWeek.length
        : 0;
    const cellH = measuredCellHeight;
    const headerH = measuredHeaderHeight;
    const fragments: React.ReactNode[] = [];

    const renderContent = (event: WeeklyCalendarEvent) => {
      if (renderEventContent) return renderEventContent(event);
      return (
        <div className="flex flex-col gap-0.5">
          <div className="text-[10px] font-semibold truncate">
            {event.title}
          </div>
          {event.subtitle && (
            <div className="text-[9px] opacity-90 truncate">
              {event.subtitle}
            </div>
          )}
          <div className="text-[9px] opacity-90">
            {`${event.startTime} - ${event.endTime}`}
          </div>
          {event.description && (
            <div className="text-[8px] opacity-80 truncate">
              {event.description}
            </div>
          )}
        </div>
      );
    };

    events.forEach((event) => {
      const blockColor = event.color || "#16808c";
      const borderColor = event.borderColor || blockColor;

      event.daysOfWeek.forEach((dayName) => {
        const dayIndex = daysOfWeek.findIndex((d) => d.value === dayName);
        if (dayIndex === -1) return;

        const [startH, startM] = event.startTime.split(":").map(Number);
        const [endH, endM] = event.endTime.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const crossesMidnight = endMinutes <= startMinutes;
        const leftPx =
          hourColWidthPx + dayIndex * dayColWidthPx + 4; /* gutter */
        const widthPx = Math.max(0, dayColWidthPx - 8);

        const createBlock = (
          key: string,
          top: number,
          height: number,
          content: React.ReactNode,
          customLeft = leftPx
        ) => {
          fragments.push(
            <div
              key={key}
              className="absolute text-white rounded-md p-1.5 cursor-pointer transition-colors z-20 border-l-4 shadow-sm group overflow-hidden"
              style={{
                left: `${customLeft}px`,
                width: `${widthPx}px`,
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: blockColor,
                borderLeftColor: borderColor,
              }}
              onClick={() => onEventClick?.(event)}
              title={`${event.title} • ${event.startTime} - ${event.endTime}`}
            >
              {content}
            </div>
          );
        };

        if (crossesMidnight) {
          const minutesUntilMidnight = 24 * 60 - startMinutes;
          const firstHeight = (minutesUntilMidnight / 60) * cellH;
          const topOffset = headerH + (startH - startHour) * cellH;
          createBlock(
            `${event.id}-${dayName}-part1`,
            topOffset,
            firstHeight,
            renderContent({
              ...event,
              endTime: "23:59",
            })
          );

          const nextDayIndex = (dayIndex + 1) % daysOfWeek.length;
          const nextDayName = daysOfWeek[nextDayIndex].value;
          if (event.daysOfWeek.includes(nextDayName)) {
            const secondHeight = (endMinutes / 60) * cellH;
            const nextLeft =
              hourColWidthPx + nextDayIndex * dayColWidthPx + 4;
            createBlock(
              `${event.id}-${nextDayName}-part2`,
              headerH,
              secondHeight,
              renderContent({
                ...event,
                startTime: "00:00",
              }),
              nextLeft
            );
          }
        } else {
          const durationMinutes = endMinutes - startMinutes;
          const heightPx = (durationMinutes / 60) * cellH;
          const topOffset = headerH + (startH - startHour) * cellH;
          createBlock(
            `${event.id}-${dayName}`,
            topOffset,
            heightPx,
            renderContent(event)
          );
        }
      });
    });

    return fragments;
  }, [
    events,
    daysOfWeek,
    gridWidth,
    measuredCellHeight,
    measuredHeaderHeight,
    onEventClick,
    renderEventContent,
    startHour,
  ]);

  const nowIndicator = useMemo(() => {
    if (!showCurrentTime) return null;
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 (Domingo) - 6 (Sábado)

    // Ajustar para a ordem customizada (começando em Segunda)
    const dayMap: Record<string, number> = {
      Domingo: 0,
      Segunda: 1,
      Terça: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
      Sábado: 6,
    };

    const normalizedIndex = (() => {
      // Encontrar label que corresponde ao dia atual
      const dayName =
        currentDayIndex === 0
          ? "Domingo"
          : currentDayIndex === 6
          ? "Sábado"
          : DEFAULT_DAYS_OF_WEEK[currentDayIndex - 1]?.value;
      if (!dayName) return -1;
      return daysOfWeek.findIndex((d) => d.value === dayName);
    })();

    if (normalizedIndex === -1) return null;

    const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
    if (now.getHours() < startHour || now.getHours() >= endHour) return null;

    const headerHeight = measuredHeaderHeight;
    const cellH = measuredCellHeight;
    const hourColWidthPx = 80;
    const dayColWidthPx =
      gridWidth > hourColWidthPx
        ? (gridWidth - hourColWidthPx) / daysOfWeek.length
        : 0;
    const topOffset =
      headerHeight + ((minutesFromMidnight - startHour * 60) / 60) * cellH;
    const leftPx = hourColWidthPx + normalizedIndex * dayColWidthPx + 2;

    return (
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          top: `${topOffset}px`,
          left: `${leftPx}px`,
          width: `${Math.max(0, dayColWidthPx - 4)}px`,
          height: "2px",
          background:
            "repeating-linear-gradient(to right, #ef4444, #ef4444 12px, transparent 12px, transparent 16px)",
        }}
        aria-hidden
      />
    );
  }, [
    daysOfWeek,
    gridWidth,
    measuredCellHeight,
    measuredHeaderHeight,
    showCurrentTime,
    startHour,
    endHour,
  ]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-[800px] flex flex-col">
        <div
          className="grid gap-1 mb-1 sticky top-0 z-30"
          style={{
            gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="font-semibold text-gray-700 p-2 text-sm border-b-2 border-gray-300 bg-gray-50 sticky left-0 z-40">
            Hora
          </div>
          {daysOfWeek.map((day) => (
            <div
              key={day.value}
              className="font-semibold text-gray-700 p-2 text-center text-sm border-b-2 border-gray-300 bg-gray-50"
            >
              {day.label}
            </div>
          ))}
        </div>

        <div className="relative">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(0, 1fr))`,
            }}
            ref={gridRef}
          >
            <div className="flex flex-col">
              <div className="h-10" />
              {hours.map((hour) => (
                <div
                  key={hour}
                  ref={hour === startHour ? hourCellRef : undefined}
                  className="font-medium text-gray-600 p-2 text-xs bg-gray-50 border-r border-b border-gray-200 h-[60px] flex items-center sticky left-0 z-20"
                >
                  {`${hour.toString().padStart(2, "0")}:00`}
                </div>
              ))}
            </div>

            {daysOfWeek.map((day) => (
              <div key={day.value} className="flex flex-col">
                <div className="h-10" />
                <div className="relative">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`h-[60px] border border-gray-200 relative ${
                        hour % 2 === 1 ? "bg-gray-50/60" : "bg-white"
                      }`}
                      data-day={day.value}
                      data-hour={hour}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {nowIndicator}
          {scheduleBlocks}
        </div>
      </div>
    </div>
  );
}


