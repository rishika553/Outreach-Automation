import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// UI State Store
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

// Campaign Store
interface CampaignState {
  selectedCampaign: string | null
  setSelectedCampaign: (id: string | null) => void
  campaignFilter: 'all' | 'active' | 'paused' | 'draft' | 'completed'
  setCampaignFilter: (filter: 'all' | 'active' | 'paused' | 'draft' | 'completed') => void
}

export const useCampaignStore = create<CampaignState>()((set) => ({
  selectedCampaign: null,
  setSelectedCampaign: (id) => set({ selectedCampaign: id }),
  campaignFilter: 'all',
  setCampaignFilter: (filter) => set({ campaignFilter: filter }),
}))

// Lead Store
interface LeadState {
  selectedLeads: string[]
  toggleLeadSelection: (id: string) => void
  selectAllLeads: (ids: string[]) => void
  clearSelection: () => void
  leadFilter: {
    status: string | null
    industry: string | null
    campaign: string | null
    search: string
  }
  setLeadFilter: (filter: Partial<LeadState['leadFilter']>) => void
}

export const useLeadStore = create<LeadState>()((set) => ({
  selectedLeads: [],
  toggleLeadSelection: (id) =>
    set((state) => ({
      selectedLeads: state.selectedLeads.includes(id)
        ? state.selectedLeads.filter((leadId) => leadId !== id)
        : [...state.selectedLeads, id],
    })),
  selectAllLeads: (ids) => set({ selectedLeads: ids }),
  clearSelection: () => set({ selectedLeads: [] }),
  leadFilter: {
    status: null,
    industry: null,
    campaign: null,
    search: '',
  },
  setLeadFilter: (filter) =>
    set((state) => ({
      leadFilter: { ...state.leadFilter, ...filter },
    })),
}))

// Email Store
interface EmailState {
  emailTone: 'PROFESSIONAL' | 'FRIENDLY' | 'STARTUP_FOUNDER' | 'SALES'
  setEmailTone: (tone: EmailState['emailTone']) => void
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
}

export const useEmailStore = create<EmailState>()((set) => ({
  emailTone: 'PROFESSIONAL',
  setEmailTone: (tone) => set({ emailTone: tone }),
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),
}))
