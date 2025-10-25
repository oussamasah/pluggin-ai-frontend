// components/ICPConfigForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Plus, 
  Trash2,
  Save,
  Copy,
  Target,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Code,
  Shield,
  TrendingUp,
  Filter,
  Sliders
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICPModel, ICPConfig } from '@/types'

interface ICPConfigFormProps {
  model?: ICPModel | null
  onSave: (model: Omit<ICPModel, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

const defaultConfig: ICPConfig = {
  modelName: '',
  industries: [],
  geographies: [],
  employeeRange: '51-200 employees',
  acvRange: '$1k–$10k',
  mustHaveTech: [],
  mustHaveCompliance: [],
  mustHaveMotion: 'None',
  excludedIndustries: [],
  excludedGeographies: [],
  excludedTechnologies: [],
  excludedSizeRange: '1-10 employees',
  buyingTriggers: [],
  targetPersonas: [],
  scoringWeights: {
    firmographic: 50,
    technographic: 50,
    intent: 50,
    behavioral: 50
  }
}

const employeeRanges = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
]

const acvRanges = [
  '$1k–$10k',
  '$10k–$50k',
  '$50k–$100k',
  '$100k–$500k',
  '$500k–$1M',
  '$1M+'
]

const buyingTriggerOptions = {
  financialActivities: [
    { label: 'IPO Announcement', value: 'ipo_announcement' },
    { label: 'New Funding Round', value: 'new_funding_round' },
    { label: 'New Investment', value: 'new_investment' },
  ],

  organizationalChanges: [
    { label: 'New Office', value: 'new_office' },
    { label: 'Closing Office', value: 'closing_office' },
    { label: 'Merger and Acquisitions', value: 'merger_and_acquisitions' },
  ],

  workforceTrends: [
    { label: 'Employee Joined Company', value: 'employee_joined_company' },
    { label: 'Increase in Engineering Department', value: 'increase_in_engineering_department' },
    { label: 'Increase in Sales Department', value: 'increase_in_sales_department' },
    { label: 'Increase in Marketing Department', value: 'increase_in_marketing_department' },
    { label: 'Increase in Operations Department', value: 'increase_in_operations_department' },
    { label: 'Increase in Customer Service Department', value: 'increase_in_customer_service_department' },
    { label: 'Increase in All Departments', value: 'increase_in_all_departments' },
    { label: 'Decrease in Engineering Department', value: 'decrease_in_engineering_department' },
    { label: 'Decrease in Sales Department', value: 'decrease_in_sales_department' },
    { label: 'Decrease in Marketing Department', value: 'decrease_in_marketing_department' },
    { label: 'Decrease in Operations Department', value: 'decrease_in_operations_department' },
    { label: 'Decrease in Customer Service Department', value: 'decrease_in_customer_service_department' },
    { label: 'Decrease in All Departments', value: 'decrease_in_all_departments' },
    { label: 'Hiring in Creative Department', value: 'hiring_in_creative_department' },
    { label: 'Hiring in Education Department', value: 'hiring_in_education_department' },
    { label: 'Hiring in Engineering Department', value: 'hiring_in_engineering_department' },
    { label: 'Hiring in Finance Department', value: 'hiring_in_finance_department' },
    { label: 'Hiring in Health Department', value: 'hiring_in_health_department' },
    { label: 'Hiring in Human Resources Department', value: 'hiring_in_human_resources_department' },
    { label: 'Hiring in Legal Department', value: 'hiring_in_legal_department' },
    { label: 'Hiring in Marketing Department', value: 'hiring_in_marketing_department' },
    { label: 'Hiring in Operations Department', value: 'hiring_in_operations_department' },
    { label: 'Hiring in Professional Service Department', value: 'hiring_in_professional_service_department' },
    { label: 'Hiring in Sales Department', value: 'hiring_in_sales_department' },
    { label: 'Hiring in Support Department', value: 'hiring_in_support_department' },
    { label: 'Hiring in Trade Department', value: 'hiring_in_trade_department' },
    { label: 'Hiring in Unknown Department', value: 'hiring_in_unknown_department' },
  ],

  productAndPartnershipUpdates: [
    { label: 'New Product', value: 'new_product' },
    { label: 'New Partnership', value: 'new_partnership' },
  ],

  otherSignificantEvents: [
    { label: 'Company Award', value: 'company_award' },
    { label: 'Outages and Security Breaches', value: 'outages_and_security_breaches' },
    { label: 'Cost Cutting', value: 'cost_cutting' },
    { label: 'Lawsuits and Legal Issues', value: 'lawsuits_and_legal_issues' },
  ],
};

const salesMotions = [
  'None',
  'PLG',
  'Enterprise',
  'Mid-Market',
  'SMB'
]

export function ICPConfigForm({ model, onSave, onClose }: ICPConfigFormProps) {
  const [config, setConfig] = useState<ICPConfig>(defaultConfig)
  const [isPrimary, setIsPrimary] = useState(false)

  useEffect(() => {
    if (model) {
      // Merge with default config to ensure all properties exist
      setConfig({
        ...defaultConfig,
        ...model.config,
        // Ensure scoringWeights exists with default values if missing
        scoringWeights: model.config.scoringWeights || defaultConfig.scoringWeights,
        // Ensure arrays exist
        industries: model.config.industries || [],
        geographies: model.config.geographies || [],
        mustHaveTech: model.config.mustHaveTech || [],
        mustHaveCompliance: model.config.mustHaveCompliance || [],
        excludedIndustries: model.config.excludedIndustries || [],
        excludedGeographies: model.config.excludedGeographies || [],
        excludedTechnologies: model.config.excludedTechnologies || [],
        buyingTriggers: model.config.buyingTriggers || [],
        targetPersonas: model.config.targetPersonas || [],
      })
      setIsPrimary(model.isPrimary)
    }
  }, [model])

  const handleAddChip = (field: keyof ICPConfig, value: string) => {
    const trimmedValue = value.trim();
    const currentField = config[field];
  
    if (trimmedValue && Array.isArray(currentField) && !currentField.includes(trimmedValue)) {
      setConfig(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), trimmedValue],
      }));
    }
  };
  
  const handleRemoveChip = (field: keyof ICPConfig, index: number) => {
    setConfig(prev => {
      const value = prev[field];
  
      if (Array.isArray(value)) {
        return {
          ...prev,
          [field]: value.filter((_, i) => i !== index),
        };
      }
  
      return prev;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!config.modelName.trim()) return

    onSave({
      name: config.modelName,
      isPrimary,
      config
    })
  }

// Handler for ICP Fit Scoring (firmographic & technographic)
const handleICPFitScoringChange = (firmographicValue: number) => {
  setConfig(prev => {
    const currentWeights = { ...prev.scoringWeights };
    const technographicValue = 100 - firmographicValue;
    
    return {
      ...prev,
      scoringWeights: {
        ...currentWeights,
        firmographic: firmographicValue,
        technographic: technographicValue
      }
    };
  })
}

// Handler for Intent Scoring (intent & behavioral)
const handleIntentScoringChange = (intentValue: number) => {
  setConfig(prev => {
    const currentWeights = { ...prev.scoringWeights };
    const behavioralValue = 100 - intentValue;
    
    return {
      ...prev,
      scoringWeights: {
        ...currentWeights,
        intent: intentValue,
        behavioral: behavioralValue
      }
    };
  })
}

  // Safe calculation with fallback
  const totalWeights = config.scoringWeights 
    ? Object.values(config.scoringWeights).reduce((sum, weight) => sum + weight, 0)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {model ? 'Edit ICP Model' : 'Create ICP Model'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Define your ideal customer profile with precision
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Model Name */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={config.modelName}
                  onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#67F227] focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="e.g., Enterprise SaaS ICP"
                />
                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-[#67F227] focus:ring-[#67F227] bg-white dark:bg-gray-900"
                  />
                  <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set as primary ICP model
                  </label>
                </div>
              </div>

              {/* Company Profile */}
              <FormSection 
                icon={Building2}
                title="Company Profile"
                description="Basic company characteristics and demographics"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChipInput
                    label="Industries *"
                    chips={config.industries}
                    onAdd={(value) => handleAddChip('industries', value)}
                    onRemove={(index) => handleRemoveChip('industries', index)}
                    placeholder="Add industry..."
                  />
                  <ChipInput
                    label="Geographies *"
                    chips={config.geographies}
                    onAdd={(value) => handleAddChip('geographies', value)}
                    onRemove={(index) => handleRemoveChip('geographies', index)}
                    placeholder="Add geography..."
                  />
                  <SelectInput
                    label="Employee Range *"
                    value={config.employeeRange}
                    options={employeeRanges}
                    onChange={(value) => setConfig(prev => ({ ...prev, employeeRange: value }))}
                  />
                  <SelectInput
                    label="ACV Range ($) *"
                    value={config.acvRange}
                    options={acvRanges}
                    onChange={(value) => setConfig(prev => ({ ...prev, acvRange: value }))}
                  />
                </div>
              </FormSection>

              {/* Must-Haves */}
              <FormSection 
                icon={Filter}
                title="Must-Haves"
                description="Required technologies, compliance, and business motions"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChipInput
                    label="Technology Stack"
                    chips={config.mustHaveTech}
                    onAdd={(value) => handleAddChip('mustHaveTech', value)}
                    onRemove={(index) => handleRemoveChip('mustHaveTech', index)}
                    placeholder="Add technology..."
                  />
                  <ChipInput
                    label="Compliance Requirements"
                    chips={config.mustHaveCompliance}
                    onAdd={(value) => handleAddChip('mustHaveCompliance', value)}
                    onRemove={(index) => handleRemoveChip('mustHaveCompliance', index)}
                    placeholder="Add compliance..."
                  />
                  <SelectInput
                    label="Sales Motion"
                    value={config.mustHaveMotion}
                    options={salesMotions}
                    onChange={(value) => setConfig(prev => ({ ...prev, mustHaveMotion: value }))}
                  />
                </div>
              </FormSection>

              {/* Disqualifiers */}
              <FormSection 
                icon={X}
                title="Disqualifiers"
                description="Criteria that automatically exclude companies"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChipInput
                    label="Excluded Industries"
                    chips={config.excludedIndustries}
                    onAdd={(value) => handleAddChip('excludedIndustries', value)}
                    onRemove={(index) => handleRemoveChip('excludedIndustries', index)}
                    placeholder="Add excluded industry..."
                  />
                  <ChipInput
                    label="Excluded Geographies"
                    chips={config.excludedGeographies}
                    onAdd={(value) => handleAddChip('excludedGeographies', value)}
                    onRemove={(index) => handleRemoveChip('excludedGeographies', index)}
                    placeholder="Add excluded geography..."
                  />
                  <ChipInput
                    label="Excluded Technologies"
                    chips={config.excludedTechnologies}
                    onAdd={(value) => handleAddChip('excludedTechnologies', value)}
                    onRemove={(index) => handleRemoveChip('excludedTechnologies', index)}
                    placeholder="Add excluded technology..."
                  />
                  <SelectInput
                    label="Excluded Size Range"
                    value={config.excludedSizeRange}
                    options={employeeRanges}
                    onChange={(value) => setConfig(prev => ({ ...prev, excludedSizeRange: value }))}
                  />
                </div>
              </FormSection>

              {/* Buying Triggers */}
              <FormSection 
                icon={TrendingUp}
                title="Buying Triggers"
                description="Signals that indicate purchase intent"
              >
                <div className="">
                  {Object.entries(buyingTriggerOptions).map(([category, triggers]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </h3>

                      {triggers.map(trigger => {
                        const isChecked = config.buyingTriggers.includes(trigger.value);
                        const limitReached = !isChecked && config.buyingTriggers.length >= 5;

                        return (
                          <label
                            key={trigger.value}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                              ${limitReached ? 'opacity-50 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={limitReached}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (config.buyingTriggers.length < 5) {
                                    setConfig(prev => ({
                                      ...prev,
                                      buyingTriggers: [...prev.buyingTriggers, trigger.value],
                                    }));
                                  }
                                } else {
                                  setConfig(prev => ({
                                    ...prev,
                                    buyingTriggers: prev.buyingTriggers.filter(t => t !== trigger.value),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-600 text-[#67F227] focus:ring-[#67F227] bg-white dark:bg-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {trigger.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Target Personas */}
              <FormSection 
                icon={Users}
                title="Target Personas"
                description="Decision maker titles and roles"
              >
                <ChipInput
                  label="Decision Maker Titles"
                  chips={config.targetPersonas}
                  onAdd={(value) => handleAddChip('targetPersonas', value)}
                  onRemove={(index) => handleRemoveChip('targetPersonas', index)}
                  placeholder="Add persona title..."
                />
              </FormSection>

              {/* Scoring Weights */}
              <FormSection 
  icon={Sliders}
  title="SCORING WEIGHTS"
  description="Configure scoring weights for different criteria categories"
>
  <div className="space-y-6">
    {/* ICP Fit Scoring Slider - Controls firmographic & technographic */}
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ICP Fit Scoring
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Balance between firmographic and technographic matching
        </p>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-5">
            <input
              type="range"
              min="0"
              max="100"
              value={config.scoringWeights.firmographic}
              onChange={(e) => handleICPFitScoringChange(parseInt(e.target.value))}
              className="w-full  rounded-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#67F227]"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-600 dark:text-gray-400">Firmographic</div>
            <div className="text-lg font-bold text-[#67F227]">{config.scoringWeights.firmographic}%</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600 dark:text-gray-400">Technographic</div>
            <div className="text-lg font-bold text-[#67F227]">{config.scoringWeights.technographic}%</div>
          </div>
        </div>
      </div>
    </div>

    {/* Intent Scoring Slider - Controls intent & behavioral */}
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Intent Scoring
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Balance between intent and behavioral signals
        </p>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-5">
            <input
              type="range"
              min="0"
              max="100"
              value={config.scoringWeights.intent}
              onChange={(e) => handleIntentScoringChange(parseInt(e.target.value))}
              className="w-full  rounded-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-600 dark:text-gray-400">Intent</div>
            <div className="text-lg font-bold text-[#3B82F6]">{config.scoringWeights.intent}%</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600 dark:text-gray-400">Behavioral</div>
            <div className="text-lg font-bold text-[#3B82F6]">{config.scoringWeights.behavioral}%</div>
          </div>
        </div>
      </div>
    </div>

    {/* Total Weights Display */}
  {/* Overall Distribution Display */}
  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
        Overall Distribution
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">ICP Fit Score</div>
          <div className="text-lg font-bold text-[#67F227]">100%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Firmographic: {config.scoringWeights.firmographic}% + Technographic: {config.scoringWeights.technographic}%
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Intent Score</div>
          <div className="text-lg font-bold text-[#3B82F6]">100%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Intent: {config.scoringWeights.intent}% + Behavioral: {config.scoringWeights.behavioral}%
          </div>
        </div>
      </div>
    </div>

  </div>
</FormSection>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#67F227] to-[#A7F205] text-gray-900 py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#A7F205] hover:to-[#C3F25C] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {model ? 'Update ICP Model' : 'Create ICP Model'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-96 border-l border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
          <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time configuration preview</p>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FormSection({ 
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#67F227]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ChipInput({ 
  label, 
  chips, 
  onAdd, 
  onRemove, 
  placeholder 
}: { 
  label: string
  chips: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        onAdd(inputValue)
        setInputValue('')
      }
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-3 min-h-[42px] focus-within:ring-2 focus-within:ring-[#67F227] focus-within:border-transparent bg-white dark:bg-gray-900">
        <div className="flex flex-wrap gap-2 mb-2">
          {chips.map((chip, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm"
            >
              {chip}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-green-900 dark:hover:text-green-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full border-0 focus:ring-0 p-0 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
    </div>
  )
}

function SelectInput({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#67F227] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}