"use client";

import { useEffect, useRef, useState } from "react";
import { realtime, type ConnectionState, type RealtimeEvent } from "./index";

/** Subscribe to realtime events of one type. Handler identity changes don't resubscribe. */
export function useRealtimeEvent<T extends RealtimeEvent["type"]>(type: T, handler: (e: Extract<RealtimeEvent, { type: T }>) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(
    () =>
      realtime.subscribe((e) => {
        if (e.type === type) ref.current(e as Extract<RealtimeEvent, { type: T }>);
      }),
    [type],
  );
}

export function useConnectionState() {
  const [state, setState] = useState<ConnectionState>("online");
  useEffect(() => realtime.onConnection(setState), []);
  return state;
}
