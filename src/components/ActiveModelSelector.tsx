// components/ActiveModelSelectorModal.tsx
'use client'

import { useState } from 'react'
import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Star, X, Building2, Users, Package, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ActiveModelSelectorModalProps {
  className?: string
}

export function ActiveModelSelector({ className }: ActiveModelSelectorModalProps) {
  const { icpModels, primaryModel, setPrimaryModel } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModelSelect = (modelId: string) => {
    setPrimaryModel(modelId)
    setIsModalOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      {/* Active Model Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 text-sm justify-center"
      >
        <span className="text-gray-500 dark:text-[#9CA3AF] font-light tracking-wide">
          ACTIVE MODEL:
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
            "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-[#9CA3AF]",
            "border border-gray-300 dark:border-[#2A2A2A]",
            "hover:border-green-300 hover:text-green-600 dark:hover:text-[#006239]",
            "cursor-pointer hover:shadow-sm"
          )}
        >
          <span className="font-medium">{primaryModel?.name || 'No model selected'}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Models Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className={cn(
                "w-full max-w-2xl max-h-[85vh] overflow-hidden border shadow-2xl rounded-3xl",
                "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-6 border-b",
                "bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-[#2A2A2A]"
              )}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-300 border border-transparent hover:border",
                      "text-gray-400 hover:text-gray-600 dark:hover:text-[#EDEDED]",
                      "hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:border-gray-300 dark:hover:border-[#2A2A2A]"
                    )}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#EDEDED]">
                        Select Active ICP Model
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light">
                        Choose your primary customer profile model
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300 border border-transparent hover:border",
                    "text-gray-400 hover:text-red-600 dark:hover:text-red-400",
                    "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="p-6">
                  {/* Current Primary Model */}
                  {primaryModel && (
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-3">
                        CURRENTLY ACTIVE
                      </h3>
                      <div className={cn(
                        "p-4 border rounded-2xl",
                        "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center">
                              <Star className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-[#EDEDED]">
                                  {primaryModel.name}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-700">
                                  Active
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-[#9CA3AF] font-light mt-1">
                                Last updated {format(primaryModel.updatedAt, 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div className="flex gap-4 mt-4 text-xs text-gray-600 dark:text-[#9CA3AF]">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{primaryModel.config.industries.length} industries</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{primaryModel.config.employeeRange}</span>
                          </div>
                          {primaryModel.config.productSettings?.productNames && (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>{primaryModel.config.productSettings.productNames.length} products</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Models */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-3">
                      AVAILABLE MODELS ({icpModels.length})
                    </h3>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {icpModels.map((model, index) => (
                          <motion.button
                            key={model.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleModelSelect(model.id)}
                            className={cn(
                              "w-full p-4 rounded-2xl border transition-all duration-200 text-left",
                              "group hover:border-[#006239] hover:shadow-sm",
                              model.id === primaryModel?.id
                                ? "bg-[#006239]/5 dark:bg-[#006239]/10 border-[#006239]/30"
                                : "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  model.isPrimary
                                    ? "bg-amber-100 dark:bg-amber-900/30"
                                    : "bg-gray-100 dark:bg-[#2A2A2A]"
                                )}>
                                  <Star className={cn(
                                    "w-4 h-4",
                                    model.isPrimary
                                      ? "text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400"
                                      : "text-gray-400 dark:text-[#6A6A6A]"
                                  )} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "font-medium text-gray-900 dark:text-[#EDEDED]",
                                      model.id === primaryModel?.id && "text-[#006239]"
                                    )}>
                                      {model.name}
                                    </span>
                                    {model.isPrimary && model.id !== primaryModel?.id && (
                                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
                                        Set as Primary
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-[#9CA3AF] font-light mt-1">
                                    {model.config.industries.length} industries • {format(model.updatedAt, 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              
                              {model.id === primaryModel?.id ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#006239]/10 text-[#006239] rounded-lg">
                                  <Check className="w-3 h-3" />
                                  <span className="text-xs font-medium">Active</span>
                                </div>
                              ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs font-medium text-[#006239] bg-[#006239]/5 rounded-lg border border-[#006239]/20">
                                  Switch to this model
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 mt-3 text-xs text-gray-600 dark:text-[#9CA3AF]">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>{model.config.industries.length} industries</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{model.config.employeeRange}</span>
                              </div>
                              {model.config.productSettings?.productNames && (
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span>{model.config.productSettings.productNames.length} products</span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>

                      {icpModels.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-8"
                        >
                          <div className="w-12 h-12 bg-gray-100 dark:bg-[#2A2A2A] rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-gray-400 dark:text-[#6A6A6A]" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] mb-1 text-sm">
                            No ICP Models
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-[#9CA3AF] font-light">
                            Create your first model to get started
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={cn(
                "p-4 border-t",
                "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
              )}>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#9CA3AF]">
                  <span>
                    {icpModels.length} model{icpModels.length !== 1 ? 's' : ''} available
                  </span>
                  <span className="font-medium">
                    {primaryModel ? `Active: ${primaryModel.name}` : 'No active model'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}