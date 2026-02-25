'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  FiPlay,
  FiCopy,
  FiSearch,
  FiPlus,
  FiClock,
  FiGrid,
  FiTrash2,
  FiStar,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiImage,
  FiRefreshCw,
  FiHash,
  FiTarget,
  FiUsers,
  FiTrendingUp,
  FiEdit3,
  FiArrowLeft,
  FiExternalLink,
  FiZap,
  FiEye,
  FiFilm,
  FiActivity,
} from 'react-icons/fi'

// ============================================================
// CONSTANTS
// ============================================================

const MANAGER_AGENT_ID = '699f76cf180768b98e6c3b6c'
const THUMBNAIL_AGENT_ID = '699f76dfadf5e5d124afc1cb'

const STORAGE_KEY = 'shorts_studio_content'

const AUDIENCES = ['Gen Z', 'Millennials', 'General', 'Professionals', 'Students']
const TONES = ['Funny', 'Educational', 'Motivational', 'Controversial', 'Inspirational']

const LOADING_MESSAGES = [
  'Researching trends...',
  'Analyzing competition...',
  'Identifying viral patterns...',
  'Writing scripts...',
  'Refining content...',
  'Finalizing output...',
]

// ============================================================
// TYPES
// ============================================================

interface TrendingTopic {
  topic: string
  reason: string
  popularity_score: string
}

interface CompetitorAngle {
  angle: string
  description: string
}

interface TrendResearch {
  trending_topics: TrendingTopic[]
  hashtags: string[]
  competitor_angles: CompetitorAngle[]
  audience_insights: string
}

interface ScriptItem {
  title: string
  tone: string
  hook: string
  body: string
  cta: string
  estimated_duration: string
  word_count: string
}

interface ThumbnailData {
  imageUrl: string
  concept_description: string
  text_overlay: string
  color_scheme: string
  emotional_trigger: string
  composition_tips: string
}

