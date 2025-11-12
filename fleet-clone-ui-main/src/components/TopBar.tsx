import { ChevronRight, Play, Search, Bell, Settings, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const TopBar = () => {
  const [activeTab, setActiveTab] = useState("Files");
  const tabs = ["Files", "Search", "Git", "History"];

  return (
    <div className="h-10 bg-topbar-bg border-b border-border flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
        </div>
        
        <div className="flex gap-1 ml-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-3 text-xs ${
                activeTab === tab
                  ? "bg-hover-bg text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-hover-bg"
              }`}
            >
              {tab}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Boxes className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>LevCode</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">main</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-hover-bg">
          <Play className="w-3.5 h-3.5 text-primary" fill="currentColor" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-hover-bg">
          <Search className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-hover-bg">
          <Bell className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-hover-bg">
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
