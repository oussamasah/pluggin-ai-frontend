// components/EnhancedResponse.tsx
import { motion } from 'framer-motion';
import { Bot, Star, TrendingUp, Target, Building2, Users, CheckCircle, BarChart3, MapPin, Zap, Lightbulb } from 'lucide-react';
import React from 'react';

interface EnhancedResponseProps {
  content: string;
  className?: string;
}

interface FormattedSection {
  title: string | null;
  content: string[];
  type: 'metrics' | 'insights' | 'companies' | 'general';
}

const EnhancedResponse: React.FC<EnhancedResponseProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content) return null;

  // Enhanced content parsing with better section detection
  const formatContent = (text: string): FormattedSection[] => {
    const fixedText = text
      .replace(/\*\*(\w+):\*\*\s*\*/g, '**$1:**')
      .replace(/\*\*(\w+)\*\*:\s*\*\*/g, '**$1:**')
      .replace(/\*\*/g, '**')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    const lines = fixedText.split('\n');
    const formattedContent: FormattedSection[] = [];
    let currentSection: FormattedSection | null = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Detect section headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const sectionTitle = trimmedLine.replace(/\*\*/g, '').replace(/:$/, '').trim();
        
        if (sectionTitle.length > 0 && !sectionTitle.match(/^\d/)) {
          if (currentSection) {
            formattedContent.push(currentSection);
          }
          
          // Determine section type based on title
          let type: FormattedSection['type'] = 'general';
          const lowerTitle = sectionTitle.toLowerCase();
          
          if (lowerTitle.includes('metric') || lowerTitle.includes('result') || lowerTitle.includes('quality')) {
            type = 'metrics';
          } else if (lowerTitle.includes('insight') || lowerTitle.includes('pattern') || lowerTitle.includes('analysis')) {
            type = 'insights';
          } else if (lowerTitle.includes('company') || lowerTitle.includes('example') || lowerTitle.includes('match')) {
            type = 'companies';
          }
          
          currentSection = {
            title: sectionTitle,
            content: [],
            type
          };
        }
      } 
      // Handle content lines
      else if (trimmedLine) {
        if (!currentSection) {
          currentSection = { title: null, content: [], type: 'general' };
        }
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection && currentSection?.content.length > 0) {
      formattedContent.push(currentSection);
    }

    return formattedContent;
  };

  // Enhanced metrics parsing
  const parseMetrics = (content: string[]) => {
    const metrics: Array<{ label: string; value: string; description?: string; icon?: React.ReactNode }> = [];
    
    content.forEach(line => {
      const metricMatch = line.match(/\*\*([^*]+):\*\*\s*([^–•]+)(?:[–•]\s*(.+))?/);
      if (metricMatch) {
        const label = metricMatch[1].trim();
        const value = metricMatch[2].trim();
        const description = metricMatch[3]?.trim();
        
        // Assign appropriate icon based on label
        let icon = <TrendingUp className="w-3 h-3" />;
        if (label.toLowerCase().includes('company')) icon = <Users className="w-3 h-3" />;
        if (label.toLowerCase().includes('quality') || label.toLowerCase().includes('match')) icon = <Star className="w-3 h-3" />;
        if (label.toLowerCase().includes('industry')) icon = <Building2 className="w-3 h-3" />;
        if (label.toLowerCase().includes('score')) icon = <BarChart3 className="w-3 h-3" />;
        if (label.toLowerCase().includes('location')) icon = <MapPin className="w-3 h-3" />;
        
        metrics.push({ label, value, description, icon });
      }
    });

    return metrics;
  };

  // Get section icon with better matching
  const getSectionIcon = (type: FormattedSection['type'], title: string | null) => {
    switch (type) {
      case 'metrics':
        return <BarChart3 className="w-4 h-4" />;
      case 'insights':
        return <Lightbulb className="w-4 h-4" />;
      case 'companies':
        return <Users className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  // Light metric cards with better spacing
  const renderMetrics = (metrics: Array<{ label: string; value: string; description?: string; icon?: React.ReactNode }>) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-green-400/30 transition-all duration-200 group backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-500/20 rounded group-hover:bg-green-500/30 transition-colors">
                  {metric.icon}
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                  {metric.label}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-green-400 mb-1">
              {metric.value}
            </div>
            {metric.description && (
              <div className="text-xs text-gray-400 leading-tight">
                {metric.description}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // Enhanced content rendering with better typography
  const renderContent = (content: string[], type: FormattedSection['type']) => {
    if (type === 'metrics') {
      const metrics = parseMetrics(content);
      if (metrics.length > 0) {
        return renderMetrics(metrics);
      }
    }

    return (
      <div className="space-y-3">
        {content.map((paragraph, index) => (
          <motion.div
            key={index}
            className="text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {paragraph.split('**').map((text, i) => 
              i % 2 === 1 ? (
                <span key={i} className="text-white font-semibold">
                  {text}
                </span>
              ) : (
                text
              )
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const formattedSections = formatContent(content);

  return (
    <motion.div
      key={'summary-response'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-4xl mx-auto ${className}`}
    >
      {/* Main Content Card */}
      <motion.div 
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden group hover:border-green-400/20 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Minimal Header */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Market Analysis</h2>
              <p className="text-xs text-gray-400">AI-powered insights</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {formattedSections.length === 0 ? (
            // Fallback rendering
            <div className="text-gray-300 space-y-3">
              {content.split('\n').map((line, index) => (
                <p key={index} className={line.trim() ? 'leading-relaxed' : 'h-3'}>
                  {line.trim()}
                </p>
              ))}
            </div>
          ) : (
            // Organized sections
            <div className="space-y-6">
              {formattedSections.map((section, index) => (
                <motion.section
                  key={index}
                  className="section-group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                >
                  {section.title && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-green-400">
                        {getSectionIcon(section.type, section.title)}
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        {section.title}
                      </h3>
                    </div>
                  )}
                  
                  <div className="section-content">
                    {renderContent(section.content, section.type)}
                  </div>
                </motion.section>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-6 py-3 bg-gray-800/20 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>Analysis ready</span>
            </div>
            <span className="text-green-400/70 font-medium">
              Powered by AI
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedResponse;