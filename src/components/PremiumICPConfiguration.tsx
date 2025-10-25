// components/PremiumICPConfiguration.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  Star, 
  Trash2, 
  Edit3, 
  Copy,
  Download,
  Upload,
  ChevronRight,
  Sparkles,
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
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICPModel, ICPConfig } from '@/types'
import { format } from 'date-fns'
import { ICPConfigForm } from './ICPConfigForm'
import Link from 'next/link'
import ShaderBackground from './ui/web-gl-shader'
import { ICPConfigChat } from './ICPConfigChat'

export function PremiumICPConfiguration() {
  const { icpModels, primaryModel, saveIcpModel, setPrimaryModel, deleteIcpModel   ,
    openICPConfigChat,
    isICPConfigChatOpen } = useSession()
  const [selectedModel, setSelectedModel] = useState<ICPModel | null>(null)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ICPModel | null>(null)

  const handleSaveModel = (modelData: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveIcpModel(modelData)
    setShowConfigForm(false)
    setEditingModel(null)
  }

  const handleEditModel = (model: ICPModel) => {
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
    <div className="h-full flex bg-black/80">
         <ShaderBackground />

      {/* Models Sidebar */}
      <div className="w-80  bg-slate-900/80 border-r border-gray-200/60  flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-xl">
                <Target className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#67F227] to-[#A7F205] bg-clip-text text-transparent">
                  ICP Trainer
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your ideal customer profiles</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingModel(null)
              setShowConfigForm(true)
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-[#67F227] to-[#A7F205] text-gray-900 rounded-xl hover:from-[#A7F205] hover:to-[#C3F25C] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New ICP Model</span>
          </button>
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
                  "group p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  selectedModel?.id === model.id
                    ? "bg-green-50 dark:bg-green-900/20 border-[#67F227] dark:border-[#67F227] shadow-sm"
                    : model.isPrimary
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 shadow-sm"
                    : "bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 hover:border-[#67F227] dark:hover:border-[#67F227] hover:shadow-sm"
                )}
                onClick={() => setSelectedModel(model)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{model.name}</h3>
                    {model.isPrimary && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateModel(model)
                      }}
                      className="p-1 text-gray-400 hover:text-[#67F227] transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditModel(model)
                      }}
                      className="p-1 text-gray-400 hover:text-[#67F227] transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{model.config.industries.length} industries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{model.config.employeeRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{model.config.acvRange}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {format(model.updatedAt, 'MMM d, yyyy')}
                  </span>
                  {!model.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPrimaryModel(model.id)
                      }}
                      className="text-xs text-gray-400 hover:text-amber-600 transition-colors"
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
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No ICP Models</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create your first ICP model to get started</p>
              <button
                onClick={() => setShowConfigForm(true)}
                className="bg-[#67F227] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#A7F205] transition-colors"
              >
                Create Model
              </button>
            </motion.div>
          )}
        </div>

        {/* Primary Model Badge */}
        {primaryModel && (
          <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-amber-50/50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium text-amber-900 dark:text-amber-100">Primary Model</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 truncate mt-1">{primaryModel.name}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
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
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-screen"
            >
              {/* <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 dark:from-green-900/20 to-green-50 dark:to-green-800/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sliders className="w-10 h-10 text-[#67F227]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Configure Your Ideal Customer Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select an ICP model from the sidebar to view and edit its configuration, 
                  or create a new model to define your perfect customer criteria.
                </p>
                <button
                  onClick={() => setShowConfigForm(true)}
                  className="bg-gradient-to-r from-[#67F227] to-[#A7F205] text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A7F205] hover:to-[#C3F25C] transition-all duration-300"
                >
                  Create New Model
                </button>
              </div> */}
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{model.name}</h1>
              {model.isPrimary && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500" />
                  Primary
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!model.isPrimary && (
              <button
                onClick={() => onSetPrimary(model.id)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
              >
                <Star className="w-4 h-4" />
                Set Primary
              </button>
            )}
            <button
              onClick={() => onEdit(model)}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
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
              className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Last updated {format(model.updatedAt, 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Configuration Preview */}
      <div className="flex-1 overflow-y-auto max-h-[700px]   p-6">
       
        <div className="max-w-4xl mx-auto space-y-8 ">
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
              <ConfigField label="ACV Range" value={model.config.acvRange} />
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
              {model.config.scoringWeights && Object.entries(model.config.scoringWeights)?.map(([category, weight]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#67F227] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(weight / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">{weight}/10</span>
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
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#67F227]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      {type === 'chips' ? (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">None specified</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-900 dark:text-white">{value || <span className="text-gray-500 dark:text-gray-400 italic">Not specified</span>}</p>
      )}
    </div>
  )
}