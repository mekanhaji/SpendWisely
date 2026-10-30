import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { haptic } from "@/lib/pwa";
import { cn } from "@/lib/utils";

/** Distance dragged left before letting go deletes. */
const DELETE_THRESHOLD = 88;
/** Movement before a touch is read as a swipe (or as a scroll). */
const LOCK_DISTANCE = 8;
const SLIDE_OUT_MS = 180;

type SwipeableRowProps = {
  children: React.ReactNode;
  onSwipeDelete: () => void;
  className?: string;
};

/**
 * Swipe a row left to delete it. Vertical drags still scroll the page
 * (touch-action: pan-y), and a drag never counts as a tap on the row. Swiping
 * is a shortcut only: every delete also has a keyboard-reachable button in the
 * edit sheet.
 */
const SwipeableRow = ({
  children,
  onSwipeDelete,
  className,
}: SwipeableRowProps) => {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef(0);
  const gesture = useRef<{
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const didDrag = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const crossedThreshold = useRef(false);

  const move = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
    };
    didDrag.current = false;
    crossedThreshold.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.axis === null) {
      if (Math.abs(dx) < LOCK_DISTANCE && Math.abs(dy) < LOCK_DISTANCE) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "x") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // The pointer already ended; the drag still works without capture.
        }
        setDragging(true);
      }
    }
    if (current.axis !== "x") return;

    didDrag.current = true;
    const width = rowRef.current?.offsetWidth ?? 0;
    // Left only, and never past the row's own width.
    move(Math.max(-width, Math.min(0, dx)));

    // One tick as the delete point is crossed, so it can be felt.
    const past = offsetRef.current <= -DELETE_THRESHOLD;
    if (past !== crossedThreshold.current) {
      crossedThreshold.current = past;
      if (past) haptic(8);
    }
  };

  const handlePointerEnd = () => {
    const current = gesture.current;
    gesture.current = null;
    if (current?.axis !== "x") return;

    setDragging(false);
    if (offsetRef.current <= -DELETE_THRESHOLD) {
      move(-(rowRef.current?.offsetWidth ?? 0));
      window.setTimeout(onSwipeDelete, SLIDE_OUT_MS);
    } else {
      move(0);
    }
  };

  return (
    <div
      ref={rowRef}
      // The red backdrop only exists mid-swipe, so it can't peek out at the
      // row's edges at rest.
      className={cn(
        "relative overflow-hidden",
        offset < 0 && "bg-destructive",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center text-destructive-foreground"
      >
        <Trash2 className="h-5 w-5" />
      </div>
      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : `transform ${SLIDE_OUT_MS}ms ease-out`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        // A swipe ends with a click on the row; it must not open the editor.
        onClickCapture={(event) => {
          if (didDrag.current) {
            event.preventDefault();
            event.stopPropagation();
            didDrag.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableRow;
