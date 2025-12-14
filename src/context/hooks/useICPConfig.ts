import { useState, useCallback } from 'react'
import {  ICPConfig } from '@/types'


export function useICPConfig(sessionState: any, userId: string) {
  const [isICPConfigChatOpen, setIsICPConfigChatOpen] = useState(false)
  const [icpConfigConversation, setIcpConfigConversation] = useState<any[]>([])
  const [isICPConfigLoading, setIsICPConfigLoading] = useState(false)
  const [currentICPSuggestion, setCurrentICPSuggestion] = useState<any>()

  const openICPConfigChat = useCallback(async () => {
    setIsICPConfigChatOpen(true)
    setIsICPConfigLoading(true)
    
    try {
      const welcomeMessage: any = {
        role: 'assistant',
        content: `👋 **ICP Configuration Assistant** 

I'll help you build the perfect Ideal Customer Profile through conversation.

**To get started, tell me about:**
• What product/service you're selling
• Your target market or ideal customers  
• Any specific company characteristics you're looking for

The more details you provide, the better I can tailor your ICP!`
      }

      setIcpConfigConversation([welcomeMessage])
    } catch (error) {
      console.error('Failed to initialize ICP config chat:', error)
      setIcpConfigConversation([{
        role: 'assistant',
        content: `👋 **ICP Configuration Assistant** 
I'll help you build the perfect Ideal Customer Profile through conversation.`
      }])
    } finally {
      setIsICPConfigLoading(false)
    }
  }, [userId])

  const closeICPConfigChat = useCallback(() => {
    setIsICPConfigChatOpen(false)
    setIcpConfigConversation([])
    setCurrentICPSuggestion(undefined)
  }, [userId])

  const sendICPConfigMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    const userMessage: any = { role: 'user', content: message }
    setIcpConfigConversation(prev => [...prev, userMessage])
    setIsICPConfigLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-config/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          message,
          conversationHistory: icpConfigConversation.filter(msg => msg.role !== 'system')
        })
      })

      if (!response.ok) throw new Error('Failed to send message to ICP config')

      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to get response')

      const assistantMessage: any = { 
        role: 'assistant', 
        content: data.response 
      }
      setIcpConfigConversation(prev => [...prev, assistantMessage])
      
      if (data.suggestion) {
        const suggestion: any = {
          config: data.suggestion.config || {},
          reasoning: data.suggestion.reasoning || 'AI-generated configuration',
          confidence: data.suggestion.confidence || 0.8,
          questions: data.suggestion.questions || [],
          isComplete: data.suggestion.isComplete || false,
          completenessScore: data.suggestion.completenessScore || 0,
          missingFields: data.suggestion.missingFields || [],
          nextQuestions: data.suggestion.nextQuestions || []
        }
        setCurrentICPSuggestion(suggestion)
      }
    } catch (error) {
      console.error('Error sending message to ICP config:', error)
      const errorMessage: any = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request. Please try again."
      }
      setIcpConfigConversation(prev => [...prev, errorMessage])
    } finally {
      setIsICPConfigLoading(false)
    }
  }, [icpConfigConversation])

  const applyICPSuggestion = useCallback(() => {
    if (!currentICPSuggestion?.config) return

    const newModel = {
      name: `AI-Suggested ICP - ${new Date().toLocaleDateString()}`,
      isPrimary: sessionState.icpModels.length === 0,
      config: {
        modelName: `AI-Suggested ICP - ${new Date().toLocaleDateString()}`,
        ...currentICPSuggestion.config
      } as ICPConfig
    }

    sessionState.saveIcpModel(newModel)
    closeICPConfigChat()
  }, [currentICPSuggestion, sessionState, closeICPConfigChat])

  const quickICPRecommendation = useCallback(async (businessContext: string) => {
    if (!businessContext.trim()) return

    setIsICPConfigLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/icp-config/quick-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ businessContext })
      })

      if (!response.ok) throw new Error('Failed to get quick recommendation')

      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to get recommendation')

      const suggestion: any = {
        config: data.suggestion.config || {},
        reasoning: data.suggestion.reasoning || 'Quick recommendation',
        confidence: data.suggestion.confidence || 0.7,
        isComplete: false,
        completenessScore: data.suggestion.completenessScore || 0,
        missingFields: data.suggestion.missingFields || [],
        nextQuestions: data.suggestion.nextQuestions || []
      }
      
      setCurrentICPSuggestion(suggestion)
      
      const message: any = {
        role: 'assistant',
        content: `Based on your business context, I've generated a quick ICP recommendation.`
      }
      
      setIcpConfigConversation(prev => [...prev, message])
    } catch (error) {
      console.error('Error getting quick ICP recommendation:', error)
      const errorMessage: any = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble generating a quick recommendation."
      }
      setIcpConfigConversation(prev => [...prev, errorMessage])
    } finally {
      setIsICPConfigLoading(false)
    }
  }, [])

  return {
    isICPConfigChatOpen,
    icpConfigConversation,
    isICPConfigLoading,
    currentICPSuggestion,
    openICPConfigChat,
    closeICPConfigChat,
    sendICPConfigMessage,
    applyICPSuggestion,
    quickICPRecommendation
  }
}