import { Brain, X, Command, Repeat, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-sidebar-bg border-l border-border flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="text-xs text-muted-foreground mb-4">
          Ask AI Assistant different questions or try other AI actions
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2 px-3"
          >
            <Command className="w-3.5 h-3.5 mr-2" />
            Ask AI Editor & Terminal
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2 px-3"
          >
            <Repeat className="w-3.5 h-3.5 mr-2" />
            AI Actions Editor
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-xs h-auto py-2 px-3"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-2" />
            AI Commands Chat
          </Button>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-topbar-bg rounded text-xs text-muted-foreground">
          <span>Ask AI Assistant. Use ⌘↑ for history.</span>
          <span className="ml-auto">@ ▶</span>
        </div>
      </div>
    </div>
  );
};
