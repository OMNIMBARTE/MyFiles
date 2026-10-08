import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import { Copy, Check } from 'lucide-react';
import * as api from '../../services/api';

interface CodePreviewProps {
  filePath: string;
  extension: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ filePath, extension }) => {
  const [content, setContent] = useState<string>('');
  const [lines, setLines] = useState<number>(0);
  const [truncated, setTruncated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.fetchFilePreview(filePath)
      .then((res) => {
        if (isMounted) {
          setContent(res.content);
          setLines(res.lines);
          setTruncated(res.truncated);
          setLoading(false);
          setTimeout(() => Prism.highlightAll(), 50);
        }
      })
      .catch(() => {
        if (isMounted) {
          setContent('// Failed to load preview content');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  const copyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.json': 'json',
    '.sh': 'bash',
    '.bash': 'bash',
    '.css': 'css',
    '.html': 'markup',
  };

  const lang = extMap[extension.toLowerCase()] || 'javascript';

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-theme-muted text-xs font-mono">
        <div className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mr-2" />
        Reading code stream...
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-theme-border bg-[#1d1f21] text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#151718] border-b border-white/10 text-[11px] text-zinc-400">
        <span>{lines} lines {truncated ? '(truncated)' : ''}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 hover:text-white transition-colors text-[10px]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto p-3 text-[11px] leading-relaxed no-scrollbar">
        <pre className="!bg-transparent !p-0 !m-0">
          <code className={`language-${lang}`}>{content}</code>
        </pre>
      </div>
    </div>
  );
};
