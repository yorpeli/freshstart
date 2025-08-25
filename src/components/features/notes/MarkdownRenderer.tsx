import React from 'react';
import ReactMarkdown from 'react-markdown';
import Mention from './Mention';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content.trim()) {
    return <div className={`text-gray-500 italic ${className}`}>No content</div>;
  }

  // Parse and replace mentions with custom components
  const processMentions = (text: string) => {
    // This will be processed by the custom paragraph component
    return text;
  };

  // Convert plain URLs to markdown links if they're not already formatted
  const preprocessContent = (text: string) => {
    // First, let's handle any incomplete markdown links
    let processedText = text;
    
    // Look for incomplete markdown links like [text](url that got cut off
    const incompleteLinkRegex = /\[([^\]]*)\]\(([^)]*)$/g;
    processedText = processedText.replace(incompleteLinkRegex, (match, linkText, url) => {
      // If the URL is incomplete, try to complete it or remove the incomplete link
      if (url && url.trim()) {
        // Check if this looks like a valid URL
        if (url.match(/^https?:\/\//)) {
          // It's a valid URL, complete the link
          return `[${linkText}](${url})`;
        }
      }
      // Remove incomplete link and just show the text
      return linkText;
    });
    
    // Now convert any remaining plain URLs to markdown links
    // Look for URLs that are not already in markdown links
    const urlRegex = /(?<!\[[^\]]*\]\()(https?:\/\/[^\s]+)/g;
    processedText = processedText.replace(urlRegex, (url) => {
      // Create a shorter display text for the link
      const displayText = url.length > 50 ? url.substring(0, 47) + '...' : url;
      return `[${displayText}](${url})`;
    });
    
    return processedText;
  };

  const handleMentionClick = (type: 'people' | 'tasks' | 'meetings', text: string) => {
    // Remove the symbol from the text for display
    const cleanText = text.substring(1);
    
    // For now, just log the click - this can be enhanced later with navigation
    console.log(`Clicked ${type} mention:`, cleanText);
    
    // TODO: Implement navigation to the mentioned entity
    // switch (type) {
    //   case 'people':
    //     // Navigate to people view and search for the person
    //     break;
    //   case 'tasks':
    //     // Navigate to tasks view and search for the task
    //     break;
    //   case 'meetings':
    //     // Navigate to meetings view and search for the meeting
    //     break;
    // }
  };

  // Preprocess the content to fix any URL formatting issues
  const processedContent = preprocessContent(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Custom styling for different markdown elements
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 mb-1">{children}</h3>,
          p: ({ children }) => {
            // Process mentions in paragraph text
            if (typeof children === 'string') {
              const mentionRegex = /(@\w+)|(#\w+)|(!\w+)/g;
              const parts: React.ReactNode[] = [];
              let lastIndex = 0;
              
              // Process all mentions
              const matches: RegExpExecArray[] = [];
              let match: RegExpExecArray | null;
              while ((match = mentionRegex.exec(children)) !== null) {
                matches.push(match);
              }
              
              // Process matches in order
              matches.forEach((match) => {
                // Add text before the mention
                if (match.index > lastIndex) {
                  parts.push(children.substring(lastIndex, match.index));
                }

                // Add the mention component
                const type = match[0].startsWith('@') ? 'people' : 
                             match[0].startsWith('#') ? 'tasks' : 'meetings';
                
                parts.push(
                  <Mention
                    key={match.index}
                    type={type}
                    text={match[0]}
                    onClick={() => handleMentionClick(type, match[0])}
                  />
                );

                lastIndex = match.index + match[0].length;
              });

              // Add remaining text
              if (lastIndex < children.length) {
                parts.push(children.substring(lastIndex));
              }

              return <p className="text-gray-700 mb-2 leading-relaxed">{parts}</p>;
            }

            return <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>;
          },
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          a: ({ href, children }) => {
            // Ensure href is valid
            if (!href) return <span>{children}</span>;
            
            // If children is empty or just whitespace, use the URL as display text
            const displayText = children && children.toString().trim() ? children : href;
            
            return (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
                title={href}
              >
                {displayText}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>;
            }
            return (
              <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-2">
                <code className="text-sm font-mono text-gray-800">{children}</code>
              </pre>
            );
          },
          hr: () => <hr className="border-gray-300 my-4" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
