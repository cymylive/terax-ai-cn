import { Button } from "@/components/ui/button";
import { Folder01Icon, FolderAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { currentWorkspaceEnv } from "@/modules/workspace";
import { useCallback, useEffect, useState } from "react";

type DirEntry = {
  name: string;
  kind: "file" | "dir" | "symlink";
};

type Props = {
  onOpenFile: (path: string) => void;
};

function basename(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : path;
}

export function ProjectTree({ onOpenFile }: Props) {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<Map<string, DirEntry[]>>(new Map());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadDir = useCallback(async (dir: string) => {
    try {
      const list = await invoke<DirEntry[]>("fs_read_dir", {
        path: dir,
        showHidden: false,
        workspace: currentWorkspaceEnv(),
      });
      setEntries((prev) => {
        const next = new Map(prev);
        next.set(dir, list);
        return next;
      });
    } catch {
      // ignore read errors
    }
  }, []);

  const pickFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择项目文件夹",
      });
      if (selected) {
        const normalized = selected.replace(/\\/g, "/");
        setRootPath(normalized);
        setExpanded(new Set([normalized]));
        setEntries(new Map());
        void loadDir(normalized);
      }
    } catch {
      // user cancelled or error
    }
  }, [loadDir]);

  const toggleDir = useCallback(
    (dir: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(dir)) {
          next.delete(dir);
        } else {
          next.add(dir);
          if (!entries.has(dir)) void loadDir(dir);
        }
        return next;
      });
    },
    [entries, loadDir],
  );

  const handleFileOpen = useCallback(
    (filePath: string) => {
      onOpenFile(filePath);
    },
    [onOpenFile],
  );

  if (!rootPath) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <HugeiconsIcon
          icon={Folder01Icon}
          size={32}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
        <div className="text-xs text-muted-foreground">
          选择项目文件夹
        </div>
        <Button variant="outline" size="sm" onClick={pickFolder}>
          选择文件夹
        </Button>
      </div>
    );
  }

  const rootEntries = entries.get(rootPath) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-border/60 px-2">
        <span className="flex-1 truncate text-xs font-medium text-foreground/80">
          {basename(rootPath)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={pickFolder}
          title="切换项目"
        >
          <HugeiconsIcon icon={FolderAddIcon} size={13} strokeWidth={2} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <TreeNode
          name={basename(rootPath)}
          path={rootPath}
          entries={rootEntries}
          expanded={expanded}
          depth={0}
          onToggle={toggleDir}
          onOpenFile={handleFileOpen}
        />
        {rootEntries.length === 0 && (
          <div className="px-3 py-2 text-[11px] text-muted-foreground">
            空目录
          </div>
        )}
      </div>
    </div>
  );
}

type TreeNodeProps = {
  name: string;
  path: string;
  entries: DirEntry[];
  expanded: Set<string>;
  depth: number;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
};

function TreeNode({
  name,
  path,
  entries,
  expanded,
  depth,
  onToggle,
  onOpenFile,
}: TreeNodeProps) {
  const isExpanded = expanded.has(path);
  const paddingLeft = 6 + depth * 14;

  return (
    <div>
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-left text-[13px] text-foreground/85 transition-colors hover:bg-accent/70"
        style={{ paddingLeft }}
        onClick={() => onToggle(path)}
        onDoubleClick={() => onOpenFile(path)}
      >
        <span className="text-[10px] w-3 shrink-0 text-muted-foreground">
          {isExpanded ? "v" : ">"}
        </span>
        <span className="truncate">{name}</span>
      </button>
      {isExpanded &&
        entries.map((entry) =>
          entry.kind === "dir" ? (
            <DirNode
              key={entry.name}
              parentPath={path}
              entry={entry}
              expanded={expanded}
              depth={depth + 1}
              onToggle={onToggle}
              onOpenFile={onOpenFile}
            />
          ) : (
            <FileNode
              key={entry.name}
              parentPath={path}
              entry={entry}
              depth={depth + 1}
              onOpenFile={onOpenFile}
            />
          ),
        )}
    </div>
  );
}

function DirNode({
  parentPath,
  entry,
  expanded,
  depth,
  onToggle,
  onOpenFile,
}: {
  parentPath: string;
  entry: DirEntry;
  expanded: Set<string>;
  depth: number;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
}) {
  const [children, setChildren] = useState<DirEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const dirPath = `${parentPath}/${entry.name}`;
  const isExpanded = expanded.has(dirPath);

  useEffect(() => {
    if (isExpanded && !loaded) {
      setLoaded(true);
      invoke<DirEntry[]>("fs_read_dir", {
        path: dirPath,
        showHidden: false,
        workspace: currentWorkspaceEnv(),
      })
        .then((list) => setChildren(list))
        .catch(() => setChildren([]));
    }
  }, [isExpanded, loaded, dirPath]);

  return (
    <div>
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-left text-[13px] text-foreground/85 transition-colors hover:bg-accent/70"
        style={{ paddingLeft: 6 + depth * 14 }}
        onClick={() => onToggle(dirPath)}
      >
        <span className="text-[10px] w-3 shrink-0 text-muted-foreground">
          {isExpanded ? "v" : ">"}
        </span>
        <span className="truncate">{entry.name}</span>
      </button>
      {isExpanded &&
        children.map((child) =>
          child.kind === "dir" ? (
            <DirNode
              key={child.name}
              parentPath={dirPath}
              entry={child}
              expanded={expanded}
              depth={depth + 1}
              onToggle={onToggle}
              onOpenFile={onOpenFile}
            />
          ) : (
            <FileNode
              key={child.name}
              parentPath={dirPath}
              entry={child}
              depth={depth + 1}
              onOpenFile={onOpenFile}
            />
          ),
        )}
    </div>
  );
}

function FileNode({
  parentPath,
  entry,
  depth,
  onOpenFile,
}: {
  parentPath: string;
  entry: DirEntry;
  depth: number;
  onOpenFile: (path: string) => void;
}) {
  const filePath = `${parentPath}/${entry.name}`;
  return (
    <button
      type="button"
      className="flex w-full min-w-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-left text-[13px] text-foreground/85 transition-colors hover:bg-accent/70"
      style={{ paddingLeft: 6 + depth * 14 + 14 }}
      onDoubleClick={() => onOpenFile(filePath)}
    >
      <span className="truncate">{entry.name}</span>
    </button>
  );
}
