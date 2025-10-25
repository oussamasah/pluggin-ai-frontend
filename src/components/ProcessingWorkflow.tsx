"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useSession } from '@/context/SessionContext';
import { Substep } from '@/types';

// Type definitions matching your backend structure
interface WorkflowSubstep {
  id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  tools: string[];
  message: string;
}

interface WorkflowStep {
  stage: string;
  message: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  substeps: WorkflowSubstep[];
}

// Group substeps by category for better organization
const groupSubstepsByCategory = (substeps: WorkflowSubstep[] = []) => {
  const categories: { [key: string]: WorkflowSubstep[] } = {};
  
  substeps.forEach((substep) => {
    const category = substep.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(substep);
  });
  
  return categories;
};

// Get category display name
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'query-processing': 'Query Processing',
    'search-execution': 'Company Search',
    'data-mapping': 'Data Mapping',
    'results-preparation': 'Results Preparation',
    'search': 'Search',
    'enrichment': 'Enrichment',
    'scoring': 'Scoring',
    'analysis': 'Analysis'
  };
  return categoryMap[category] || category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function ProcessingWorkflow() {
  const { currentSession, isConnected } = useSession();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [userHasManuallyExpanded, setUserHasManuallyExpanded] = useState<boolean>(false);
  
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Get current workflow data
  const workflowData: WorkflowStep | null = currentSession?.searchStatus || null;
  const substeps = workflowData?.substeps || [];

  // Memoize expensive computations to prevent unnecessary re-renders
  const groupedSubsteps = useMemo(() => groupSubstepsByCategory(substeps), [substeps]);
  const categories = useMemo(() => Object.keys(groupedSubsteps), [groupedSubsteps]);

  // Auto-manage category expansion based on progress
  useEffect(() => {
    if (!userHasManuallyExpanded && categories.length > 0) {
      // Find categories with in-progress substeps
      const inProgressCategories = categories.filter(category => 
        groupedSubsteps[category].some(substep => substep.status === 'in-progress')
      );

      if (inProgressCategories.length > 0) {
        // Expand categories with in-progress tasks
        setExpandedCategories(inProgressCategories);
      } else {
        // Check if all completed
        const allCompleted = categories.every(category =>
          groupedSubsteps[category].every(substep => substep.status === 'completed')
        );

        if (allCompleted) {
          // Close all when everything is completed
          setExpandedCategories([]);
        } else {
          // Expand first category by default
          setExpandedCategories([categories[0]]);
        }
      }
    }
  }, [substeps, userHasManuallyExpanded]); // Removed categories and groupedSubsteps from dependencies

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setUserHasManuallyExpanded(true);
    setExpandedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    setUserHasManuallyExpanded(true);
    if (expandedCategories.length === categories.length) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(categories);
    }
  };

  // Animation variants
  const categoryVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : -5 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    }
  };

  const substepListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden" 
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      overflow: "visible",
      transition: { 
        duration: 0.25,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      transition: { 
        duration: 0.2,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  const substepVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    }
  };

  // Status badge animation variants
  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: prefersReducedMotion ? 1 : [1, 1.08, 1],
      transition: { 
        duration: 0.35,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  };

  // Pulse animation for in-progress items
  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Get status colors based on your theme
  const getStatusColors = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-[#00FA64]/10",
          text: "text-[#00FA64]",
          border: "border-[#00FA64]/30",
          badge: "bg-[#00FA64]/20 text-[#00FA64] border-[#00FA64]/30"
        };
      case "in-progress":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          border: "border-blue-500/30",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/30"
        };
      case "error":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
          badge: "bg-red-500/20 text-red-400 border-red-500/30"
        };
      default:
        return {
          bg: "bg-[#27272a]",
          text: "text-[#A1A1AA]",
          border: "border-[#363636]",
          badge: "bg-[#363636] text-[#A1A1AA] border-[#565656]"
        };
    }
  };

  // Get category status (overall status for all substeps in category)
  const getCategoryStatus = (substeps: WorkflowSubstep[]): string => {
    if (substeps.length === 0) return 'pending';
    
    const hasInProgress = substeps.some(st => st.status === 'in-progress');
    const hasError = substeps.some(st => st.status === 'error');
    const allCompleted = substeps.every(st => st.status === 'completed');
    
    if (hasError) return 'error';
    if (hasInProgress) return 'in-progress';
    if (allCompleted) return 'completed';
    return 'pending';
  };

  // Get status icon
  const getStatusIcon = (status: string, size: string = "5") => {
    const className = `w-${size} h-${size}`;
    
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`${className} text-[#00FA64]`} />;
      case "in-progress":
        return <CircleDotDashed className={`${className} text-blue-400`} />;
      case "error":
        return <CircleX className={`${className} text-red-400`} />;
      default:
        return <Circle className={`${className} text-[#A1A1AA]`} />;
    }
  };

  // Don't show if no active session with search status
  if (!workflowData) {
    return null;
  }

  const progress = workflowData.progress || 0;
  const message = workflowData.message || 'Processing your search request...';
  const allCompleted = categories.every(category => 
    getCategoryStatus(groupedSubsteps[category]) === 'completed'
  );

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9]
          }
        }}
      >
        <LayoutGroup>
          <div className="p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00FA64] to-[#00FF80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,250,100,0.3)]">
                  <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Search Progress
                  </h3>
                  <p className="text-sm text-[#A1A1AA] font-light">{message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00FA64]' : 'bg-red-500'}`} />
                    <span className="text-xs text-[#A1A1AA]">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse All Button */}
              {categories.length > 0 && (
                <motion.button
                  onClick={toggleAllCategories}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-[#A1A1AA] hover:text-white transition-colors border border-[#363636] rounded-lg hover:border-[#00FA64]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {expandedCategories.length === categories.length ? (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      Expand All
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[#A1A1AA] mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#27272a] rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-[#00FA64] to-[#00FF80] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Status Indicator */}
            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mb-4 p-3 bg-[#00FA64]/10 border border-[#00FA64]/30 rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00FA64]" />
                <span className="text-sm text-[#00FA64] font-medium">
                  All tasks completed!
                </span>
              </motion.div>
            )}

            {/* Categories and Substeps */}
            <ul className="space-y-3 overflow-hidden">
              {categories.map((category) => {
                const categorySubsteps = groupedSubsteps[category];
                const isExpanded = expandedCategories.includes(category);
                const categoryStatus = getCategoryStatus(categorySubsteps);
                const isInProgress = categoryStatus === 'in-progress';
                const colors = getStatusColors(categoryStatus);

                return (
                  <motion.li
                    key={category}
                    className={`rounded-lg border transition-all duration-300 ${colors.border} ${colors.bg} ${
                      isInProgress ? "shadow-[0_0_20px_rgba(59,130,246,0.1)]" : ""
                    }`}
                    initial="hidden"
                    animate="visible"
                    variants={categoryVariants}
                    whileHover={{ 
                      borderColor: isInProgress ? "rgb(59,130,246,0.5)" : colors.border,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {/* Category header */}
                    <motion.div 
                      className="group flex items-center px-4 py-3 rounded-lg cursor-pointer"
                      onClick={() => toggleCategoryExpansion(category)}
                      animate={isInProgress ? pulseAnimation : {}}
                    >
                      <motion.div
                        className="mr-3 flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={categoryStatus}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.2, 0.65, 0.3, 0.9]
                            }}
                          >
                            {getStatusIcon(categoryStatus)}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className="flex min-w-0 flex-grow items-center justify-between"
                      >
                        <div className="mr-4 flex-1">
                          <span
                            className={`font-medium tracking-wide ${categoryStatus === "completed" ? "text-[#00FA64]" : colors.text}`}
                          >
                            {getCategoryDisplayName(category)}
                          </span>
                          <p className="text-sm text-[#A1A1AA] font-light mt-1">
                            {categorySubsteps.length} task{categorySubsteps.length !== 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2">
                          <motion.span
                            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide border ${colors.badge}`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={categoryStatus}
                          >
                            {categoryStatus.replace('-', ' ').toUpperCase()}
                          </motion.span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Substeps */}
                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={substepListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[38px] border-l-2 border-dashed border-[#00FA64]/30" />
                          <ul className="mt-2 mr-4 mb-3 ml-4 space-y-2">
                            {categorySubsteps.map((substep) => {
                              const subColors = getStatusColors(substep.status);
                              const isSubInProgress = substep.status === "in-progress";

                              return (
                                <motion.li
                                  key={substep.id}
                                  className="group flex flex-col pl-8"
                                  variants={substepVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div 
                                    className="flex flex-1 items-center rounded-lg p-3 transition-all duration-300 border border-transparent hover:border-[#00FA64]/20"
                                    whileHover={{ 
                                      backgroundColor: "rgba(0, 250, 100, 0.05)",
                                    }}
                                    animate={isSubInProgress ? pulseAnimation : {}}
                                    layout
                                  >
                                    <motion.div
                                      className="mr-3 flex-shrink-0"
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={substep.status}
                                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                          transition={{
                                            duration: 0.3,
                                            ease: [0.2, 0.65, 0.3, 0.9]
                                          }}
                                        >
                                          {getStatusIcon(substep.status, "4")}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <div className="flex-1 min-w-0">
                                      <span
                                        className={`text-sm font-medium ${substep.status === "completed" ? "text-[#00FA64]" : subColors.text}`}
                                      >
                                        {substep.name}
                                      </span>
                                      <p className="text-xs text-[#A1A1AA] font-light mt-1">
                                        {substep.description}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1 italic">
                                        {substep.message}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-2">
                                      <motion.span
                                        className={`rounded-full px-2 py-1 text-xs font-bold tracking-wide border ${subColors.badge}`}
                                        variants={statusBadgeVariants}
                                        initial="initial"
                                        animate="animate"
                                        key={substep.status}
                                      >
                                        {substep.status.replace('-', ' ').toUpperCase()}
                                      </motion.span>
                                      
                                      {/* Priority Badge */}
                                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        substep.priority === 'high' 
                                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                          : substep.priority === 'medium'
                                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      }`}>
                                        {substep.priority}
                                      </span>
                                    </div>
                                  </motion.div>

                                  {/* Tools */}
                                  {substep.tools && substep.tools.length > 0 && (
                                    <motion.div 
                                      className="ml-11 mt-2 flex flex-wrap gap-1"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.1 }}
                                    >
                                      {substep.tools.map((tool, idx) => (
                                        <motion.span
                                          key={idx}
                                          className="bg-[#00FA64]/10 text-[#00FA64] px-2 py-1 rounded text-[10px] font-medium border border-[#00FA64]/20"
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ 
                                            opacity: 1, 
                                            y: 0,
                                            transition: {
                                              duration: 0.2,
                                              delay: idx * 0.05
                                            }
                                          }}
                                          whileHover={{ 
                                            y: -1, 
                                            backgroundColor: "rgba(0, 250, 100, 0.2)",
                                            transition: { duration: 0.2 } 
                                          }}
                                        >
                                          {tool}
                                        </motion.span>
                                      ))}
                                    </motion.div>
                                  )}
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}