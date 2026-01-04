'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface FormattingOptions {
  preserveLineBreaks?: boolean
  className?: string
}

const ACTIVE_GREEN = '#006239'

// Enhanced formatBoldText with links support
function formatBoldText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*.*?\*\*|__.*?__|\[.*?\]\(.*?\))/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Process the match
    const matchedText = match[0]
    
    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      // Bold text
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-gray-900 dark:text-[#EDEDED]">
          {matchedText.slice(2, -2)}
        </strong>
      )
    } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
      // Bold text (alternative)
      parts.push(
        <strong key={`bold-alt-${match.index}`} className="font-semibold text-gray-900 dark:text-[#EDEDED]">
          {matchedText.slice(2, -2)}
        </strong>
      )
    } else if (matchedText.startsWith('[') && matchedText.includes('](') && matchedText.endsWith(')')) {
      // Link text
      const linkMatch = matchedText.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        const [, linkText, linkUrl] = linkMatch
        parts.push(
          <a
            key={`link-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {linkText}
          </a>
        )
      } else {
        parts.push(matchedText)
      }
    } else {
      parts.push(matchedText)
    }
    
    lastIndex = match.index + matchedText.length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}

// Handle italic text
function formatItalicText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*.*?\*|_.*?_)/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    const matchedText = match[0]
    const content = matchedText.slice(1, -1)
    
    parts.push(
      <em key={`italic-${match.index}`} className="italic">
        {content}
      </em>
    )
    
    lastIndex = match.index + matchedText.length
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}

// Handle inline code
function formatInlineCode(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(`.*?`)/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    const matchedText = match[0]
    const content = matchedText.slice(1, -1)
    
    parts.push(
      <code
        key={`code-${match.index}`}
        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
      >
        {content}
      </code>
    )
    
    lastIndex = match.index + matchedText.length
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}

// Apply all text formatting
function formatRichText(text: string): React.ReactNode {
  // Process in sequence: links → bold → italic → code
  let result: React.ReactNode = text
  
  // Links first (they can contain other formatting)
  if (typeof result === 'string') {
    result = formatBoldText(result) // This function now handles links too
  }
  
  // Handle string nodes after bold formatting
  if (typeof result === 'string') {
    result = formatItalicText(result)
  } else if (Array.isArray(result)) {
    result = result.map((part, index) => {
      if (typeof part === 'string') {
        return <React.Fragment key={index}>{formatItalicText(part)}</React.Fragment>
      }
      return part
    })
  }
  
  // Handle string nodes after italic formatting
  if (typeof result === 'string') {
    result = formatInlineCode(result)
  } else if (Array.isArray(result)) {
    result = result.map((part, index) => {
      if (typeof part === 'string') {
        return <React.Fragment key={index}>{formatInlineCode(part)}</React.Fragment>
      }
      return part
    })
  }
  
  return result
}

// Table parsing functions
function parseMarkdownTable(markdownTable: string[]): { headers: string[]; rows: string[][] } {
  const headers = markdownTable[0]
    .split('|')
    .filter(cell => cell.trim())
    .map(cell => cell.trim())

  const rows = markdownTable
    .slice(2)
    .map(line =>
      line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim())
    )
    .filter(row => row.length > 0)

  return { headers, rows }
}

function isTableStart(line: string): boolean {
  const cells = line.split('|').filter(cell => cell.trim())
  return cells.length >= 2 && line.includes('|')
}

function isTableSeparator(line: string): boolean {
  const cells = line.split('|').filter(cell => cell.trim())
  if (cells.length < 2) return false
  
  return cells.every(cell => {
    const trimmed = cell.trim()
    return /^:?-+:?$/.test(trimmed)
  })
}

// Check if line is a heading
function isHeading(line: string): boolean {
  return /^#{1,6}\s/.test(line.trim())
}

// Main parseContent function
export function parseContent(
  content: string,
  options: FormattingOptions = {}
): React.ReactElement {
  const { preserveLineBreaks = false, className = '' } = options

  if (!content) return <></>

  const elements: React.ReactNode[] = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Empty lines
    if (!trimmedLine) {
      if (preserveLineBreaks) {
        elements.push(<br key={`br-${i}`} />)
      }
      i++
      continue
    }

    // Check for table
    if (isTableStart(trimmedLine) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      const tableLines = [trimmedLine, lines[i + 1].trim()]
      
      let j = i + 2
      while (j < lines.length && lines[j].trim() && lines[j].includes('|')) {
        tableLines.push(lines[j].trim())
        j++
      }
      
      try {
        const table = parseMarkdownTable(tableLines)
        elements.push(
          <ScrollableTable key={`table-${i}`} table={table} />
        )
        i = j
        continue
      } catch (error) {
        // Fall through to regular text
      }
    }

    // Headings
    if (isHeading(trimmedLine)) {
      const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const headingText = match[2]
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
        
        const headingClasses = {
          1: "text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-4 mt-6",
          2: "text-xl font-semibold text-gray-900 dark:text-[#EDEDED] mb-3 mt-5",
          3: "text-lg font-semibold text-gray-800 dark:text-[#EDEDED] mb-2 mt-4",
          4: "text-base font-medium text-gray-800 dark:text-[#EDEDED] mb-2 mt-3",
          5: "text-sm font-medium text-gray-700 dark:text-[#D1D5DB] mb-1 mt-2",
          6: "text-xs font-medium text-gray-600 dark:text-[#9CA3AF] mb-1 mt-2",
        }
        
        elements.push(
          React.createElement(
            HeadingTag,
            {
              key: `heading-${i}`,
              className: cn(headingClasses[level as keyof typeof headingClasses])
            },
            formatRichText(headingText)
          )
        )
        i++
        continue
      }
    }

    // Horizontal rule
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-6 border-gray-200 dark:border-[#2A2A2A]"
        />
      )
      i++
      continue
    }

    // Bullet points
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('+ ')) {
      const listItems: React.ReactNode[] = []
      
      while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i].trim())) {
        const currentLine = lines[i].trim()
        const listText = currentLine.substring(2)
        
        listItems.push(
          <li key={`bullet-${i}`} className="flex items-start mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0"
              style={{ backgroundColor: ACTIVE_GREEN }}
            />
            <span className="text-gray-700 dark:text-[#9CA3AF] leading-relaxed">
              {formatRichText(listText)}
            </span>
          </li>
        )
        i++
      }
      
      elements.push(
        <ul key={`ul-${i}`} className="my-4 pl-0">
          {listItems}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmedLine)) {
      const listItems: React.ReactNode[] = []
      
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const currentLine = lines[i].trim()
        const listText = currentLine.replace(/^\d+\.\s/, '')
        
        listItems.push(
          <li key={`numbered-${i}`} className="mb-2 text-gray-700 dark:text-[#9CA3AF]">
            {formatRichText(listText)}
          </li>
        )
        i++
      }
      
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 my-4 space-y-2">
          {listItems}
        </ol>
      )
      continue
    }

    // Blockquote
    if (trimmedLine.startsWith('> ')) {
      const quoteContent = trimmedLine.substring(2)
      elements.push(
        <blockquote
          key={`blockquote-${i}`}
          className="pl-4 border-l-2 border-[#006239] italic text-gray-700 dark:text-[#9CA3AF] my-4"
        >
          {formatRichText(quoteContent)}
        </blockquote>
      )
      i++
      continue
    }

    // Regular paragraph (collect multiple lines)
    const paragraphLines: string[] = [trimmedLine]
    i++
    
    // Collect continuation lines
    while (i < lines.length && 
           lines[i].trim() && 
           !isHeading(lines[i].trim()) &&
           !/^[\s]*[-*+]\s/.test(lines[i].trim()) &&
           !/^\d+\.\s/.test(lines[i].trim()) &&
           !lines[i].trim().startsWith('> ') &&
           !isTableStart(lines[i].trim()) &&
           lines[i].trim() !== '---' &&
           lines[i].trim() !== '***' &&
           lines[i].trim() !== '___') {
      paragraphLines.push(lines[i].trim())
      i++
    }
    
    const paragraphText = paragraphLines.join(' ')
    
    elements.push(
      <p key={`p-${i}`} className="mb-4 leading-relaxed text-gray-700 dark:text-[#9CA3AF] last:mb-0">
        {formatRichText(paragraphText)}
      </p>
    )
  }

  return <div className={cn("space-y-4", className)}>{elements}</div>
}

// Scrollable table component
function ScrollableTable({ table }: { table: { headers: string[]; rows: string[][] } }) {
  return (
    <div className="my-6">


      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent w-[650px]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2A2A2A]">
            <thead className="bg-gray-50 dark:bg-[#1A1A1A] sticky top-0">
              <tr>
                {table.headers.map((header, idx) => (
                  <th
                    key={`th-${idx}`}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      {formatRichText(header)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
              {table.rows.map((row, rowIdx) => (
                <tr 
                  key={`row-${rowIdx}`}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50",
                    rowIdx % 2 === 0 ? "bg-white dark:bg-[#0F0F0F]" : "bg-gray-50/50 dark:bg-[#1A1A1A]/30"
                  )}
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={`cell-${rowIdx}-${cellIdx}`}
                      className="px-6 py-4 text-sm text-gray-800 dark:text-[#EDEDED] whitespace-nowrap"
                    >
                      <div className="leading-relaxed">
                        {formatRichText(cell)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-2 flex justify-end items-center text-xs text-gray-500 dark:text-[#6B7280]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 flex items-center justify-center">
            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10 4L6 8L2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Scroll horizontally</span>
        </div>
      </div>
    </div>
  )
}

// Usage example in a chat component
export function EnhancedChatMessage({ 
  content, 
  isUser = false 
}: { 
  content: string; 
  isUser?: boolean 
}) {
  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E1E1E] flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      )}
      
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={cn(
          "px-5 py-4 rounded-2xl",
          isUser 
            ? "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-gray-900 dark:text-[#EDEDED] rounded-br-md"
            : "bg-[#F3F4F6] dark:bg-[#1E1E1E] text-gray-900 dark:text-[#EDEDED] rounded-bl-md"
        )}>
          <div className="text-sm leading-relaxed">
            {parseContent(content)}
          </div>
        </div>
        
        <div className={cn(
          "text-xs font-light tracking-wide px-1",
          isUser 
            ? "text-gray-500 dark:text-[#9CA3AF] text-right" 
            : "text-gray-500 dark:text-[#9CA3AF] text-left"
        )}>
          {isUser ? 'You' : 'Assistant'} • Just now
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  )
}

// Test component with example content
export function TestMarkdownRenderer() {
  const exampleContent = `# Welcome to Markdown Parser

This parser supports **bold text**, *italic text*, and [clickable links](https://example.com).

## Features

* **Rich formatting** with markdown
* Scrollable tables
* Dark mode support
* Links open in new tabs
* Clean, modern design

## Example Table

| Company | Revenue | Employees | Location | Website |
|---|---|---|---|---|
| TechCorp | $50M | 250 | San Francisco | [Visit Site](https://techcorp.com) |
| InnovateCo | $120M | 500 | New York | [Visit Site](https://innovateco.com) |
| StartupXYZ | $10M | 50 | Austin | [Visit Site](https://startupxyz.com) |

## Code Examples

Use \`inline code\` for technical terms.

---

**Note:** This parser is built for Next.js with TypeScript support.`

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED] mb-6">
          Markdown Parser Demo
        </h1>
        <div className="bg-[#F9FAFB] dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-[#2A2A2A]">
          {parseContent(exampleContent)}
        </div>
      </div>
    </div>
  )
}

export default parseContent