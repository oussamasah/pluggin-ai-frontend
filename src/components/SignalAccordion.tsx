import { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, BarChart3, Target, Calendar, Users, MessageSquare, AlertTriangle, Award, Zap, FileText, Building, ChartBar, Target as TargetIcon, Lightbulb, Shield, Star, Briefcase, DollarSign, Handshake, Users as UsersIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Accordion component for signal breakdown
export const SignalAccordion = ({ signal, index }: { signal: any; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rawScore = signal.raw_score || 0;
  const weight = signal.weight_percentage || 0;
  const signalConfidence = signal.confidence_level || 'LOW';
  const eventsCount = signal.events_detected?.count || 0;
  const weightedContribution = signal.weighted_contribution || 0;

  return (
    <div className="border border-gray-300 dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            rawScore > 0 
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : "bg-gradient-to-br from-gray-400 to-gray-600"
          )}>
            <span className="text-white font-bold text-lg">
              {rawScore}
            </span>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 dark:text-[#EDEDED] flex items-center gap-2">
              {signal.signal_name || signal.event_type}
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-lg",
                signalConfidence === 'HIGH'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : signalConfidence === 'MEDIUM'
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              )}>
                {signalConfidence}
              </span>
            </h4>
            <p className="text-sm text-gray-500 dark:text-[#6A6A6A]">
              Weight: {weight}% • Contribution: {weightedContribution.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-[#6A6A6A]">Events</div>
            <div className="font-semibold text-gray-900 dark:text-[#EDEDED]">{eventsCount}</div>
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-[#6A6A6A]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-[#6A6A6A]" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 bg-white dark:bg-[#0F0F0F] border-t border-gray-300 dark:border-[#2A2A2A]">
          {/* What Detected */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              What We Detected
            </h5>
            <p className="text-gray-900 dark:text-[#EDEDED]">{signal.signal_analysis?.what_detected}</p>
          </div>

          {/* Scoring Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl">
            <div className="text-center p-3 bg-white dark:bg-[#0F0F0F] rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A] mb-1">Event Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">
                {signal.scoring_breakdown?.event_occurrence_score || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A]">/ 50</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-[#0F0F0F] rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A] mb-1">Recency Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">
                {signal.scoring_breakdown?.event_recency_score || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A]">/ 50</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-[#0F0F0F] rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A] mb-1">Total Raw</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#EDEDED]">
                {signal.scoring_breakdown?.total_raw_score || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A]">score</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-[#0F0F0F] rounded-lg border border-gray-200 dark:border-[#2A2A2A]">
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A] mb-1">Weighted</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {signal.scoring_breakdown?.weighted_contribution || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-[#6A6A6A]">contribution</div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] mb-2 flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                Buying Intent
              </h5>
              <p className="text-sm text-gray-900 dark:text-[#EDEDED]">
                {signal.signal_analysis?.buying_intent_interpretation}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timing
              </h5>
              <p className="text-sm text-gray-900 dark:text-[#EDEDED]">
                {signal.signal_analysis?.timing_implications}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Competitive Context
              </h5>
              <p className="text-sm text-gray-900 dark:text-[#EDEDED]">
                {signal.signal_analysis?.competitive_context}
              </p>
            </div>
          </div>

          {/* Events List */}
          {eventsCount > 0 && signal.events_detected?.events && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Detected Events ({eventsCount})
              </h5>
              <div className="space-y-2">
                {signal.events_detected.events.map((event: any, eventIndex: number) => (
                  <div key={eventIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-[#EDEDED]">{event.role}</div>
                      {event.department && (
                        <div className="text-sm text-gray-500 dark:text-[#6A6A6A]">{event.department}</div>
                      )}
                    </div>
                    {event.date && (
                      <div className="text-sm text-gray-500 dark:text-[#6A6A6A]">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {signal.red_flags && signal.red_flags.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <h5 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags
              </h5>
              <ul className="space-y-1">
                {signal.red_flags.map((flag: string, flagIndex: number) => (
                  <li key={flagIndex} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};