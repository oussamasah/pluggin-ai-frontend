// components/CompanyDetail.tsx
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Target, 
  Code, 
  TrendingUp,
  Shield,
  Calendar,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  ExternalLink,
  Edit3,
  Star,
  Download,
  Share2,
  User,
  Briefcase,
  GraduationCap,
  Languages,
  Github,
  Award,
  MailCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company } from '@/types';
import { format } from 'date-fns';

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
  onRefresh: () => void;
  onEdit?: (company: Company) => void;
}

export function CompanyDetail({ company, onClose, onRefresh, onEdit }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'technologies', label: 'Technologies', icon: Code },
    { id: 'intent', label: 'Intent Signals', icon: TrendingUp },
    { id: 'relationships', label: 'Relationships', icon: Shield },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-16 h-16 rounded-2xl border"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-900" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {company.name}
                </h1>
                {company.scoring_metrics?.fit_score?.score && (
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    company.scoring_metrics.fit_score.score >= 80
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : company.scoring_metrics.fit_score.score >= 60
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  )}>
                    {company.scoring_metrics.fit_score.score}% Fit Score
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {company.domain && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{company.domain}</span>
                  </div>
                )}
                {company.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.country}</span>
                  </div>
                )}
                {company.employee_count && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{company.employee_count.toLocaleString()} employees</span>
                  </div>
                )}
                {company.employees && company.employees.length > 0 && (
                  <div className="flex items-center gap-1 text-[#67F227]">
                    <User className="w-4 h-4" />
                    <span>{company.employees.length} profiles loaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(company)}
                className="p-2 text-gray-400 hover:text-[#67F227] transition-colors"
                title="Edit Company"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-[#67F227] transition-colors"
              title="Refresh"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-4">
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {company.linkedin_url && (
            <a
              href={company.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          {company.twitter_url && (
            <a
              href={company.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-400/20 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200/60 bg-white/50 dark:bg-gray-800/50">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-[#67F227] text-[#67F227]"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <AnimatedTabContent activeTab={activeTab}>
            {activeTab === 'overview' && <OverviewTab company={company} />}
            {activeTab === 'employees' && <EmployeesTab company={company} />}
            {activeTab === 'financials' && <FinancialsTab company={company} />}
            {activeTab === 'technologies' && <TechnologiesTab company={company} />}
            {activeTab === 'intent' && <IntentTab company={company} />}
            {activeTab === 'relationships' && <RelationshipsTab company={company} />}
          </AnimatedTabContent>
        </div>
      </div>
    </div>
  );
}

function AnimatedTabContent({ activeTab, children }: { activeTab: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto"
    >
      {children}
    </motion.div>
  );
}

// Add the new EmployeesTab component
function EmployeesTab({ company }: { company: Company }) {
  if (!company.employees || company.employees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Employee Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Employee information not available for this company.
      

        </p>
      </div>
    );
  }

  const currentEmployees = company.employees.filter(emp => emp.is_working);
  const decisionMakers = company.employees.filter(emp => emp.is_decision_maker);

  return (
    <div className="space-y-8">
      {/* Employee Summary */}
      <DetailSection icon={Users} title="Employee Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {company.employees.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Total Profiles</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentEmployees.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Current Employees</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {decisionMakers.length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Decision Makers</div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {Math.round(company.employees.reduce((acc, emp) => acc + (emp.connections_count || 0), 0) / company.employees.length)}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Avg Connections</div>
          </div>
        </div>
      </DetailSection>

      {/* Employee List */}
      <DetailSection icon={User} title="Employee Profiles">
        <div className="space-y-4">
          {company.employees.map((employee, index) => (
            <EmployeeCard key={employee.id || index} employee={employee} />
          ))}
        </div>
      </DetailSection>

      {/* Departments Breakdown */}
      {company.employees.some(emp => emp.active_experience_department) && (
        <DetailSection icon={Building2} title="Departments">
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(company.employees.map(emp => emp.active_experience_department).filter(Boolean))).map((dept, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              >
                {dept} ({company.employees.filter(emp => emp.active_experience_department === dept).length})
              </span>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

// Employee Card Component
function EmployeeCard({ employee }: { employee: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200/60 dark:border-gray-700/60">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          {employee.picture_url ? (
            <img
              src={employee.picture_url}
              alt={employee.full_name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-[#67F227] to-[#A7F205] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-900" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {employee.full_name}
              </h3>
              {employee.is_decision_maker && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  Decision Maker
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
              {employee.active_experience_title && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{employee.active_experience_title}</span>
                </div>
              )}
              {employee.active_experience_department && (
                <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {employee.active_experience_department}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              {employee.connections_count && (
                <span>{employee.connections_count.toLocaleString()} connections</span>
              )}
              {employee.followers_count && (
                <span>{employee.followers_count.toLocaleString()} followers</span>
              )}
              {employee.total_experience_duration_months && (
                <span>{Math.round(employee.total_experience_duration_months / 12)} years exp</span>
              )}
            </div>

            {employee.headline && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                {employee.headline}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {employee.linkedin_url && (
              <a
                href={employee.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {employee.github_url && (
              <a
                href={employee.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-[#67F227] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-gray-200/60 dark:border-gray-700/60"
        >
          <div className="pt-4 space-y-4">
            {/* Contact Information */}
            {(employee.primary_professional_email || employee.professional_emails) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MailCheck className="w-4 h-4" />
                  Contact
                </h4>
                <div className="space-y-1">
                  {employee.primary_professional_email && (
                    <a
                      href={`mailto:${employee.primary_professional_email}`}
                      className="block text-sm text-[#67F227] hover:text-[#A7F205] transition-colors"
                    >
                      {employee.primary_professional_email}
                    </a>
                  )}
                  {employee.professional_emails?.map((email: { professional_email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                    <a
                      key={index}
                      href={`mailto:${email.professional_email}`}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#67F227] transition-colors"
                    >
                      {email.professional_email}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {employee.inferred_skills && employee.inferred_skills.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {employee.inferred_skills.slice(0, 10).map((skill: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {employee.inferred_skills.length > 10 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      +{employee.inferred_skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            {employee.languages && employee.languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {employee.languages.map((lang: { language: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; proficiency: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      {lang.language} ({lang.proficiency})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {employee.education && employee.education.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h4>
                <div className="space-y-1">
                  {employee.education.slice(0, 3).map((edu: { degree: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; institution_name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {edu.degree} - {edu.institution_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Update the OverviewTab to include employee summary
function OverviewTab({ company }: { company: Company }) {
  return (
    <div className="space-y-8">
      {/* Company Description */}
      {company.description && (
        <DetailSection icon={Building2} title="Company Description">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {company.description}
          </p>
        </DetailSection>
      )}

      {/* Employee Summary */}
      {company.employees && company.employees.length > 0 && (
        <DetailSection icon={Users} title="Employee Insights">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {company.employees.length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Profiles</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {company.employees.filter(emp => emp.is_decision_maker).length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Decision Makers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(company.employees.reduce((acc, emp) => acc + (emp.connections_count || 0), 0) / company.employees.length).toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Avg Connections</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {Array.from(new Set(company.employees.map(emp => emp.active_experience_department).filter(Boolean))).length}
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">Departments</div>
            </div>
          </div>
        </DetailSection>
      )}

      {/* Rest of the existing OverviewTab content remains the same */}
      {/* Key Information */}
      <DetailSection icon={Target} title="Key Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailField label="Industry" value={company.industry} type="chips" />
          <DetailField label="Business Model" value={company.business_model} />
          <DetailField label="Target Market" value={company.target_market} />
          <DetailField label="Ownership Type" value={company.ownership_type} />
          <DetailField label="Funding Stage" value={company.funding_stage} />
          <DetailField label="Founded Year" value={company.founded_year} />
        </div>
      </DetailSection>

      {/* Location & Contact */}
      <DetailSection icon={MapPin} title="Location & Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Location</h4>
            <div className="space-y-2">
              {company.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{ company.location.country} {company.location.city!=undefined && " - "+company.location.city }</span>
                </div>
              )}
              {company.country_code && (
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Country Code: {company?.location?.country_code}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h4>
            <div className="space-y-2">
              {company.contact_email && (
                <a
                  href={`mailto:${company.contact_email}`}
                  className="flex items-center gap-2 text-sm text-[#67F227] hover:text-[#A7F205] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {company.contact_email}
                </a>
              )}
              {company.contact_phone && (
                <a
                  href={`tel:${company.contact_phone}`}
                  className="flex items-center gap-2 text-sm text-[#67F227] hover:text-[#A7F205] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {company.contact_phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </DetailSection>

      {/* Scoring Metrics */}
      {(company.scoring_metrics?.fit_score || company.scoring_metrics?.intent_score) && (
        <DetailSection icon={TrendingUp} title="Scoring Metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.scoring_metrics.fit_score && (
              <ScoreField 
                label="Fit Score" 
                score={company.scoring_metrics.fit_score} 
                color="green"
              />
            )}
            {company.scoring_metrics.intent_score && (
              <ScoreField 
                label="Intent Score" 
                score={company.scoring_metrics.intent_score} 
                color="blue"
              />
            )}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

// The rest of the existing components (FinancialsTab, TechnologiesTab, IntentTab, RelationshipsTab, etc.) remain the same
// ... [Keep all the existing tab components and helper components as they are]

function FinancialsTab({ company }: { company: Company }) {
  return (
    <div className="space-y-8">
      {/* Revenue & Funding */}
      <DetailSection icon={DollarSign} title="Revenue & Funding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailField 
            label="Annual Revenue" 
            value={company.annual_revenue ? `$${company.annual_revenue.toLocaleString()}` : undefined} 
          />
          <DetailField 
            label="Revenue Currency" 
            value={company.annual_revenue_currency} 
          />
          <DetailField 
            label="Total Funding" 
            value={company.total_funding ? `$${company.total_funding.toLocaleString()}` : undefined} 
          />
          <DetailField label="Employee Count" value={company.employee_count?.toLocaleString()} />
          <DetailField label="Funding Stage" value={company.funding_stage} />
        </div>
      </DetailSection>

      {/* Additional Financial Info */}
      <DetailSection icon={Calendar} title="Business Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="Founded Year" value={company.founded_year} />
          <DetailField label="Target Market" value={company.target_market} />
          <DetailField label="Business Model" value={company.business_model} />
          <DetailField label="Ownership Type" value={company.ownership_type} />
        </div>
      </DetailSection>
    </div>
  );
}

function TechnologiesTab({ company }: { company: Company }) {
    if (!company.technologies || company.technologies.length === 0) {
      return (
        <div className="text-center py-12">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Technologies Listed
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Technology stack information not available for this company.
          </p>
        </div>
      );
    }
  
    // First, create the individual categories
    const cloudTech = company.technologies.filter(tech => 
      tech.toLowerCase().includes('aws') || 
      tech.toLowerCase().includes('azure') ||
      tech.toLowerCase().includes('google cloud') ||
      tech.toLowerCase().includes('cloud')
    );
  
    const devFrameworks = company.technologies.filter(tech => 
      tech.toLowerCase().includes('react') ||
      tech.toLowerCase().includes('angular') ||
      tech.toLowerCase().includes('vue') ||
      tech.toLowerCase().includes('node') ||
      tech.toLowerCase().includes('spring') ||
      tech.toLowerCase().includes('.net')
    );
  
    const databases = company.technologies.filter(tech => 
      tech.toLowerCase().includes('sql') ||
      tech.toLowerCase().includes('mysql') ||
      tech.toLowerCase().includes('postgresql') ||
      tech.toLowerCase().includes('mongodb') ||
      tech.toLowerCase().includes('redis')
    );
  
    const toolsPlatforms = company.technologies.filter(tech => 
      tech.toLowerCase().includes('docker') ||
      tech.toLowerCase().includes('kubernetes') ||
      tech.toLowerCase().includes('jenkins') ||
      tech.toLowerCase().includes('git') ||
      tech.toLowerCase().includes('jira')
    );
  
    // Now create the "Other" category by excluding the ones we already categorized
    const otherTech = company.technologies.filter(tech => 
      !cloudTech.includes(tech) &&
      !devFrameworks.includes(tech) &&
      !databases.includes(tech) &&
      !toolsPlatforms.includes(tech)
    );
  
    // Group technologies by category
    const technologyCategories = {
      'Cloud & Infrastructure': cloudTech,
      'Development & Frameworks': devFrameworks,
      'Databases': databases,
      'Tools & Platforms': toolsPlatforms,
      'Other': otherTech
    };
  
    return (
      <div className="space-y-8">
        {/* Technology Stack Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Technology Stack ({company.technologies.length} technologies)
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {company.technologies.slice(0, 20).map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              >
                {tech}
              </span>
            ))}
            {company.technologies.length > 20 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{company.technologies.length - 20} more
              </span>
            )}
          </div>
        </div>
  
        {/* Categorized Technologies */}
        <DetailSection icon={Code} title="Technology Categories">
          <div className="space-y-6">
            {Object.entries(technologyCategories).map(([category, techs]) => {
              if (techs.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DetailSection>
      </div>
    );
  }

function IntentTab({ company }: { company: Company }) {
  if (!company.intent_signals || (typeof company.intent_signals === 'object' && Object.keys(company.intent_signals).length === 0)) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Intent Signals
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No buying intent signals detected for this company yet.
        </p>
      </div>
    );
  }

  const intentSignals = Array.isArray(company.intent_signals) 
    ? company.intent_signals 
    : [company.intent_signals];

  return (
    <div className="space-y-6">
      <DetailSection icon={TrendingUp} title="Buying Intent Signals">
        <div className="space-y-4">
          {intentSignals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {signal.name || 'Intent Signal'}
                  </span>
                  {signal.confidence && (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      signal.confidence >= 80
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : signal.confidence >= 60
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    )}>
                      {signal.confidence}% confidence
                    </span>
                  )}
                </div>
                {signal.detected_date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detected {format(new Date(signal.detected_date), 'MMM d, yyyy')}
                  </p>
                )}
                {signal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {signal.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* Intent Summary */}
      <DetailSection icon={Star} title="Intent Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {intentSignals.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Total Signals</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(intentSignals.reduce((acc, signal) => acc + (signal.confidence || 0), 0) / intentSignals.length)}%
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Avg Confidence</div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {intentSignals.filter(s => s.confidence && s.confidence >= 80).length}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">High Confidence</div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}

function RelationshipsTab({ company }: { company: Company }) {
    if (!company.relationships || (typeof company.relationships === 'object' && Object.keys(company.relationships).length === 0)) {
      return (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Relationship Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Relationship information not available for this company.
          </p>
        </div>
      );
    }
  
    const relationships = company.relationships;
  
    // Helper function to safely render relationship items
    const renderRelationshipItem = (item: any) => {
      if (typeof item === 'string') {
        return item;
      } else if (typeof item === 'object' && item !== null) {
        // Handle object case - show company_name or similar key
        return item.company_name || item.name || JSON.stringify(item);
      }
      return String(item);
    };
  
    return (
      <div className="space-y-8">
        {/* Customers */}
        {relationships.customers && relationships.customers.length > 0 && (
          <DetailSection icon={Users} title="Key Customers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationships.customers.slice(0, 9).map((customer: { similarity_score: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {renderRelationshipItem(customer)}
                  </div>
                  {/* Show similarity score if available */}
                  {typeof customer === 'object' && customer.similarity_score && (
                    <div className="text-xs text-gray-500 mt-1">
                      Similarity: {customer.similarity_score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
            {relationships.customers.length > 9 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                +{relationships.customers.length - 9} more customers
              </div>
            )}
          </DetailSection>
        )}
  
        {/* Partners */}
        {relationships.partners && relationships.partners.length > 0 && (
          <DetailSection icon={Shield} title="Business Partners">
            <div className="flex flex-wrap gap-2">
              {relationships.partners.map((partner: any, index: Key | null | undefined) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                >
                  {renderRelationshipItem(partner)}
                </span>
              ))}
            </div>
          </DetailSection>
        )}
  
        {/* Competitors */}
        {relationships.competitors && relationships.competitors.length > 0 && (
          <DetailSection icon={Target} title="Key Competitors">
            <div className="flex flex-wrap gap-2">
              {relationships.competitors.map((competitor: any, index: Key | null | undefined) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                >
                  {renderRelationshipItem(competitor)}
                </span>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    );
  }

// Reusable Components
function DetailSection({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#67F227]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailField({ 
  label, 
  value, 
  type = 'text' 
}: { 
  label: string;
  value: any;
  type?: 'text' | 'chips' | 'link' | 'email' | 'phone';
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      {type === 'chips' ? (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) ? (
            value.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              {value}
            </span>
          )}
        </div>
      ) : type === 'link' ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#67F227] hover:text-[#A7F205] transition-colors text-sm"
        >
          {value}
        </a>
      ) : type === 'email' ? (
        <a 
          href={`mailto:${value}`}
          className="text-[#67F227] hover:text-[#A7F205] transition-colors text-sm"
        >
          {value}
        </a>
      ) : type === 'phone' ? (
        <a 
          href={`tel:${value}`}
          className="text-[#67F227] hover:text-[#A7F205] transition-colors text-sm"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  );
}

function ScoreField({ 
  label, 
  score, 
  color = 'green' 
}: { 
  label: string;
  score: any;
  color: 'green' | 'blue' | 'red' | 'amber';
}) {
  const scoreValue = score?.score || 0;
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-1">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              color === 'green' && "bg-[#67F227]",
              color === 'blue' && "bg-blue-500",
              color === 'red' && "bg-red-500",
              color === 'amber' && "bg-amber-500"
            )}
            style={{ width: `${scoreValue}%` }}
          />
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium min-w-12 text-center",
          colorClasses[color]
        )}>
          {scoreValue}%
        </span>
      </div>
      {score?.reason && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{score.reason}</p>
      )}
      {score?.confidence && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Confidence: {score.confidence}%
        </p>
      )}
    </div>
  );
}