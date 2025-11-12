import { Terminal as TerminalIcon, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Terminal = ({ isOpen, onClose }: TerminalProps) => {
  if (!isOpen) return null;

  return (
    <div className="h-full bg-sidebar-bg border-t border-border flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-topbar-bg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-foreground">Terminal</span>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-hover-bg">
              <X className="w-3 h-3" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-hover-bg">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3 font-mono text-xs overflow-y-auto">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-green-400">➜</span>
          <span className="text-primary">levcode</span>
          <span className="text-foreground">Press ⌘. to ask AI</span>
        </div>
      </div>
      
      <div className="px-3 py-2 border-t border-border text-[10px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>community / platform / node-rpc-client / src / rpc-node.ts / server</span>
          <span>18:49 UTF-8 TypeScript Node.js 23.3.0</span>
        </div>
      </div>
    </div>
  );
};
