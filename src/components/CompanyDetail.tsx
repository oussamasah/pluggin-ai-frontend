import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Github,
  ExternalLink,
  Edit3,
  Star,
  Download,
  X,
  Crown,
  BarChart3,
  Database,
  Briefcase,
  GraduationCap,
  Languages,
  MailCheck,
  User,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company } from '@/types';
import { format } from 'date-fns';
import { GTMIntelligenceReport } from './GTMIntelligenceReportProps ';
import { useUser } from '@clerk/nextjs';
import { PersonaReportSidePanel } from './PersonaReportSidePanel';
import { useSession } from '@/context/SessionContext';

// Brand Colors
const ACCENT_GREEN = '#006239'
const ACTIVE_GREEN = '#006239'

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
  onRefresh: () => void;
  onEdit?: (company: Company) => void;
}

export function CompanyDetail({ company, onClose, onRefresh, onEdit }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);
  
  useEffect (() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'gtmintelligence', label: 'GTM Intelligence', icon: Target }, // Fixed typo and changed icon
    { id: 'employees', label: 'Persona', icon: Users },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'technologies', label: 'Technologies', icon: Code },
    { id: 'intent', label: 'Intent Signals', icon: TrendingUp },
    { id: 'relationships', label: 'Relationships', icon: Shield },
  ];
  

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0F0F0F]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-16 h-16 rounded-2xl border border-gray-300 dark:border-[#3A3A3A]"
              />
            ) : (
              <div className="w-16 h-16 bg-[#006239] rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#EDEDED] truncate">
                  {company.name}
                </h1>
                {company.scoring_metrics?.fit_score?.score && (
                  <div className={cn(
                    "px-3 py-1 text-sm font-medium rounded-xl",
                    company.scoring_metrics.fit_score.score >= 80
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : company.scoring_metrics.fit_score.score >= 60
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  )}>
                    {company.scoring_metrics.fit_score.score}% Fit Score
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-[#9CA3AF]">
                {company.domain && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-[#006239]" />
                    <span>{company.domain}</span>
                  </div>
                )}
                {company.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#006239]" />
                    <span>{company.country}</span>
                  </div>
                )}
                {company.employee_count && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[#006239]" />
                    <span>{company.employee_count.toLocaleString()} employees</span>
                  </div>
                )}
                {company.employees && company.employees.length > 0 && (
                  <div className="flex items-center gap-1 text-[#006239]">
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
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
                title="Edit Company"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
 
            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-gray-600 dark:hover:text-[#EDEDED] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 mt-4">
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] text-sm hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors border border-gray-300 dark:border-[#3A3A3A] rounded-xl"
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] text-sm hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors border border-gray-300 dark:border-[#3A3A3A] rounded-xl"
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#9CA3AF] text-sm hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors border border-gray-300 dark:border-[#3A3A3A] rounded-xl"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F]">
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
                      ? "border-[#006239] text-[#006239]"
                      : "border-transparent text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#EDEDED]"
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
  {activeTab === 'gtmintelligence' && (
    <GTMIntelligenceReport 
      markdownContent={company.overview?.overview || company.description || 'No GTM intelligence report available.'} 
      companyName={company.name} 
    />
  )}
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
      className="mx-auto"
    >
      {children}
    </motion.div>
  );
}

// Add the new EmployeesTab component
// Add the new EmployeesTab component
function EmployeesTab({ company }: { company: Company }) {
  // Check if employees data exists and is an array
  const hasEmployees = Array.isArray(company.employees) && company.employees.length > 0;
  
  if (!hasEmployees) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 dark:text-[#6A6A6A] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">
          No Employee Data
        </h3>
        <p className="text-gray-600 dark:text-[#9CA3AF]">
          {company.employee_count ? 
            `This company has ${company.employee_count.toLocaleString()} employees, but detailed profiles are not available.` :
            'Employee information not available for this company.'
          }
        </p>
      </div>
    );
  }

  // Filter employees - use isWorking instead of is_working
  const currentEmployees = company.employees.filter(emp => emp.isWorking !== false);
  const decisionMakers = company.employees.filter(emp => emp.isDecisionMaker === true);

  return (
    <div className="space-y-8">
      {/* Employee Summary */}
      <DetailSection icon={Users} title="Persona Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            value={company.employees.length.toString()}
            label="Total Profiles"
            color="green"
          />
          <StatCard
            value={currentEmployees.length.toString()}
            label="Current Employees"
            color="blue"
          />
          <StatCard
            value={decisionMakers.length.toString()}
            label="Decision Makers"
            color="purple"
          />
          <StatCard
            value={Math.round(company.employees.reduce((acc, emp) => acc + (emp.connectionsCount || 0), 0) / company.employees.length).toString()}
            label="Avg LinkedIn Connections"
            color="orange"
          />
        </div>
      </DetailSection>

      {/* Employee List */}
      <DetailSection icon={User} title="Profiles">
        <div className="space-y-4">
          {company.employees.map((employee, index) => (
            <EmployeeCard key={employee.coresignalEmployeeId || employee._id || index} employee={employee} />
          ))}
        </div>
      </DetailSection>

      {/* Departments Breakdown */}
      {company.employees.some(emp => emp.activeExperienceDepartment) && (
        <DetailSection icon={Building2} title="Departments">
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(company.employees.map(emp => emp.activeExperienceDepartment).filter(Boolean))).map((dept, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                {dept} ({company.employees.filter(emp => emp.activeExperienceDepartment === dept).length})
              </span>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

// Updated Employee Card Component
// Updated Employee Card Component with better error handling
function EmployeeCard({ employee }: { employee: any }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useUser();
  const {
    currentSession,
    startSearch,
    icpModels,
    primaryModel,
    isConnected,
    updateSessionQuery,
    refineSearch,
    analyzeSignals,
    handleResultsAction
  } = useSession()
  const userId = user?.id;
  const [showPersonaReport, setShowPersonaReport] = useState(false);
  const [isLoadingPersona, setIsLoadingPersona] = useState(false);
  const [personaData, setPersonaData] = useState<{
    markdownContent?: string;
    employeeName?: string;
    companyName?: string;
    employeeRole?: string;
  } | null>(null);
  
  // Safely access employee properties with fallbacks
  const fullName = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const isDecisionMaker = employee.isDecisionMaker === true;
  const isWorking = employee.isWorking !== false; // Default to true if not specified
  const title = employee.activeExperienceTitle || employee.headline;
  const department = employee.activeExperienceDepartment;
  const connections = employee.connectionsCount || 0;
  const followers = employee.followersCount || 0;
  const experienceYears = employee.totalExperienceDurationMonths ? Math.round(employee.totalExperienceDurationMonths / 12) : null;

  const handleCardClick = async (e: React.MouseEvent) => {
    // Don't trigger if clicking on links or expand button
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    
    // Open the side panel immediately with loading state
    setShowPersonaReport(true);
    setIsLoadingPersona(true);
    
    try {
      if (!userId) {
        throw new Error('userId is required');
      }
      
      const req = {
        employeeId: employee?._id,
        icpModelId: primaryModel?.id,
        companyId: employee?.companyId
      };
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/gtm_persona`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify(req),
        }
      );
      
      const data = await response.json();
      
      setPersonaData({
        markdownContent: data?.data?.personaIntelligence?.overview,
        employeeName: fullName,
        employeeRole: title,
        companyName: employee.companyName || 'Unknown Company',
      });
      
      console.log("response data", data?.data?.personaIntelligence?.overview);
      
    } catch (e) {
      console.log(e);
      setPersonaData({
        markdownContent: undefined,
        employeeName: fullName,
        employeeRole: title,
        companyName: employee.companyName || 'Unknown Company'
      });
    } finally {
      setIsLoadingPersona(false);
    }
  };

  const handleClosePanel = () => {
    setShowPersonaReport(false);
    // Clear data after animation completes
    setTimeout(() => {
      setPersonaData(null);
    }, 300);
  };
  // Safely handle professionalEmails data structure
  const getProfessionalEmails = () => {
    if (!employee.professionalEmails) return [];
    
    // Handle both array of strings and array of objects
    return employee.professionalEmails.map((email: any) => {
      if (typeof email === 'string') return email;
      if (typeof email === 'object' && email.professional_email) return email.professional_email;
      if (typeof email === 'object' && email.professionalEmail) return email.professionalEmail;
      return null;
    }).filter(Boolean);
  };

  const professionalEmails = getProfessionalEmails();

  return (
    <>
      {/* Persona Report Side Panel - Outside of card to prevent click bubbling */}
      <PersonaReportSidePanel
        isOpen={showPersonaReport}
        onClose={handleClosePanel}
        isLoading={isLoadingPersona}
        employeeData={personaData}
      />
      
      <div 
        className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2A2A2A] rounded-2xl overflow-hidden cursor-pointer hover:border-[#006239] hover:shadow-md transition-all duration-200"  
        onClick={handleCardClick}
      >
        <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          {employee.pictureUrl ? (
            <img
              src={employee.pictureUrl}
              alt={fullName}
              className="w-12 h-12 rounded-xl border border-gray-300 dark:border-[#3A3A3A] object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-[#006239] rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-[#EDEDED] truncate">
                {fullName}
              </h3>
              {isDecisionMaker && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg">
                  Decision Maker
                </span>
              )}
              {!isWorking && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg">
                  Former Employee
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-[#9CA3AF] mb-2">
              {title && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-[#006239]" />
                  <span>{title}</span>
                </div>
              )}
              {department && (
                <span className="bg-gray-200 dark:bg-[#2A2A2A] px-2 py-1 text-xs rounded-lg text-gray-700 dark:text-[#9CA3AF]">
                  {department}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#6A6A6A]">
              {connections > 0 && (
                <span>{connections.toLocaleString()} connections</span>
              )}
              {followers > 0 && (
                <span>{followers.toLocaleString()} followers</span>
              )}
              {experienceYears && experienceYears > 0 && (
                <span>{experienceYears} years exp</span>
              )}
            </div>

            {employee.headline && (
              <p className="text-sm text-gray-700 dark:text-[#9CA3AF] mt-2 line-clamp-2">
                {employee.headline}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {employee.linkedinUrl && (
              <a
                href={employee.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {employee.githubUrl && (
              <a
                href={employee.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-xl"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 border-t border-gray-300 dark:border-[#2A2A2A]"
          >
            <div className="pt-4 space-y-4">
              {/* Contact Information */}
              {(employee.primaryProfessionalEmail || professionalEmails.length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-2 flex items-center gap-2">
                    <MailCheck className="w-4 h-4 text-[#006239]" />
                    Contact
                  </h4>
                  <div className="space-y-1">
                    {employee.primaryProfessionalEmail && (
                      <a
                        href={`mailto:${employee.primaryProfessionalEmail}`}
                        className="block text-sm text-[#006239] hover:text-[#006239] transition-colors"
                      >
                        {employee.primaryProfessionalEmail}
                      </a>
                    )}
                    {professionalEmails.map((email: string, index: number) => (
                      <a
                        key={index}
                        href={`mailto:${email}`}
                        className="block text-sm text-gray-600 dark:text-[#9CA3AF] hover:text-[#006239] transition-colors"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {employee.inferredSkills && employee.inferredSkills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {employee.inferredSkills.slice(0, 10).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-[#006239]/10 text-[#006239] border border-[#006239]/20 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                    {employee.inferredSkills.length > 10 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF] rounded-lg">
                        +{employee.inferredSkills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {employee.languages && employee.languages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-[#006239]" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {employee.languages.map((lang: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg"
                      >
                        {typeof lang === 'string' ? lang : lang.language} 
                        {typeof lang === 'object' && lang.proficiency ? ` (${lang.proficiency})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {employee.educationHistory && employee.educationHistory.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#006239]" />
                    Education
                  </h4>
                  <div className="space-y-1">
                    {employee.educationHistory.slice(0, 3).map((edu: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-[#9CA3AF]">
                        {edu.degree || 'Degree not specified'} - {edu.institutionName || edu.institution_name || 'Institution not specified'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {employee.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
                    {employee.summary}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

// Update the OverviewTab to include employee summary
function OverviewTab({ company }: { company: Company }) {
  
  const currentEmployees = company.employees.filter(emp => emp.isWorking !== false);
  const decisionMakers = company.employees.filter(emp => emp.isDecisionMaker === true);
  return (
    <div className="space-y-8">
      {/* Company Description */}
      {company.description && (
        <DetailSection icon={Building2} title="Company Description">
          <p className="text-gray-700 dark:text-[#9CA3AF] leading-relaxed">
            {company.description}
          </p>
        </DetailSection>
      )}

      {/* Employee Summary */}
      <DetailSection icon={Users} title="Persona Summary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            value={company.employees.length.toString()}
            label="Total Profiles"
            color="green"
          />
          <StatCard
            value={currentEmployees.length.toString()}
            label="Current Employees"
            color="blue"
          />
          <StatCard
            value={decisionMakers.length.toString()}
            label="Decision Makers"
            color="purple"
          />
          <StatCard
            value={Math.round(company.employees.reduce((acc, emp) => acc + (emp.connectionsCount || 0), 0) / company.employees.length).toString()}
            label="Avg LinkedIn Connections"
            color="orange"
          />
        </div>
      </DetailSection>


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
            <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-3">Location</h4>
            <div className="space-y-2">
              {company.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#9CA3AF]">
                  <MapPin className="w-4 h-4 text-[#006239]" />
                  <span>{ company.location?.country} {company.location?.city && " - "+company.location.city }</span>
                </div>
              )}
              {company.country_code && (
                <div className="text-sm text-gray-500 dark:text-[#6A6A6A]">
                  Country Code: {company?.location?.country_code}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-3">Contact Information</h4>
            <div className="space-y-2">
              {company.contact_email && (
                <a
                  href={`mailto:${company.contact_email}`}
                  className="flex items-center gap-2 text-sm text-[#006239] hover:text-[#006239] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {company.contact_email}
                </a>
              )}
              {company.contact_phone && (
                <a
                  href={`tel:${company.contact_phone}`}
                  className="flex items-center gap-2 text-sm text-[#006239] hover:text-[#006239] transition-colors"
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

function FinancialsTab({ company }: { company: Company }) {
  // Format currency function to match CompaniesList
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Revenue & Funding */}
      <DetailSection icon={DollarSign} title="Revenue & Funding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailField 
            label="Annual Revenue" 
            value={company.annual_revenue ? formatCurrency(company.annual_revenue, company.annual_revenue_currency) : undefined} 
          />
          <DetailField 
            label="Revenue Currency" 
            value={company.annual_revenue_currency} 
          />
          <DetailField 
            label="Total Funding" 
            value={company.total_funding ? formatCurrency(company.total_funding) : undefined} 
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
          <Code className="w-12 h-12 text-gray-400 dark:text-[#6A6A6A] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">
            No Technologies Listed
          </h3>
          <p className="text-gray-600 dark:text-[#9CA3AF]">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-4">
            Technology Stack ({company.technologies.length} technologies)
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {company.technologies.slice(0, 20).map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                {tech}
              </span>
            ))}
            {company.technologies.length > 20 && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-[#9CA3AF] rounded-lg">
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
                  <h4 className="font-medium text-gray-900 dark:text-[#EDEDED] mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 text-sm bg-[#006239]/10 text-[#006239] border border-[#006239]/20 rounded-lg"
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
        <TrendingUp className="w-12 h-12 text-gray-400 dark:text-[#6A6A6A] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">
          No Intent Signals
        </h3>
        <p className="text-gray-600 dark:text-[#9CA3AF]">
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
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2A2A2A] rounded-2xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900 dark:text-[#EDEDED]">
                    {signal.name || 'Intent Signal'}
                  </span>
                  {signal.confidence && (
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-lg",
                      signal.confidence >= 80
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : signal.confidence >= 60
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    )}>
                      {signal.confidence}% confidence
                    </span>
                  )}
                </div>
                {signal.detected_date && (
                  <p className="text-sm text-gray-500 dark:text-[#6A6A6A]">
                    Detected {format(new Date(signal.detected_date), 'MMM d, yyyy')}
                  </p>
                )}
                {signal.description && (
                  <p className="text-sm text-gray-600 dark:text-[#9CA3AF] mt-1">
                    {signal.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg">
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
          <StatCard
            value={intentSignals.length.toString()}
            label="Total Signals"
            color="green"
          />
          <StatCard
            value={`${Math.round(intentSignals.reduce((acc, signal) => acc + (signal.confidence || 0), 0) / intentSignals.length)}%`}
            label="Avg Confidence"
            color="blue"
          />
          <StatCard
            value={intentSignals.filter(s => s.confidence && s.confidence >= 80).length.toString()}
            label="High Confidence"
            color="orange"
          />
        </div>
      </DetailSection>
    </div>
  );
}

function RelationshipsTab({ company }: { company: Company }) {
    if (!company.relationships || (typeof company.relationships === 'object' && Object.keys(company.relationships).length === 0)) {
      return (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 dark:text-[#6A6A6A] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED] mb-2">
            No Relationship Data
          </h3>
          <p className="text-gray-600 dark:text-[#9CA3AF]">
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
                <div key={index} className="p-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2A2A2A] rounded-2xl">
                  <div className="font-medium text-gray-900 dark:text-[#EDEDED]">
                    {renderRelationshipItem(customer)}
                  </div>
                  {/* Show similarity score if available */}
                  {typeof customer === 'object' && customer.similarity_score && (
                    <div className="text-xs text-gray-500 dark:text-[#6A6A6A] mt-1">
                      Similarity: {customer.similarity_score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
            {relationships.customers.length > 9 && (
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-[#6A6A6A]">
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
                  className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg"
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
                  className="inline-flex items-center px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg"
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
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2A2A2A] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#006239]/10 flex items-center justify-center border border-[#006239]/20 rounded-xl">
          <Icon className="w-5 h-5 text-[#006239]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EDEDED]">{title}</h3>
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
      <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">{label}</label>
      {type === 'chips' ? (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) ? (
            value.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-[#006239]/10 text-[#006239] border border-[#006239]/20 rounded-lg"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-[#006239]/10 text-[#006239] border border-[#006239]/20 rounded-lg">
              {value}
            </span>
          )}
        </div>
      ) : type === 'link' ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#006239] hover:text-[#006239] transition-colors text-sm"
        >
          {value}
        </a>
      ) : type === 'email' ? (
        <a 
          href={`mailto:${value}`}
          className="text-[#006239] hover:text-[#006239] transition-colors text-sm"
        >
          {value}
        </a>
      ) : type === 'phone' ? (
        <a 
          href={`tel:${value}`}
          className="text-[#006239] hover:text-[#006239] transition-colors text-sm"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900 dark:text-[#EDEDED]">{value}</p>
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
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-[#9CA3AF] mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-32 bg-gray-200 dark:bg-[#2A2A2A] h-2 flex-1 rounded-full">
          <div 
            className={cn(
              "h-2 transition-all duration-300 rounded-full",
              color === 'green' && "bg-[#006239]",
              color === 'blue' && "bg-blue-500",
              color === 'red' && "bg-red-500",
              color === 'amber' && "bg-amber-500"
            )}
            style={{ width: `${scoreValue}%` }}
          />
        </div>
        <span className={cn(
          "px-2 py-1 text-xs font-medium min-w-12 text-center border rounded-lg",
          colorClasses[color]
        )}>
          {scoreValue}%
        </span>
      </div>
      {score?.reason && (
        <p className="text-xs text-gray-500 dark:text-[#6A6A6A] mt-1">{score.reason}</p>
      )}
      {score?.confidence && (
        <p className="text-xs text-gray-500 dark:text-[#6A6A6A] mt-1">
          Confidence: {score.confidence}%
        </p>
      )}
    </div>
  );
}

// StatCard component to match CompaniesList styling
function StatCard({ value, label, color }: { 
  value: string; 
  label: string; 
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-[#006239] border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  }

  return (
    <div className={cn(
      "p-4 rounded-2xl border text-center",
      colorClasses[color]
    )}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600 dark:text-[#9CA3AF]">{label}</div>
    </div>
  )
}