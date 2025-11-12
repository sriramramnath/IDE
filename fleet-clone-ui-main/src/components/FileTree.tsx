import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  icon?: string;
}

const fileTree: FileNode[] = [
  {
    name: ".fleet",
    type: "folder",
    children: [],
  },
  {
    name: ".idea",
    type: "folder",
    children: [],
  },
  {
    name: "bin",
    type: "folder",
    children: [],
  },
  {
    name: "build",
    type: "folder",
    children: [],
  },
  {
    name: "codeServer",
    type: "folder",
    children: [],
  },
  {
    name: "community",
    type: "folder",
    children: [
      { name: ".idea", type: "folder", children: [] },
      { name: "bin", type: "folder", children: [] },
      { name: "build", type: "folder", children: [] },
      { name: "native", type: "folder", children: [] },
      {
        name: "platform",
        type: "folder",
        children: [
          {
            name: "node-rpc-client",
            type: "folder",
            children: [
              {
                name: "src",
                type: "folder",
                children: [
                  { name: "rpc-node.ts", type: "file", icon: "📘" },
                  { name: "rpc.ts", type: "file", icon: "📘" },
                ],
              },
              {
                name: "test",
                type: "folder",
                children: [{ name: "test.js", type: "file", icon: "📜" }],
              },
            ],
          },
        ],
      },
      { name: "typings", type: "folder", children: [] },
      { name: ".npmignore", type: "file", icon: "📄" },
      { name: "BUILD.bazel", type: "file", icon: "📄" },
      { name: "intellij.nodeRpcClient.iml", type: "file", icon: "📄" },
      { name: "package-lock.json", type: "file", icon: "⚙️" },
      { name: "package.json", type: "file", icon: "⚙️" },
      { name: "tsconfig.json", type: "file", icon: "⚙️" },
    ],
  },
];

interface TreeItemProps {
  node: FileNode;
  level: number;
  selectedFile: string;
  onSelectFile: (file: string) => void;
}

const TreeItem = ({ node, level, selectedFile, onSelectFile }: TreeItemProps) => {
  const [isOpen, setIsOpen] = useState(
    level === 0 || node.name === "community" || node.name === "platform" || node.name === "node-rpc-client" || node.name === "src"
  );
  const isSelected = selectedFile === node.name;

  const getIcon = (node: FileNode) => {
    if (node.icon) return node.icon;
    if (node.type === "folder") return null;
    return "📄";
  };

  return (
    <div>
      <div
        onClick={() => {
          if (node.type === "folder") {
            setIsOpen(!isOpen);
          } else {
            onSelectFile(node.name);
          }
        }}
        className={`flex items-center gap-1.5 px-2 py-0.5 cursor-pointer text-xs ${
          isSelected ? "bg-muted text-foreground" : "hover:bg-hover-bg text-foreground"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {node.type === "folder" ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </>
        ) : (
          <span className="w-3" />
        )}
        {getIcon(node) && <span className="text-sm">{getIcon(node)}</span>}
        <span className={node.type === "folder" ? "" : ""}>{node.name}</span>
      </div>
      {node.type === "folder" && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <TreeItem
              key={idx}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  selectedFile: string;
  onSelectFile: (file: string) => void;
}

export const FileTree = ({ selectedFile, onSelectFile }: FileTreeProps) => {
  return (
    <div className="h-full bg-sidebar-bg overflow-y-auto">
      <div className="py-1">
        <div className="px-3 py-1 mb-1">
          <div className="text-xs text-foreground">levcode</div>
        </div>
        {fileTree.map((node, idx) => (
          <TreeItem
            key={idx}
            node={node}
            level={0}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
};
