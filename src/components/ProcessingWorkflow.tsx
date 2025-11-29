// components/ProcessingWorkflow.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useSession } from '@/context/SessionContext';
import { CheckCircle2, Circle, XCircle, Loader2, ChevronRight, Zap, Target, Users, TrendingUp } from 'lucide-react';

interface WorkflowSubstep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'error';
  description?: string;
  category?: string;
}

// Define the phase structure that matches your backend workflow
const WORKFLOW_PHASES = [
  {
    id: 1,
    title: "Dynamic ICP Discovery",
    stepIds: ['1.1', '1.2', '1.3'],
    steps: [
      { name: "Generate hypotheses", id: '1.1', status: "waiting" },
      { name: "Market Discovery", id: '1.2', status: "waiting" },
      { name: "Clean and validate data", id: '1.3', status: "waiting" }
    ],
    icon: Target
  },
  {
    id: 2,
    title: "Account Intelligence",
    stepIds: ['2.1', '2.2', '2.3'],
    steps: [
      { name: "Enrich multi-source data", id: '2.1', status: "waiting" },
      { name: "Score fit", id: '2.2', status: "waiting" },
      { name: "Explain reasoning", id: '2.3', status: "waiting" }
    ],
    icon: Users
  },
  {
    id: 3,
    title: "Persona Intelligence",
    stepIds: ['3.1', '3.2', '3.3'],
    steps: [
      { name: "Identify relevant personas", id: '3.1', status: "waiting" },
      { name: "Map psychographic data", id: '3.2', status: "waiting" },
      { name: "Enrich contact information", id: '3.3', status: "waiting" }
    ],
    icon: Users
  },
  {
    id: 4,
    title: "Intent & Timing Intelligence",
    stepIds: ['4.1', '4.2', '4.3'],
    steps: [
      { name: "Detect buying signals", id: '4.1', status: "waiting" },
      { name: "Score intent", id: '4.2', status: "waiting" },
      { name: "Summarize reasoning", id: '4.3', status: "waiting" }
    ],
    icon: TrendingUp
  }
];

