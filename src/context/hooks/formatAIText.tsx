interface Section {
    title?: string;
    emoji?: string;
    content: string[];
  }
  
  export function formatAIText(rawText: string): string {
    if (!rawText || rawText.length == 0)  return ""
    // Example: Split by double asterisks to make bold sections
    // You can also handle bullets starting with "-"
    // This returns HTML-ready string (or can render in React as JSX)
  
    // Replace **text** with bold HTML
    let formatted = rawText.replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`);
  
    // Replace "-" at start of line with bullet list
    formatted = formatted.replace(/^\s*-\s+(.*)$/gm, (_, p1) => `<li>${p1}</li>`);
  
    // Wrap consecutive <li> in <ul>
    formatted = formatted.replace(/(<li>[\s\S]*?<\/li>)/g, (_, p1) => `<ul>${p1}</ul>`);

  
    // Replace single line breaks with <br> for spacing
    formatted = formatted.replace(/\n/g, "<br>");
  
    return formatted;
  }
  