import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { FileTree } from "@/components/FileTree";
import { Editor } from "@/components/Editor";
import { AIAssistant } from "@/components/AIAssistant";
import { Terminal } from "@/components/Terminal";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState("rpc-node.ts");
  const [openFiles, setOpenFiles] = useState(["rpc-node.ts", "package.json", "main.rs", "test.js"]);
  const [activeFile, setActiveFile] = useState("rpc-node.ts");
  const [isAIOpen, setIsAIOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const handleSelectFile = (file: string) => {
    setSelectedFile(file);
    setActiveFile(file);
    if (!openFiles.includes(file)) {
      setOpenFiles([...openFiles, file]);
    }
  };

  const handleCloseFile = (file: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== file);
    setOpenFiles(newOpenFiles);
    if (activeFile === file && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    } else if (newOpenFiles.length === 0) {
      setActiveFile("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <TopBar />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileTree selectedFile={selectedFile} onSelectFile={handleSelectFile} />
        </ResizablePanel>
        
        <ResizableHandle withHandle className="w-[1px] bg-border hover:bg-primary/50 transition-colors" />
        
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <Editor
                openFiles={openFiles}
                activeFile={activeFile}
                onSelectFile={setActiveFile}
                onCloseFile={handleCloseFile}
              />
            </ResizablePanel>
            
            {isTerminalOpen && (
              <>
                <ResizableHandle withHandle className="h-[1px] bg-border hover:bg-primary/50 transition-colors" />
                <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                  <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {isAIOpen && (
          <>
            <ResizableHandle withHandle className="w-[1px] bg-border hover:bg-primary/50 transition-colors" />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
              <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