export default function ProcessingWorkflow() {
  const { currentSession, refreshSessions } = useSession();

  // Use useMemo to prevent unnecessary recalculations
  const workflowData = useMemo(() => {
    return currentSession?.searchStatus || null;
  }, [currentSession?.id, currentSession?.searchStatus]);

  const backendSubsteps = useMemo(() => {
    return workflowData?.substeps || [];
  }, [workflowData?.substeps]);

  // Only show if this session is actively processing
  const shouldShow = useMemo(() => {
    if (!currentSession?.id) return false;
    if (!workflowData) return false;
    
    const activeStages = ['searching', 'refine_search', 'processing'];
    return activeStages.includes(workflowData.stage);
  }, [currentSession?.id, workflowData?.stage]);

  // Track previous session ID to detect changes
  const previousSessionIdRef = useRef<string | null>(null);
  
  // Refresh session data when switching sessions
  useEffect(() => {
    const currentSessionId = currentSession?.id;
    
    if (currentSessionId && currentSessionId !== previousSessionIdRef.current) {
      console.log('🔄 Session changed, refreshing data:', currentSessionId);
      
      // Refresh sessions to get latest data from backend
      refreshSessions().then(() => {
        console.log('✅ Sessions refreshed for session:', currentSessionId);
      }).catch(error => {
        console.error('❌ Failed to refresh sessions:', error);
      });
      
      previousSessionIdRef.current = currentSessionId;
    }
  }, [currentSession?.id, refreshSessions]);

  // Map backend substep status to frontend status
  const mapBackendStatus = useCallback((backendStatus: string) => {
    switch (backendStatus) {
      case 'completed': return 'done';
      case 'in-progress': return 'processing';
      case 'failed':
      case 'error': return 'failed';
      default: return 'waiting';
    }
  }, []);

  // Derive workflow phases directly from backend data - no local state needed
  const workflowPhases = useMemo(() => {
    if (!backendSubsteps.length) {
      console.log('📊 No backend substeps, using default workflow');
      return WORKFLOW_PHASES;
    }

    console.log('📊 Building workflow from backend substeps:', backendSubsteps);

    const updatedPhases = WORKFLOW_PHASES.map(phase => ({
      ...phase,
      steps: phase.steps.map(step => {
        const backendStep = backendSubsteps.find((s: any) => s.id === step.id);
        const status = backendStep ? mapBackendStatus(backendStep.status) : 'waiting';
        
        console.log(`📝 Step ${step.id}: ${status} (backend: ${backendStep?.status})`);
        
        return {
          ...step,
          status
        };
      })
    }));

    return updatedPhases;
  }, [backendSubsteps, mapBackendStatus]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-[#006239]" fill="currentColor" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-[#006239] animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" fill="currentColor" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400 dark:text-[#6A6A6A]" />;
    }
  }, []);

  const getStepTextColor = useCallback((status: string) => {
    switch (status) {
      case 'done':
        return 'text-gray-700 dark:text-[#EDEDED]';
      case 'processing':
        return 'text-gray-900 dark:text-[#EDEDED] font-medium';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-[#9CA3AF]';
    }
  }, []);

  const getPhaseStatus = useCallback((steps: any[]) => {
    if (steps.every((s: any) => s.status === 'done')) return 'done';
    if (steps.some((s: any) => s.status === 'processing')) return 'processing';
    if (steps.some((s: any) => s.status === 'failed')) return 'failed';
    return 'waiting';
  }, []);

  const getProgressPercentage = useCallback(() => {
    const totalSteps = workflowPhases.reduce((acc, phase) => acc + phase.steps.length, 0);
    const completedSteps = workflowPhases.reduce((acc, phase) => 
      acc + phase.steps.filter((s: any) => s.status === 'done').length, 0
    );
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }, [workflowPhases]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Workflow Debug:', {
      sessionId: currentSession?.id,
      shouldShow,
      hasWorkflowData: !!workflowData,
      backendSubstepsCount: backendSubsteps.length,
      workflowPhases: workflowPhases.map(p => ({
        title: p.title,
        steps: p.steps.map(s => ({ id: s.id, status: s.status }))
      }))
    });
  }, [currentSession?.id, shouldShow, workflowData, backendSubsteps, workflowPhases]);

  if (!currentSession?.id) {
    console.log('❌ No current session');
    return null;
  }

  if (!shouldShow) {
    console.log('❌ Should not show workflow - not in active stage:', {
      sessionId: currentSession.id,
      stage: workflowData?.stage
    });
    return null;
  }
  
  console.log('✅ Showing workflow for session:', currentSession.id);

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 max-w-2xl border border-gray-200 dark:border-[#2A2A2A] shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">Workflow Pipeline</h2>
              <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">Intelligence generation in progress</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#006239] bg-[#006239]/10 px-3 py-1 rounded-xl border border-[#006239]/20">
            {getProgressPercentage()}% Complete
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {workflowPhases.map((phase, phaseIndex) => {
          const PhaseIcon = phase.icon;
          const phaseStatus = getPhaseStatus(phase.steps);
          const isLastPhase = phaseIndex === workflowPhases.length - 1;

          return (
            <motion.div 
              key={phase.id} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: phaseIndex * 0.1 }}
            >
              {/* Timeline Line */}
              {!isLastPhase && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 dark:from-[#2A2A2A] via-gray-100 dark:via-[#1A1A1A] to-transparent" />
              )}

              {/* Phase Container */}
              <div className="relative pb-6">
                {/* Phase Header with Timeline Node */}
                <div className="flex items-start gap-4 mb-3">
                  {/* Timeline Node */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${phaseStatus === 'done' ? 'bg-[#006239] ring-4 ring-[#006239]/20' : 
                      phaseStatus === 'processing' ? 'bg-[#006239] ring-4 ring-[#006239]/20 animate-pulse' : 
                      phaseStatus === 'failed' ? 'bg-red-500 ring-4 ring-red-500/20' :
                      'bg-gray-100 dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A]'}`}>
                    <PhaseIcon className={`w-4 h-4 ${
                      phaseStatus === 'waiting' 
                        ? 'text-gray-500 dark:text-[#9CA3AF]' 
                        : 'text-white'
                    }`} />
                  </div>

                  {/* Phase Title */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDED] mb-1">{phase.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#9CA3AF]">
                      <span>{phase.steps.filter((s: any) => s.status === 'done').length}/{phase.steps.length} completed</span>
                      {phaseStatus === 'processing' && (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          <span className="text-[#006239] font-medium">In Progress</span>
                        </>
                      )}
                      {phaseStatus === 'failed' && (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          <span className="text-red-500 font-medium">Issues Detected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="ml-14 space-y-2">
                  {phase.steps.map((step, stepIndex) => (
                    <motion.div 
                      key={step.id}
                      className={`flex items-center gap-3 group py-2 px-3 -mx-3 rounded-xl transition-all
                        ${step.status === 'processing' ? 'bg-[#006239]/10 border border-[#006239]/20' : 
                         step.status === 'failed' ? 'bg-red-500/10 border border-red-500/20' : 
                         'hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (phaseIndex * 0.1) + (stepIndex * 0.05) }}
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <p className={`text-sm flex-1 transition-colors ${getStepTextColor(step.status)}`}>
                        {step.name}
                      </p>
                      {step.status === 'processing' && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[#006239] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#006239] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#006239] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-[#006239] font-medium">Processing</span>
                        </div>
                      )}
                      {step.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-500 font-medium">Failed</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#006239]" />
              <span className="text-gray-600 dark:text-[#9CA3AF]">
                {workflowPhases.reduce((acc, p) => acc + p.steps.filter((s: any) => s.status === 'done').length, 0)} Done
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#006239] animate-pulse" />
              <span className="text-gray-600 dark:text-[#9CA3AF]">
                {workflowPhases.reduce((acc, p) => acc + p.steps.filter((s: any) => s.status === 'processing').length, 0)} Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-[#6A6A6A]" />
              <span className="text-gray-600 dark:text-[#9CA3AF]">
                {workflowPhases.reduce((acc, p) => acc + p.steps.filter((s: any) => s.status === 'waiting').length, 0)} Pending
              </span>
            </div>
            {workflowPhases.some(p => p.steps.some((s: any) => s.status === 'failed')) && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-[#9CA3AF]">
                  {workflowPhases.reduce((acc, p) => acc + p.steps.filter((s: any) => s.status === 'failed').length, 0)} Failed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}