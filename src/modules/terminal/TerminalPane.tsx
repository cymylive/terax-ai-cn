import { useTheme } from "@/modules/theme";
import type { SearchAddon } from "@xterm/addon-search";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useTerminalSession } from "./lib/useTerminalSession";

export type TerminalPaneHandle = {
  write: (data: string) => void;
  focus: () => void;
  getBuffer: (maxLines?: number) => string | null;
  getSelection: () => string | null;
};

type Props = {
  /** Stable identifier for this leaf (passed back through callbacks). */
  leafId: number;
  /** Tab containing this pane is on screen. */
  visible: boolean;
  /** This leaf is the active pane within its tab — receives auto-focus. */
  focused?: boolean;
  initialCwd?: string;
  onSearchReady?: (leafId: number, addon: SearchAddon) => void;
  onExit?: (leafId: number, code: number) => void;
  onCwd?: (leafId: number, cwd: string) => void;
};

function formatPath(path: string): string {
  return path.includes(" ") ? `"${path}"` : path;
}

export const TerminalPane = forwardRef<TerminalPaneHandle, Props>(
  function TerminalPane(
    {
      leafId,
      visible,
      focused = true,
      initialCwd,
      onSearchReady,
      onExit,
      onCwd,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const focusedRef = useRef(focused);
    focusedRef.current = focused;

    const session = useTerminalSession({
      leafId,
      container: containerRef,
      visible,
      focused,
      initialCwd,
      onSearchReady: (a) => onSearchReady?.(leafId, a),
      onExit: (c) => onExit?.(leafId, c),
      onCwd: (c) => onCwd?.(leafId, c),
    });

    useEffect(() => {
      // Defer one frame so CSS-variable token resolution sees the new class.
      const id = requestAnimationFrame(() => session.applyTheme());
      return () => cancelAnimationFrame(id);
    }, [resolvedTheme, session]);

    useEffect(() => {
      let unlisten: (() => void) | undefined;

      getCurrentWindow()
        .onDragDropEvent((event) => {
          if (event.payload.type !== "drop") return;
          if (!focusedRef.current) return;
          const paths = event.payload.paths as string[] | undefined;
          if (!paths || paths.length === 0) return;
          const formatted = paths.map(formatPath).join(" ");
          session.write(formatted + " ");
        })
        .then((fn) => {
          unlisten = fn;
        });

      return () => {
        unlisten?.();
      };
    }, [session]);

    useImperativeHandle(
      ref,
      () => ({
        write: (data: string) => session.write(data),
        focus: () => session.focus(),
        getBuffer: (max?: number) => session.getBuffer(max),
        getSelection: () => session.getSelection(),
      }),
      [session],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);

    return (
      <div
        ref={containerRef}
        className="zoom-exempt h-full w-full"
        style={{
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    );
  },
);