interface ContentItem {
  id: string
  topic: string
  niche: string
  keywords: string[]
  audience: string
  tone: string
  trendResearch: TrendResearch
  scripts: ScriptItem[]
  selectedScriptIndex: number
  thumbnail?: ThumbnailData
  contentNotes: string
  status: 'draft' | 'ready' | 'exported'
  isFavorite: boolean
  createdAt: string
}

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: 'sample-1',
    topic: 'AI Tools for Productivity',
    niche: 'Technology',
    keywords: ['AI', 'productivity', 'automation'],
    audience: 'Professionals',
    tone: 'Educational',
    trendResearch: {
      trending_topics: [
        { topic: 'AI Workflow Automation', reason: 'Rapid adoption of AI in workplace productivity', popularity_score: '92' },
        { topic: 'ChatGPT Hacks', reason: 'Users sharing advanced prompt techniques', popularity_score: '88' },
        { topic: 'No-Code AI Tools', reason: 'Growing demand for accessible AI solutions', popularity_score: '85' },
      ],
      hashtags: ['#AIProductivity', '#TechHacks', '#WorkSmarter', '#AITools', '#Automation'],
      competitor_angles: [
        { angle: 'Tool comparison', description: 'Side-by-side comparison of popular AI tools' },
        { angle: 'Before and after', description: 'Show productivity before and after implementing AI' },
      ],
      audience_insights: 'Professionals aged 25-45 seeking ways to optimize their workflows with emerging AI technology.',
    },
    scripts: [
      {
        title: '5 AI Tools That Replace Your Entire Team',
        tone: 'Educational',
        hook: 'Stop hiring. Start automating. These 5 AI tools do the work of an entire team.',
        body: 'Tool 1: ChatGPT for writing and research. Tool 2: Midjourney for design. Tool 3: Notion AI for project management. Tool 4: Otter.ai for meeting notes. Tool 5: Jasper for marketing copy.',
        cta: 'Follow for more AI productivity hacks. Link in bio for the full guide.',
        estimated_duration: '45 seconds',
        word_count: '78',
      },
      {
        title: 'The Morning Routine AI Built For Me',
        tone: 'Educational',
        hook: 'I asked AI to build my perfect morning routine. Here is what happened.',
        body: 'I used Claude to analyze my schedule, goals, and energy patterns. It created a personalized routine that boosted my productivity by 40%. The key insight? Batch similar tasks together.',
        cta: 'Try it yourself. Drop a comment and I will share the prompt.',
        estimated_duration: '38 seconds',
        word_count: '62',
      },
    ],
    selectedScriptIndex: 0,
    thumbnail: {
      imageUrl: '',
      concept_description: 'Split-screen design showing a stressed person on one side and a calm, productive person with AI interfaces on the other.',
      text_overlay: '5 AI TOOLS = ENTIRE TEAM',
      color_scheme: 'Electric blue and white on dark background',
      emotional_trigger: 'Curiosity and FOMO - viewers want to know these tools',
      composition_tips: 'Use bold, contrasting text. Place the most shocking stat in the center.',
    },
    contentNotes: 'Focus on practical, immediately actionable tools. Avoid generic advice.',
    status: 'ready',
    isFavorite: true,
    createdAt: '2025-02-24T10:30:00Z',
  },
  {
    id: 'sample-2',
    topic: 'Quick Healthy Meals',
    niche: 'Health & Fitness',
    keywords: ['healthy', 'meal prep', 'quick recipes'],
    audience: 'Millennials',
    tone: 'Motivational',
    trendResearch: {
      trending_topics: [
        { topic: '5-Minute Meals', reason: 'Time-poor audiences want fast healthy options', popularity_score: '90' },
        { topic: 'Protein-Rich Snacks', reason: 'Fitness community driving demand', popularity_score: '86' },
      ],
      hashtags: ['#HealthyEating', '#MealPrep', '#QuickRecipes', '#FitFood'],
      competitor_angles: [
        { angle: 'Ingredient challenges', description: 'Cook a healthy meal with only 3 ingredients' },
      ],
      audience_insights: 'Millennials who value health but lack time for elaborate cooking.',
    },
    scripts: [
      {
        title: '3 Ingredients, 5 Minutes, Zero Excuses',
        tone: 'Motivational',
        hook: 'You have 5 minutes? Then you have time to eat healthy.',
        body: 'Grab Greek yogurt, berries, and granola. Layer them in a jar. That is a 30g protein breakfast in under 2 minutes. No cooking required.',
        cta: 'Save this for your next lazy morning. Follow for more.',
        estimated_duration: '30 seconds',
        word_count: '48',
      },
    ],
    selectedScriptIndex: 0,
    contentNotes: 'Keep recipes extremely simple. Show the final result first to hook viewers.',
    status: 'draft',
    isFavorite: false,
    createdAt: '2025-02-23T14:15:00Z',
  },
  {
    id: 'sample-3',
    topic: 'Side Hustles 2025',
    niche: 'Finance',
    keywords: ['side hustle', 'passive income', 'money'],
    audience: 'Gen Z',
    tone: 'Controversial',
    trendResearch: {
      trending_topics: [
        { topic: 'Digital Product Sales', reason: 'Low barrier to entry income stream', popularity_score: '94' },
        { topic: 'AI Freelancing', reason: 'Using AI tools to offer services on Fiverr', popularity_score: '91' },
      ],
      hashtags: ['#SideHustle', '#PassiveIncome', '#MoneyTips', '#FinancialFreedom'],
      competitor_angles: [
        { angle: 'Income proof', description: 'Showing actual earnings screenshots' },
      ],
      audience_insights: 'Gen Z viewers skeptical of traditional employment, seeking alternative income.',
    },
    scripts: [
      {
        title: 'Your 9-to-5 is a Scam. Here is Proof.',
        tone: 'Controversial',
        hook: 'Your boss makes 10x what you make. And you are okay with that?',
        body: 'The average employee generates $150K in value but earns $55K. The gap goes straight to shareholders. Meanwhile, freelancers on Fiverr are making $10K/month using AI tools their employers do not even know about.',
        cta: 'Stop making someone else rich. Link in bio for the free side hustle guide.',
        estimated_duration: '42 seconds',
        word_count: '65',
      },
    ],
    selectedScriptIndex: 0,
    contentNotes: 'Lean into the controversial angle but back claims with data.',
    status: 'exported',
    isFavorite: true,
    createdAt: '2025-02-22T09:00:00Z',
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    exported: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status?.charAt(0).toUpperCase()}{status?.slice(1)}
    </span>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-7">
      {copied ? <FiCheck className="w-3 h-3 text-green-600" /> : <FiCopy className="w-3 h-3" />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </Button>
  )
}

function KeywordInput({ keywords, setKeywords }: { keywords: string[]; setKeywords: (k: string[]) => void }) {
  const [inputVal, setInputVal] = useState('')
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      e.preventDefault()
      if (!keywords.includes(inputVal.trim())) {
        setKeywords([...keywords, inputVal.trim()])
      }
      setInputVal('')
    }
  }
  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw))
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {keywords.map(kw => (
          <Badge key={kw} variant="secondary" className="gap-1 pl-2.5 pr-1 py-0.5 text-xs">
            {kw}
            <button onClick={() => removeKeyword(kw)} className="ml-0.5 hover:bg-black/10 rounded-full p-0.5">
              <FiX className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Type a keyword and press Enter"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

function ToneSelector({ selected, onSelect }: { selected: string; onSelect: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map(tone => (
        <button
          key={tone}
          onClick={() => onSelect(tone)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${selected === tone ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-white/60 text-foreground border-border hover:bg-white/80 hover:border-primary/30'}`}
        >
          {tone}
        </button>
      ))}
    </div>
  )
}

function LoadingOverlay({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 backdrop-blur-[16px] bg-white/90 border border-white/30 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <FiFilm className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">Generating Content</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
        </CardContent>
      </Card>
    </div>
  )
}

function AgentInfoPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: MANAGER_AGENT_ID, name: 'Shorts Content Coordinator', purpose: 'Coordinates trend research and script writing' },
    { id: THUMBNAIL_AGENT_ID, name: 'Thumbnail Concept Agent', purpose: 'Generates thumbnail concepts and images' },
  ]
  return (
    <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-primary" />
          AI Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center gap-2.5 text-xs">
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0">
              <p className="font-medium truncate">{agent.name}</p>
              <p className="text-muted-foreground truncate">{agent.purpose}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================
// SCREENS
// ============================================================

function DashboardScreen({
  contentItems,
  sampleMode,
  onNavigate,
  onToggleFavorite,
  onDeleteItem,
  onSelectItem,
}: {
  contentItems: ContentItem[]
  sampleMode: boolean
  onNavigate: (screen: string) => void
  onToggleFavorite: (id: string) => void
  onDeleteItem: (id: string) => void
  onSelectItem: (item: ContentItem) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const items = sampleMode && contentItems.length === 0 ? SAMPLE_CONTENT : contentItems

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || item.niche.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [items, searchQuery, statusFilter])

  const thisWeek = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    return items.filter(i => { try { return new Date(i.createdAt).getTime() > weekAgo } catch { return false } }).length
  }, [items])

  const favorites = useMemo(() => items.filter(i => i.isFavorite).length, [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your content generation overview</p>
        </div>
        <Button onClick={() => onNavigate('create')} className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
          <FiPlus className="w-4 h-4" />
          New Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<FiFilm className="w-5 h-5" />} label="Total Generations" value={items.length} />
        <StatCard icon={<FiTrendingUp className="w-5 h-5" />} label="This Week" value={thisWeek} />
        <StatCard icon={<FiStar className="w-5 h-5" />} label="Favorites" value={favorites} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by topic or niche..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="exported">Exported</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FiFilm className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create your first Short</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">Generate trending content ideas, scripts, and thumbnails for your YouTube Shorts in minutes.</p>
            <Button onClick={() => onNavigate('create')} className="gap-2 bg-primary hover:bg-primary/90">
              <FiPlus className="w-4 h-4" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => onSelectItem(item)}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{item.topic}</h3>
                  <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id) }} className="shrink-0 p-1 rounded hover:bg-muted transition-colors">
                    <FiStar className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{item.niche || 'General'}</Badge>
                  <StatusBadge status={item.status} />
                </div>
                {item.thumbnail?.imageUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={item.thumbnail.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                    <FiImage className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{formatDate(item.createdAt)}</span>
                  <span>{Array.isArray(item.scripts) ? item.scripts.length : 0} script{(item.scripts?.length ?? 0) !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs flex-1 gap-1" onClick={(e) => { e.stopPropagation(); onSelectItem(item) }}>
                    <FiEye className="w-3 h-3" /> View
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id) }}>
                    <FiTrash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateScreen({
  onGenerate,
  isGenerating,
  loadingProgress,
  loadingMessage,
}: {
  onGenerate: (topic: string, keywords: string[], audience: string, tone: string) => void
  isGenerating: boolean
  loadingProgress: number
  loadingMessage: string
}) {
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('')

  const canSubmit = topic.trim() && audience && tone

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif tracking-tight">Create New Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details to generate trending YouTube Shorts content</p>
      </div>

      <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="font-medium">Topic / Niche</Label>
            <Input id="topic" placeholder="e.g., AI tools for productivity" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-white/60" />
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Keywords</Label>
            <KeywordInput keywords={keywords} setKeywords={setKeywords} />
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-white/60">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Content Tone</Label>
            <ToneSelector selected={tone} onSelect={setTone} />
          </div>

          <Separator />

          <Button onClick={() => onGenerate(topic, keywords, audience, tone)} disabled={!canSubmit || isGenerating} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2">
            {isGenerating ? (
              <>
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiZap className="w-5 h-5" />
                Generate Content
              </>
            )}
          </Button>

          {!canSubmit && (
            <p className="text-xs text-muted-foreground text-center">Please fill in topic, audience, and tone to continue</p>
          )}
        </CardContent>
      </Card>

      {isGenerating && <LoadingOverlay progress={loadingProgress} message={loadingMessage} />}
    </div>
  )
}

