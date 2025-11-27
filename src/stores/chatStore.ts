import { create } from 'zustand'
import { Message, MessageContent, ChatContext } from '@/components/ai-chat/types'
import { generateId } from '@/lib/utils'

interface ChatState {
  messages: Message[]
  isThinking: boolean
  thinkingText: string
  context: ChatContext
  
  // Actions
  addMessage: (role: 'user' | 'assistant', content: MessageContent) => void
  setThinking: (thinking: boolean, text?: string) => void
  updateContext: (data: Partial<ChatContext>) => void
  setStep: (step: number) => void
  reset: () => void
  setMessages: (messages: Message[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isThinking: false,
  thinkingText: '思考中',
  context: {
    scenario: null,
    step: 0,
    data: {},
  },

  addMessage: (role, content) => set((state) => ({
    messages: [...state.messages, {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    }]
  })),

  setThinking: (thinking, text = '思考中') => set({
    isThinking: thinking,
    thinkingText: text,
  }),

  updateContext: (data) => set((state) => ({
    context: {
      ...state.context,
      ...data,
      data: { ...state.context.data, ...(data.data || {}) },
    }
  })),

  setStep: (step) => set((state) => ({
    context: { ...state.context, step }
  })),

  reset: () => set({
    messages: [],
    isThinking: false,
    thinkingText: '思考中',
    context: {
      scenario: null,
      step: 0,
      data: {},
    },
  }),

  setMessages: (messages) => set({ messages }),
}))

export default useChatStore

