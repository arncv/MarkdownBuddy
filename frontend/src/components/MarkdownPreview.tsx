import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useDocument } from '@/contexts/DocumentContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownProps {
  children?: React.ReactNode;
  className?: string;
  src?: string;
  alt?: string;
}

export const MarkdownPreview: React.FC = () => {
  const { document } = useDocument();

  const defaultContent = `# Welcome to MarkdownBuddy! 📝

Start writing in the editor to see your content come to life here.

## Features

- Real-time collaboration
- Live preview with syntax highlighting
- GitHub Flavored Markdown support
- Math equations support
- Code syntax highlighting

## Examples

### Code Blocks

\`\`\`javascript
function hello() {
  console.log('Hello, MarkdownBuddy!');
}
\`\`\`

### Tables

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Real-time | ✅ |
| Collaboration | ✅ |

### Math Equations

Inline math: $E = mc^2$

Block math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### Tasklists

- [x] Create document
- [x] Edit content
- [ ] Share with team`;

  const markdownClass = `
    prose prose-lg max-w-none dark:prose-invert
    prose-headings:font-semibold prose-headings:text-gray-900
    prose-h1:text-3xl prose-h1:mb-8
    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
    prose-p:text-gray-800 prose-p:leading-relaxed
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500
    prose-blockquote:pl-4 prose-blockquote:italic
    prose-blockquote:text-gray-700 prose-blockquote:font-normal
    prose-code:text-blue-600
    prose-pre:p-0 prose-pre:bg-transparent
    prose-img:rounded-lg prose-img:shadow-md
    prose-table:border-collapse prose-table:w-full
    prose-th:border prose-th:border-gray-200 prose-th:p-3 prose-th:bg-gray-50 prose-th:text-gray-800
    prose-td:border prose-td:border-gray-200 prose-td:p-3 prose-td:text-gray-800
    prose-ul:list-disc prose-ul:pl-6
    prose-ol:list-decimal prose-ol:pl-6
    prose-li:my-1 prose-li:text-gray-800
    transition-opacity duration-200
  `;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto px-8 py-6">
        <article className={markdownClass}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              pre: ({ children }: MarkdownProps) => children,
              code: ({ className, children }: MarkdownProps) => {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                
                if (!match) {
                  return (
                    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-sm">
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative group rounded-lg overflow-hidden">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {lang}
                      </span>
                    </div>
                    <SyntaxHighlighter
                      language={lang}
                      style={vscDarkPlus as any}
                      PreTag="div"
                      // @ts-ignore
                      customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              },
              table: ({ children }: MarkdownProps) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    {children}
                  </table>
                </div>
              ),
              img: ({ src, alt }: MarkdownProps) => (
                <img
                  src={src}
                  alt={alt}
                  className="mx-auto rounded-lg shadow-md transition-transform hover:scale-105"
                  style={{ maxHeight: '400px' }}
                  loading="lazy"
                />
              )
            }}
          >
            {document?.content || defaultContent}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};