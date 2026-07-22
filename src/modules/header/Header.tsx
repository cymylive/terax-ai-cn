import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WindowControls } from "@/components/WindowControls";
import { IS_MAC, USE_CUSTOM_WINDOW_CONTROLS } from "@/lib/platform";
import type { Tab } from "@/modules/tabs";
import { TabBar } from "@/modules/tabs";
import {
  Cancel01Icon,
  GridViewIcon,
  LayoutTwoColumnIcon,
  LayoutTwoRowIcon,
  ListViewIcon,
  Settings01Icon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  SearchInline,
  type SearchInlineHandle,
  type SearchTarget,
} from "./SearchInline";

type Props = {
  tabs: Tab[];
  activeId: number;
  onSelect: (id: number) => void;
  onNew: () => void;
  onNewPrivate: () => void;
  onNewEditor: () => void;
  onClose: (id: number) => void;
  onPin: (id: number) => void;
  onRename?: (id: number, title: string) => void;
  onToggleSidebar: () => void;
  onSplit: (dir: "row" | "col") => void;
  canSplit: boolean;
  onOpenSettings: () => void;
  searchTarget: SearchTarget;
  searchRef: RefObject<SearchInlineHandle | null>;
};

const COMPACT_WIDTH = 720;

function tabIconId(tab: Tab): string {
  if (tab.kind === "terminal" && tab.private) return "incognito";
  if (tab.kind === "editor") return "editor";
  return "terminal";
}

function tabLabel(tab: Tab): string {
  if (tab.kind === "editor") return tab.title;
  if (tab.kind === "terminal" && tab.cwd) {
    const parts = tab.cwd.split(/[\\/]/).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "/";
  }
  return tab.title;
}

export function Header({
  tabs,
  activeId,
  onSelect,
  onNew,
  onNewPrivate,
  onNewEditor,
  onClose,
  onPin,
  onRename,
  onToggleSidebar,
  onSplit,
  canSplit,
  onOpenSettings,
  searchTarget,
  searchRef,
}: Props) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setCompact(w < COMPACT_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const settingsButton = (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={onOpenSettings}
      title={t('header.settings')}
    >
      <HugeiconsIcon icon={Settings01Icon} size={15} strokeWidth={1.75} />
    </Button>
  );

  return (
    <div
      ref={rootRef}
      data-tauri-drag-region
      className={`flex h-10 shrink-0 items-center gap-2 border-b border-border/60 bg-card select-none ${
        IS_MAC ? "pr-2 pl-20" : "pr-0 pl-2"
      }`}
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          onClick={onToggleSidebar}
          title={t('header.toggleSidebar')}
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={SidebarLeftIcon} size={18} strokeWidth={1.75} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
              title={t('header.splitTerminal')}
              disabled={!canSplit}
            >
              <HugeiconsIcon icon={GridViewIcon} size={16} strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuItem onSelect={() => onSplit("row")}>
              <HugeiconsIcon
                icon={LayoutTwoColumnIcon}
                size={14}
                strokeWidth={1.75}
              />
              <span className="flex-1">{t('header.splitRight')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSplit("col")}>
              <HugeiconsIcon
                icon={LayoutTwoRowIcon}
                size={14}
                strokeWidth={1.75}
              />
              <span className="flex-1">{t('header.splitDown')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {tabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                title={t('header.allTabs')}
              >
                <HugeiconsIcon icon={ListViewIcon} size={16} strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48 max-h-80 overflow-y-auto">
              {tabs.map((tab) => {
                const isActive = tab.id === activeId;
                const iconId = tabIconId(tab);
                return (
                  <DropdownMenuItem
                    key={tab.id}
                    onSelect={() => onSelect(tab.id)}
                    className={isActive ? "bg-accent font-medium" : ""}
                  >
                    <span className="flex-1 truncate flex items-center gap-2">
                      <span className={`shrink-0 text-xs ${iconId === "incognito" ? "text-amber-500" : ""}`}>
                        [{iconId === "editor" ? "E" : iconId === "incognito" ? "P" : "T"}]
                      </span>
                      {tabLabel(tab)}
                    </span>
                    {tabs.length > 1 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose(tab.id);
                        }}
                        className="ml-2 rounded p-0.5 text-muted-foreground/50 hover:text-foreground"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!IS_MAC && <span className="mx-1 h-5 w-px shrink-0 bg-border" />}

      {IS_MAC && <span className="mr-1 h-full w-px shrink-0 bg-border" />}

      <div
        className="flex min-w-0 flex-1 items-center gap-2"
        data-tauri-drag-region
      >
        <TabBar
          tabs={tabs}
          activeId={activeId}
          onSelect={onSelect}
          onNew={onNew}
          onNewPrivate={onNewPrivate}
          onNewEditor={onNewEditor}
          onClose={onClose}
          onPin={onPin}
          onRename={onRename}
          compact={compact}
        />
        <div data-tauri-drag-region className="h-full min-w-2 flex-1" />
      </div>

      <SearchInline ref={searchRef} target={searchTarget} compact={compact} />

      {IS_MAC && settingsButton}

      {!IS_MAC && settingsButton}

      {USE_CUSTOM_WINDOW_CONTROLS && (
        <>
          <span className="ml-1 h-5 w-px shrink-0 bg-border" />
          <WindowControls />
        </>
      )}
    </div>
  );
}
