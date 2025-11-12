import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorProps {
  openFiles: string[];
  activeFile: string;
  onSelectFile: (file: string) => void;
  onCloseFile: (file: string) => void;
}

const codeContent = {
  "rpc-node.ts": `import {JsonRpc, Transport} from "./rpc"


const debug = require("debug")("rpc")


export function connect(port: number = 63342, domains: { [domainName:string]: any }): Promise<JsonRpc> {
  const transport = new SocketTransport()
  const server = new JsonRpc(transport, domains)
  transport.connect(port)
  return server
}

export function close(server: JsonRpc) {
  server.close()
}

export class SocketTransport implements Transport {
  opened: () => void`,
  "package.json": `{
  "name": "levcode",
  "version": "1.0.0",
  "description": "Modern IDE Interface",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`,
  "main.rs": `fn main() {
    println!("Hello, world!");
}`,
  "test.js": `const test = require('test');

describe('Test Suite', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});`,
};

const getFileIcon = (filename: string) => {
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
    return "📘";
  } else if (filename.endsWith(".json")) {
    return "⚙️";
  } else if (filename.endsWith(".rs")) {
    return "⚙️";
  } else if (filename.endsWith(".js")) {
    return "📜";
  }
  return "📄";
};

export const Editor = ({ openFiles, activeFile, onSelectFile, onCloseFile }: EditorProps) => {
  const getCodeContent = (filename: string) => {
    return codeContent[filename as keyof typeof codeContent] || `// ${filename} content`;
  };

  const renderCodeWithLineNumbers = (code: string) => {
    const lines = code.split("\n");
    return lines.map((line, idx) => (
      <div
        key={idx}
        className={`flex ${idx === 17 ? "bg-primary/20" : ""}`}
      >
        <span className="inline-block w-12 text-right pr-4 text-muted-foreground select-none">
          {idx + 12}
        </span>
        <span className="flex-1">{line || " "}</span>
      </div>
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-editor-bg">
      <div className="flex border-b border-border bg-topbar-bg overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs border-r border-border cursor-pointer group relative ${
              activeFile === file
                ? "bg-selected-bg text-primary-foreground"
                : "hover:bg-hover-bg"
            }`}
            onClick={() => onSelectFile(file)}
          >
            <span>{getFileIcon(file)}</span>
            <span className="whitespace-nowrap">{file}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-3.5 w-3.5 p-0 opacity-0 group-hover:opacity-100 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
            {file === "rpc-node.ts" && (
              <div className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                3
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-0 font-mono text-xs leading-relaxed">
          {activeFile ? (
            <pre className="text-foreground">
              <code>{renderCodeWithLineNumbers(getCodeContent(activeFile))}</code>
            </pre>
          ) : (
            <div className="text-muted-foreground text-center mt-20">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