function ReviewScreen({
  contentItem,
  onSave,
  onBack,
  onUpdateItem,
  activeAgentId,
  setActiveAgentId,
}: {
  contentItem: ContentItem
  onSave: (item: ContentItem) => void
  onBack: () => void
  onUpdateItem: (item: ContentItem) => void
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}) {
  const [item, setItem] = useState<ContentItem>(contentItem)
  const [expandedScript, setExpandedScript] = useState<number>(item.selectedScriptIndex)
  const [editingScript, setEditingScript] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')
  const [thumbLoading, setThumbLoading] = useState(false)
  const [thumbError, setThumbError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const trendResearch = item?.trendResearch ?? { trending_topics: [], hashtags: [], competitor_angles: [], audience_insights: '' }
  const trendingTopics = Array.isArray(trendResearch?.trending_topics) ? trendResearch.trending_topics : []
  const hashtags = Array.isArray(trendResearch?.hashtags) ? trendResearch.hashtags : []
  const competitorAngles = Array.isArray(trendResearch?.competitor_angles) ? trendResearch.competitor_angles : []
  const audienceInsights = trendResearch?.audience_insights ?? ''
  const scripts = Array.isArray(item?.scripts) ? item.scripts : []
  const contentNotes = item?.contentNotes ?? ''

  const handleSelectScript = (idx: number) => {
    setItem(prev => ({ ...prev, selectedScriptIndex: idx }))
  }

  const handleStartEdit = (idx: number) => {
    setEditingScript(idx)
    setEditBody(scripts[idx]?.body ?? '')
  }

  const handleSaveEdit = (idx: number) => {
    const updated = [...scripts]
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], body: editBody }
    }
    setItem(prev => ({ ...prev, scripts: updated }))
    setEditingScript(null)
  }

  const handleGenerateThumbnail = async () => {
    const selectedScript = scripts[item.selectedScriptIndex]
    if (!selectedScript) return
    setThumbLoading(true)
    setThumbError('')
    setActiveAgentId(THUMBNAIL_AGENT_ID)

    try {
      const message = `Generate a thumbnail concept for a YouTube Short about "${item.topic}". Script title: "${selectedScript.title}". Hook: "${selectedScript.hook}". The tone is ${selectedScript.tone}.`
      const result = await callAIAgent(message, THUMBNAIL_AGENT_ID)

      if (result.success) {
        const thumbData = result?.response?.result
        const imageFiles = result?.module_outputs?.artifact_files
        let imageUrl = ''
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          imageUrl = imageFiles[0]?.file_url ?? ''
        }
        setItem(prev => ({
          ...prev,
          thumbnail: {
            imageUrl,
            concept_description: thumbData?.concept_description ?? '',
            text_overlay: thumbData?.text_overlay ?? '',
            color_scheme: thumbData?.color_scheme ?? '',
            emotional_trigger: thumbData?.emotional_trigger ?? '',
            composition_tips: thumbData?.composition_tips ?? '',
          },
        }))
      } else {
        setThumbError(result?.error ?? 'Failed to generate thumbnail')
      }
    } catch (err) {
      setThumbError('An error occurred while generating the thumbnail')
    } finally {
      setThumbLoading(false)
      setActiveAgentId(null)
    }
  }

  const handleSaveAndExport = () => {
    const updated = { ...item, status: 'ready' as const }
    setItem(updated)
    onSave(updated)
    setSaveMessage('Content saved successfully')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleExportAll = async () => {
    const selectedScript = scripts[item.selectedScriptIndex]
    const exportText = [
      `=== ${item.topic} ===`,
      `Niche: ${item.niche}`,
      `Audience: ${item.audience}`,
      `Tone: ${item.tone}`,
      `Keywords: ${(item.keywords ?? []).join(', ')}`,
      '',
      '--- TRENDING TOPICS ---',
      ...trendingTopics.map(t => `- ${t.topic} (Score: ${t.popularity_score}) - ${t.reason}`),
      '',
      '--- HASHTAGS ---',
      hashtags.join(' '),
      '',
      '--- COMPETITOR ANGLES ---',
      ...competitorAngles.map(a => `- ${a.angle}: ${a.description}`),
      '',
      '--- AUDIENCE INSIGHTS ---',
      audienceInsights,
      '',
      '--- SELECTED SCRIPT ---',
      selectedScript ? `Title: ${selectedScript.title}` : '',
      selectedScript ? `Hook: ${selectedScript.hook}` : '',
      selectedScript ? `Body: ${selectedScript.body}` : '',
      selectedScript ? `CTA: ${selectedScript.cta}` : '',
      selectedScript ? `Duration: ${selectedScript.estimated_duration}` : '',
      '',
      '--- CONTENT NOTES ---',
      contentNotes,
      '',
      item.thumbnail ? '--- THUMBNAIL ---' : '',
      item.thumbnail ? `Concept: ${item.thumbnail.concept_description}` : '',
      item.thumbnail ? `Text Overlay: ${item.thumbnail.text_overlay}` : '',
      item.thumbnail ? `Color Scheme: ${item.thumbnail.color_scheme}` : '',
      item.thumbnail ? `Emotional Trigger: ${item.thumbnail.emotional_trigger}` : '',
    ].filter(Boolean).join('\n')

    await copyToClipboard(exportText)
    const updated = { ...item, status: 'exported' as const }
    setItem(updated)
    onSave(updated)
    setSaveMessage('Content exported to clipboard')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <FiArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-serif tracking-tight">{item.topic}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{item.niche || 'General'}</Badge>
            <StatusBadge status={item.status} />
            <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
          <FiCheck className="w-4 h-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Trend Insights */}
        <div className="space-y-4">
          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-primary" /> Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trending topics found</p>
              ) : (
                trendingTopics.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-border/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {t.popularity_score ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{t.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiHash className="w-4 h-4 text-primary" /> Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hashtags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hashtags available</p>
                ) : (
                  hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors text-xs">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
              {hashtags.length > 0 && (
                <div className="mt-3">
                  <CopyButton text={hashtags.join(' ')} label="Copy all" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiTarget className="w-4 h-4 text-primary" /> Competitor Angles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {competitorAngles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No competitor angles found</p>
              ) : (
                competitorAngles.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/50 border border-border/50">
                    <p className="font-medium text-sm">{a.angle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-primary" /> Audience Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audienceInsights ? renderMarkdown(audienceInsights) : <p className="text-sm text-muted-foreground">No audience insights available</p>}
            </CardContent>
          </Card>

          {contentNotes && (
            <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FiEdit3 className="w-4 h-4 text-primary" /> Content Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderMarkdown(contentNotes)}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Scripts & Thumbnail */}
        <div className="space-y-4">
          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiPlay className="w-4 h-4 text-primary" /> Script Variations
              </CardTitle>
              <CardDescription className="text-xs">Select and edit your preferred script</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scripts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scripts generated</p>
              ) : (
                scripts.map((script, idx) => (
                  <div key={idx} className={`rounded-xl border transition-all duration-200 ${item.selectedScriptIndex === idx ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-white/50'}`}>
                    <button onClick={() => { handleSelectScript(idx); setExpandedScript(expandedScript === idx ? -1 : idx) }} className="w-full p-4 text-left flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${item.selectedScriptIndex === idx ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                        {item.selectedScriptIndex === idx && <FiCheck className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{script.title}</p>
                          {expandedScript === idx ? <FiChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{script.tone}</Badge>
                          <span className="text-xs text-muted-foreground">{script.estimated_duration}</span>
                          <span className="text-xs text-muted-foreground">{script.word_count} words</span>
                        </div>
                      </div>
                    </button>

                    {expandedScript === idx && (
                      <div className="px-4 pb-4 space-y-3">
                        <Separator />
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-primary uppercase tracking-wider">Hook</Label>
                            <CopyButton text={script.hook} />
                          </div>
                          <p className="text-sm mt-1 p-2.5 rounded-lg bg-primary/5 border border-primary/10 font-medium italic">{script.hook}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Body</Label>
                            <div className="flex gap-1">
                              {editingScript === idx ? (
                                <>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleSaveEdit(idx)}>
                                    <FiCheck className="w-3 h-3" /> Save
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingScript(null)}>
                                    <FiX className="w-3 h-3" /> Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleStartEdit(idx)}>
                                    <FiEdit3 className="w-3 h-3" /> Edit
                                  </Button>
                                  <CopyButton text={script.body} />
                                </>
                              )}
                            </div>
                          </div>
                          {editingScript === idx ? (
                            <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="mt-1 min-h-[100px] bg-white/80 text-sm" />
                          ) : (
                            <p className="text-sm mt-1 p-2.5 rounded-lg bg-white/50 leading-relaxed">{script.body}</p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-accent uppercase tracking-wider">Call to Action</Label>
                            <CopyButton text={script.cta} />
                          </div>
                          <p className="text-sm mt-1 p-2.5 rounded-lg bg-accent/5 border border-accent/10 font-medium">{script.cta}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Thumbnail Section */}
          <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiImage className="w-4 h-4 text-primary" /> Thumbnail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.thumbnail ? (
                <>
                  {item.thumbnail.imageUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border/50">
                      <img src={item.thumbnail.imageUrl} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-border/50">
                      <div className="text-center">
                        <FiImage className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Image not available</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/50 border border-border/50">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Concept</Label>
                      <p className="text-sm mt-1">{item.thumbnail.concept_description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/50 border border-border/50">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text Overlay</Label>
                        <p className="text-sm mt-1 font-medium">{item.thumbnail.text_overlay}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 border border-border/50">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Scheme</Label>
                        <p className="text-sm mt-1">{item.thumbnail.color_scheme}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/50 border border-border/50">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emotional Trigger</Label>
                        <p className="text-sm mt-1">{item.thumbnail.emotional_trigger}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 border border-border/50">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Composition Tips</Label>
                        <p className="text-sm mt-1">{item.thumbnail.composition_tips}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerateThumbnail} disabled={thumbLoading} className="gap-1.5 flex-1">
                      <FiRefreshCw className={`w-3.5 h-3.5 ${thumbLoading ? 'animate-spin' : ''}`} /> Regenerate
                    </Button>
                    <Button size="sm" onClick={() => { const updated = { ...item, status: 'ready' as const }; setItem(updated); onSave(updated); setSaveMessage('Thumbnail approved'); setTimeout(() => setSaveMessage(''), 3000) }} className="gap-1.5 flex-1 bg-green-600 hover:bg-green-700">
                      <FiCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FiImage className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Generate a thumbnail concept for your selected script</p>
                  <Button onClick={handleGenerateThumbnail} disabled={thumbLoading || scripts.length === 0} className="gap-2 bg-primary hover:bg-primary/90">
                    {thumbLoading ? (
                      <><FiRefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                      <><FiImage className="w-4 h-4" /> Generate Thumbnail</>
                    )}
                  </Button>
                </div>
              )}

              {thumbError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <FiX className="w-4 h-4 shrink-0" />
                  {thumbError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportAll} className="flex-1 gap-2 h-11">
              <FiCopy className="w-4 h-4" /> Export to Clipboard
            </Button>
            <Button onClick={handleSaveAndExport} className="flex-1 gap-2 h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
              <FiDownload className="w-4 h-4" /> Save Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryScreen({
  contentItems,
  sampleMode,
  onSelectItem,
  onDeleteItem,
  onToggleFavorite,
}: {
  contentItems: ContentItem[]
  sampleMode: boolean
  onSelectItem: (item: ContentItem) => void
  onDeleteItem: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const items = sampleMode && contentItems.length === 0 ? SAMPLE_CONTENT : contentItems

  const filtered = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = !searchQuery || item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || (item.niche ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
    result.sort((a, b) => {
      try {
        const da = new Date(a.createdAt).getTime()
        const db = new Date(b.createdAt).getTime()
        return sortOrder === 'newest' ? db - da : da - db
      } catch { return 0 }
    })
    return result
  }, [items, searchQuery, statusFilter, sortOrder])

  const handleExportItem = async (item: ContentItem) => {
    const selectedScript = Array.isArray(item.scripts) ? item.scripts[item.selectedScriptIndex] : undefined
    const exportText = [
      `=== ${item.topic} ===`,
      `Niche: ${item.niche}`,
      `Audience: ${item.audience}`,
      `Tone: ${item.tone}`,
      '',
      selectedScript ? '--- SCRIPT ---' : '',
      selectedScript ? `Title: ${selectedScript.title}` : '',
      selectedScript ? `Hook: ${selectedScript.hook}` : '',
      selectedScript ? `Body: ${selectedScript.body}` : '',
      selectedScript ? `CTA: ${selectedScript.cta}` : '',
      '',
      '--- HASHTAGS ---',
      Array.isArray(item.trendResearch?.hashtags) ? item.trendResearch.hashtags.join(' ') : '',
    ].filter(Boolean).join('\n')
    await copyToClipboard(exportText)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif tracking-tight">Content History</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and manage your generated content</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by topic or niche..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="exported">Exported</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'newest' | 'oldest')}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FiClock className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No content history found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const selectedScript = Array.isArray(item.scripts) ? item.scripts[item.selectedScriptIndex] : undefined
            return (
              <Card key={item.id} className="backdrop-blur-[16px] bg-white/75 border border-white/20 shadow-md overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="w-full p-4 text-left flex items-center gap-4">
                  {item.thumbnail?.imageUrl ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.thumbnail.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                      <FiImage className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.topic}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{item.niche || 'General'}</Badge>
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id) }} className="p-1.5 rounded hover:bg-muted transition-colors">
                      <FiStar className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                    </button>
                    {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">
                    {selectedScript && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">{selectedScript.title}</p>
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <Label className="text-xs font-semibold text-primary uppercase tracking-wider">Hook</Label>
                          <p className="text-sm mt-1 italic">{selectedScript.hook}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/50">
                          <Label className="text-xs font-semibold uppercase tracking-wider">Body</Label>
                          <p className="text-sm mt-1 leading-relaxed">{selectedScript.body}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                          <Label className="text-xs font-semibold text-accent uppercase tracking-wider">CTA</Label>
                          <p className="text-sm mt-1">{selectedScript.cta}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Duration: {selectedScript.estimated_duration}</span>
                          <span>Words: {selectedScript.word_count}</span>
                        </div>
                      </div>
                    )}

                    {Array.isArray(item.trendResearch?.hashtags) && item.trendResearch.hashtags.length > 0 && (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hashtags</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.trendResearch.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.thumbnail && (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thumbnail Concept</Label>
                        <p className="text-sm mt-1">{item.thumbnail.concept_description}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onSelectItem(item)}>
                        <FiCopy className="w-3.5 h-3.5" /> Duplicate & Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExportItem(item)}>
                        <FiExternalLink className="w-3.5 h-3.5" /> Export
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive ml-auto" onClick={() => onDeleteItem(item.id)}>
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Page() {
  // Navigation
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'create' | 'review' | 'history'>('dashboard')
  const [sampleMode, setSampleMode] = useState(false)

  // Content state
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null)

  // Agent state
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [genError, setGenError] = useState('')

  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setContentItems(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((items: ContentItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setContentItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const handleDeleteItem = useCallback((id: string) => {
    setContentItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const handleSaveItem = useCallback((item: ContentItem) => {
    setContentItems(prev => {
      const exists = prev.findIndex(p => p.id === item.id)
      let updated: ContentItem[]
      if (exists >= 0) {
        updated = [...prev]
        updated[exists] = item
      } else {
        updated = [item, ...prev]
      }
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const handleSelectItem = useCallback((item: ContentItem) => {
    setCurrentItem(item)
    setActiveScreen('review')
  }, [])

  // Content generation
  const handleGenerate = useCallback(async (topic: string, keywords: string[], audience: string, tone: string) => {
    setIsGenerating(true)
    setLoadingProgress(0)
    setLoadingMessage(LOADING_MESSAGES[0])
    setGenError('')
    setActiveAgentId(MANAGER_AGENT_ID)

    let msgIdx = 0
    loadingIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 8 + 2
      })
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[msgIdx])
    }, 2500)

    try {
      const kws = keywords.length > 0 ? ` Keywords: ${keywords.join(', ')}.` : ''
      const message = `Generate YouTube Shorts content for the niche: "${topic}".${kws} Target audience: ${audience}. Content tone: ${tone}. Research trending topics and write 3 engaging scripts.`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      setLoadingProgress(100)

      if (result.success) {
        const data = result?.response?.result
        const trendingTopics = Array.isArray(data?.trend_research?.trending_topics) ? data.trend_research.trending_topics : []
        const fetchedHashtags = Array.isArray(data?.trend_research?.hashtags) ? data.trend_research.hashtags : []
        const fetchedAngles = Array.isArray(data?.trend_research?.competitor_angles) ? data.trend_research.competitor_angles : []
        const fetchedScripts = Array.isArray(data?.scripts) ? data.scripts : []

        const newItem: ContentItem = {
          id: generateId(),
          topic: data?.topic ?? topic,
          niche: topic,
          keywords,
          audience,
          tone,
          trendResearch: {
            trending_topics: trendingTopics,
            hashtags: fetchedHashtags,
            competitor_angles: fetchedAngles,
            audience_insights: data?.trend_research?.audience_insights ?? '',
          },
          scripts: fetchedScripts,
          selectedScriptIndex: 0,
          contentNotes: data?.content_notes ?? '',
          status: 'draft',
          isFavorite: false,
          createdAt: new Date().toISOString(),
        }

        setCurrentItem(newItem)
        handleSaveItem(newItem)
        setActiveScreen('review')
      } else {
        setGenError(result?.error ?? 'Failed to generate content. Please try again.')
      }
    } catch {
      setGenError('An unexpected error occurred. Please try again.')
    } finally {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      setIsGenerating(false)
      setActiveAgentId(null)
    }
  }, [handleSaveItem])

  // Navigation items
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'create' as const, label: 'New Content', icon: <FiPlus className="w-5 h-5" /> },
    { id: 'history' as const, label: 'Content History', icon: <FiClock className="w-5 h-5" /> },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground" style={{ backgroundImage: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)' }}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 shrink-0 backdrop-blur-[16px] bg-white/75 border-r border-white/20 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
                  <FiFilm className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg font-serif tracking-tight leading-none">Shorts Studio</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">YouTube Automation</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeScreen === item.id || (activeScreen === 'review' && item.id === 'dashboard') ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
                <Switch id="sample-toggle" checked={sampleMode} onCheckedChange={setSampleMode} />
              </div>
              <Separator />
              <AgentInfoPanel activeAgentId={activeAgentId} />
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="flex flex-col flex-1 min-w-0">
            <header className="md:hidden flex items-center justify-between p-4 backdrop-blur-[16px] bg-white/75 border-b border-white/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FiFilm className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold font-serif">Shorts Studio</span>
              </div>
              <div className="flex items-center gap-1">
                <Label htmlFor="sample-mobile" className="text-xs text-muted-foreground mr-1">Sample</Label>
                <Switch id="sample-mobile" checked={sampleMode} onCheckedChange={setSampleMode} />
              </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden flex border-b border-white/20 bg-white/60 backdrop-blur-sm">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${activeScreen === item.id || (activeScreen === 'review' && item.id === 'dashboard') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 md:p-8">
                {genError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
                    <FiX className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{genError}</span>
                    <button onClick={() => setGenError('')} className="p-1 hover:bg-red-100 rounded">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activeScreen === 'dashboard' && (
                  <DashboardScreen
                    contentItems={contentItems}
                    sampleMode={sampleMode}
                    onNavigate={setActiveScreen as (s: string) => void}
                    onToggleFavorite={handleToggleFavorite}
                    onDeleteItem={handleDeleteItem}
                    onSelectItem={handleSelectItem}
                  />
                )}

                {activeScreen === 'create' && (
                  <CreateScreen
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    loadingProgress={loadingProgress}
                    loadingMessage={loadingMessage}
                  />
                )}

                {activeScreen === 'review' && currentItem && (
                  <ReviewScreen
                    contentItem={currentItem}
                    onSave={handleSaveItem}
                    onBack={() => setActiveScreen('dashboard')}
                    onUpdateItem={(item) => { setCurrentItem(item); handleSaveItem(item) }}
                    activeAgentId={activeAgentId}
                    setActiveAgentId={setActiveAgentId}
                  />
                )}

                {activeScreen === 'review' && !currentItem && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FiFilm className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No content selected. Go to Dashboard to select content or create new.</p>
                    <Button onClick={() => setActiveScreen('dashboard')} variant="outline" className="mt-4 gap-2">
                      <FiArrowLeft className="w-4 h-4" /> Go to Dashboard
                    </Button>
                  </div>
                )}

                {activeScreen === 'history' && (
                  <HistoryScreen
                    contentItems={contentItems}
                    sampleMode={sampleMode}
                    onSelectItem={handleSelectItem}
                    onDeleteItem={handleDeleteItem}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
