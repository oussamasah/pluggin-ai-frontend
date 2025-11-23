// components/PremiumICPConfiguration.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Star, 
  Trash2, 
  Edit3, 
  Copy,
  ChevronRight,
  Target,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Code,
  Shield,
  TrendingUp,
  X,
  Filter,
  Sliders,
  ArrowLeft,
  Crown,
  Database,
  Sparkles,
  PlusCircle,
  Package,
  Lightbulb,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICPModel, ICPConfig } from '@/types'
import { format } from 'date-fns'
import { ICPConfigForm } from './ICPConfigForm'
import Link from 'next/link'
import { ICPConfigChat } from './ICPConfigChat'

// Brand Colors
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

export function PremiumICPConfiguration() {
  const { icpModels, primaryModel, saveIcpModel, setPrimaryModel, deleteIcpModel } = useSession()
  const [selectedModel, setSelectedModel] = useState<ICPModel | null>(null)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ICPModel | null>(null)

  const handleSaveModel = (modelData: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveIcpModel(modelData)
    setShowConfigForm(false)
    setEditingModel(null)
  }

  const handleEditModel = (model: ICPModel|null) => {
    setEditingModel(model)
    setShowConfigForm(true)
  }

  const handleDuplicateModel = (model: ICPModel) => {
    const duplicatedModel: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `${model.name} (Copy)`,
      isPrimary: false,
      config: { ...model.config }
    }
    saveIcpModel(duplicatedModel)
  }

  return (
    <div className="relative flex bg-white dark:bg-[#0F0F0F]">
      {/* Models Sidebar - UPDATED STYLING */}
      <div className="w-80 bg-white dark:bg-[#0F0F0F] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#EDEDED] rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#006239] rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">ICP Models</h1>
                <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">Manage customer profiles</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-end cursor-pointer" onClick={(e)=>handleEditModel(null)}>
            <PlusCircle className="text-sm text-[#006239]" />
            <span className='text-sm text-[#006239]'>Add new ICP</span>
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {icpModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group p-4 border cursor-pointer transition-all duration-200 rounded-2xl",
                  selectedModel?.id === model.id
                    ? "bg-[#006239]/10 border-[#006239]"
                    : model.isPrimary
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                    : "bg-white dark:bg-[#1A1A1A] border-gray-300 dark:border-[#2A2A2A] hover:border-[#006239]"
                )}
                onClick={() => setSelectedModel(model)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-[#EDEDED] text-sm">{model.name}</h3>
                    {model.isPrimary && (
                      <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateModel(model)
                      }}
                      className="p-1 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditModel(model)
                      }}
                      className="p-1 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-600 dark:text-[#9CA3AF]">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#006239]" />
                    <span>{model.config.industries.length} industries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#006239]" />
                    <span>{model.config.employeeRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-[#006239]" />
                    <span>{model.config.productSettings?.productNames?.length || 0} products</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 dark:text-[#6A6A6A]">
                    {format(model.updatedAt, 'MMM d, yyyy')}
                  </span>
                  {!model.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPrimaryModel(model.id)
                      }}
                      className="text-xs text-gray-400 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      Set primary
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {icpModels.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-[#2A2A2A] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-gray-400 dark:text-[#6A6A6A]" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-[#EDEDED] mb-1 text-sm">No ICP Models</h3>
              <p className="text-xs text-gray-600 dark:text-[#9CA3AF]">Create your first model to get started</p>
            </motion.div>
          )}
        </div>

        {/* Primary Model Badge - UPDATED STYLING */}
        {primaryModel && (
          <div className="p-4 border-t border-gray-200 dark:border-[#2A2A2A] bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
              <span className="font-medium text-amber-900 dark:text-amber-300">Primary Model</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 truncate mt-1">{primaryModel.name}</p>
          </div>
        )}
      </div>

      {/* Main Content - Always show chat interface */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedModel ? (
            <motion.div
              key={`detail-${selectedModel.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <ICPModelDetail 
                model={selectedModel} 
                onEdit={handleEditModel}
                onDelete={deleteIcpModel}
                onSetPrimary={setPrimaryModel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ICPConfigChat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Configuration Form Modal */}
      <AnimatePresence>
        {showConfigForm && (
          <ICPConfigForm
            model={editingModel}
            onSave={handleSaveModel}
            onClose={() => {
              setShowConfigForm(false)
              setEditingModel(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ICPModelDetail({ 
  model, 
  onEdit, 
  onDelete, 
  onSetPrimary 
}: { 
  model: ICPModel
  onEdit: (model: ICPModel) => void
  onDelete: (id: string) => void
  onSetPrimary: (id: string) => void
}) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0F0F0F]">
      {/* Header - UPDATED STYLING */}
      <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED]">{model.name}</h1>
              {model.isPrimary && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 text-sm font-medium flex items-center gap-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400" />
                  Primary
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!model.isPrimary && (
              <button
                onClick={() => onSetPrimary(model.id)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium rounded-xl border border-amber-200 dark:border-amber-800"
              >
                <Star className="w-4 h-4" />
                Set Primary
              </button>
            )}
            <button
              onClick={() => onEdit(model)}
              className="flex items-center gap-2 px-4 py-2 bg-[#006239]/10 text-[#006239] hover:bg-[#006239]/20 transition-colors text-sm font-medium rounded-xl border border-[#006239]/20"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this ICP model?')) {
                  onDelete(model.id)
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium rounded-xl border border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-[#9CA3AF] mt-2">
          Last updated {format(model.updatedAt, 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Configuration Preview - UPDATED STYLING */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Product Settings */}
          {model.config.productSettings && (
            <ConfigSection 
              icon={Package}
              title="Product Settings"
              description="Your product's value proposition and unique selling points"
            >
              <div className="space-y-6">
                <ConfigField label="Product Names" value={model.config.productSettings.productNames} type="chips" />
                <ConfigField label="Value Proposition" value={model.config.productSettings.valueProposition} type="text" />
                <ConfigField label="Unique Selling Points" value={model.config.productSettings.uniqueSellingPoints} type="chips" />
                <ConfigField label="Pain Points Solved" value={model.config.productSettings.painPointsSolved} type="chips" />
              </div>
            </ConfigSection>
          )}

          {/* Company Profile */}
          <ConfigSection 
            icon={Building2}
            title="Company Profile"
            description="Basic company characteristics and demographics"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigField label="Industries" value={model.config.industries} type="chips" />
              <ConfigField label="Geographies" value={model.config.geographies} type="chips" />
              <ConfigField label="Employee Range" value={model.config.employeeRange} />
              <ConfigField label="Annual Revenue" value={model.config.annualRevenue} />
            </div>
          </ConfigSection>

          {/* Must-Haves */}
          <ConfigSection 
            icon={Filter}
            title="Must-Haves"
            description="Required technologies, compliance, and business motions"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigField label="Technology Stack" value={model.config.mustHaveTech} type="chips" />
              <ConfigField label="Compliance Requirements" value={model.config.mustHaveCompliance} type="chips" />
              <ConfigField label="Sales Motion" value={model.config.mustHaveMotion} />
            </div>
          </ConfigSection>

          {/* Disqualifiers */}
          <ConfigSection 
            icon={X}
            title="Disqualifiers"
            description="Criteria that automatically exclude companies"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigField label="Excluded Industries" value={model.config.excludedIndustries} type="chips" />
              <ConfigField label="Excluded Geographies" value={model.config.excludedGeographies} type="chips" />
              <ConfigField label="Excluded Technologies" value={model.config.excludedTechnologies} type="chips" />
              <ConfigField label="Excluded Size Range" value={model.config.excludedSizeRange} />
            </div>
          </ConfigSection>

          {/* Buying Triggers */}
          <ConfigSection 
            icon={TrendingUp}
            title="Buying Triggers"
            description="Signals that indicate purchase intent"
          >
            <ConfigField label="Triggers" value={model.config.buyingTriggers} type="chips" />
          </ConfigSection>

          {/* Target Personas */}
          <ConfigSection 
            icon={Users}
            title="Target Personas"
            description="Decision maker titles and roles"
          >
            <ConfigField label="Decision Maker Titles" value={model.config.targetPersonas} type="chips" />
          </ConfigSection>

          {/* Scoring Weights */}
          <ConfigSection 
            icon={Sliders}
            title="Scoring Weights"
            description="Relative importance of different criteria categories"
          >
            <div className="space-y-4">
              {model.config.scoringWeights && Object.entries(model.config.scoringWeights).map(([category, weight]) => (
                <div key={category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2A2A2A]">
                  <span className="font-medium text-gray-700 dark:text-[#EDEDED] capitalize">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white dark:bg-[#2A2A2A] rounded-full h-2">
                      <div 
                        className="bg-[#006239] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${weight}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-[#9CA3AF] w-12 text-right">
                      {weight}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ConfigSection>
        </div>
      </div>
    </div>
  )
}

function ConfigSection({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: { 
  icon: any
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2A2A2A] p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#006239]/10 flex items-center justify-center border border-[#006239]/20 rounded-xl">
          <Icon className="w-5 h-5 text-[#006239]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function ConfigField({ 
  label, 
  value, 
  type = 'text' 
}: { 
  label: string
  value: any
  type?: 'text' | 'chips'
}) {
  const displayValue = value || (type === 'chips' ? [] : '')
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">{label}</label>
      {type === 'chips' ? (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(displayValue) && displayValue.length > 0 ? (
            displayValue.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-[#006239]/10 text-[#006239] border border-[#006239]/20 rounded-lg"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-[#6A6A6A] italic">None specified</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-900 dark:text-[#EDEDED]">
          {displayValue || <span className="text-gray-500 dark:text-[#6A6A6A] italic">Not specified</span>}
        </p>
      )}
    </div>
  )
}