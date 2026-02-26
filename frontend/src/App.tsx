import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Sun, Moon, AlertTriangle, Shield, DollarSign, Calendar, Users, FileSignature, Lock, Scale, Sparkles, Zap, CheckCircle, TrendingUp } from 'lucide-react';

interface Risk {
  clause: string;
  category: string;
  risk_level: 'high' | 'medium' | 'low';
  text_excerpt: string;
  explanation: string;
}

interface AnalysisResult {
  parties: string[];
  dates: {
    effective: string;
    duration: string;
    renewal: string;
  };
  payment_terms: string;
  termination: string;
  renewal: string;
  confidentiality: string;
  ip_ownership: string;
  governing_law: string;
  risks: Risk[];
  plain_english_summary: string;
}

const SAMPLE_CONTRACT = `FREELANCE DEVELOPER AGREEMENT

This Agreement is entered into as of March 1, 2025 between TechCorp Inc. ("Client") and Jane Developer ("Contractor").

1. SCOPE OF WORK
Contractor agrees to provide software development services as requested by Client.

2. COMPENSATION
Client agrees to pay Contractor $75 per hour. Invoices submitted monthly. Late payments subject to 5% penalty.

3. TERM AND TERMINATION
This agreement is ongoing. Either party may terminate with 14 days written notice.

4. CONFIDENTIALITY
Contractor agrees not to disclose any Client confidential information.

5. INTELLECTUAL PROPERTY
All work product created by Contractor shall be owned exclusively by Client.

6. INDEMNIFICATION
Contractor agrees to indemnify and hold harmless Client from any claims arising from Contractor's work.

7. GOVERNING LAW
This Agreement shall be governed by the laws of Delaware.`;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [contractText, setContractText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedRisks, setExpandedRisks] = useState<Set<number>>(new Set());
  const [animateIn, setAnimateIn] = useState(false);
  const [riskCounts, setRiskCounts] = useState({ high: 0, medium: 0, low: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setAnimateIn(true);
    initializeParticles();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isAnalyzing) {
      const messages = [
        'Reading contract…',
        'Identifying parties…',
        'Flagging risks…',
        'Generating summary…'
      ];
      let index = 0;
      setLoadingMessage(messages[0]);
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (result) {
      const counts = result.risks.reduce((acc, risk) => {
        acc[risk.risk_level]++;
        return acc;
      }, { high: 0, medium: 0, low: 0 });

      let current = { high: 0, medium: 0, low: 0 };
      const duration = 1200;
      const steps = 40;
      const increment = duration / steps;

      const timer = setInterval(() => {
        let done = true;
        if (current.high < counts.high) { current.high++; done = false; }
        if (current.medium < counts.medium) { current.medium++; done = false; }
        if (current.low < counts.low) { current.low++; done = false; }
        setRiskCounts({ ...current });
        if (done) clearInterval(timer);
      }, increment);

      return () => clearInterval(timer);
    }
  }, [result]);

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1
      });
    }
    setParticles(newParticles);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => prev.map(p => {
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;

        if (newX < 0 || newX > canvas.width) p.vx *= -1;
        if (newY < 0 || newY > canvas.height) p.vy *= -1;

        newX = Math.max(0, Math.min(canvas.width, newX));
        newY = Math.max(0, Math.min(canvas.height, newY));

        const dx = mousePos.x - newX;
        const dy = mousePos.y - newY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const angle = Math.atan2(dy, dx);
          const push = (150 - dist) * 0.02;
          p.vx -= Math.cos(angle) * push;
          p.vy -= Math.sin(angle) * push;
        }

        const opacity = darkMode ? 0.6 : 0.3;
        ctx.fillStyle = darkMode
          ? `rgba(99, 102, 241, ${opacity})`
          : `rgba(79, 70, 229, ${opacity})`;
        ctx.beginPath();
        ctx.arc(newX, newY, p.size, 0, Math.PI * 2);
        ctx.fill();

        return { ...p, x: newX, y: newY };
      }));

      requestAnimationFrame(animate);
    };

    animate();
  }, [darkMode, mousePos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const loadSample = () => {
    setActiveTab('text');
    setContractText(SAMPLE_CONTRACT);
  };

  const analyzeContract = async () => {
    if (!file && !contractText.trim()) {
      setError('Please upload a file or paste contract text');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    if (activeTab === 'file' && file) {
      formData.append('file', file);
    } else {
      formData.append('text', contractText);
    }

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Failed to analyze contract. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRisk = (index: number) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRisks(newExpanded);
  };

  const downloadMarkdown = () => {
    if (!result) return;

    let markdown = '# Contract Analysis Report\n\n';
    markdown += `## Summary\n${result.plain_english_summary}\n\n`;
    markdown += `## Parties\n${result.parties.join(', ')}\n\n`;
    markdown += `## Key Terms\n`;
    markdown += `- **Effective Date:** ${result.dates.effective}\n`;
    markdown += `- **Duration:** ${result.dates.duration}\n`;
    markdown += `- **Payment Terms:** ${result.payment_terms}\n`;
    markdown += `- **Termination:** ${result.termination}\n`;
    markdown += `- **Renewal:** ${result.renewal}\n`;
    markdown += `- **Confidentiality:** ${result.confidentiality}\n`;
    markdown += `- **IP Ownership:** ${result.ip_ownership}\n`;
    markdown += `- **Governing Law:** ${result.governing_law}\n\n`;
    markdown += `## Risk Analysis\n`;
    result.risks.forEach((risk, i) => {
      markdown += `### ${i + 1}. ${risk.clause} [${risk.risk_level.toUpperCase()}]\n`;
      markdown += `**Category:** ${risk.category}\n\n`;
      markdown += `**Excerpt:** "${risk.text_excerpt}"\n\n`;
      markdown += `**Explanation:** ${risk.explanation}\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    return level === 'high' ? '#ef4444' : level === 'medium' ? '#f97316' : '#eab308';
  };

  const totalRisks = riskCounts.high + riskCounts.medium + riskCounts.low;
  const riskScore = totalRisks === 0 ? 0 : Math.round((riskCounts.high * 3 + riskCounts.medium * 2 + riskCounts.low) / (totalRisks * 3) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-700 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600&display=swap');

        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Space Grotesk', monospace; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(99, 102, 241, 0.5), inset 0 0 20px rgba(99, 102, 241, 0.1); }
          50% { opacity: 0.8; box-shadow: 0 0 40px rgba(99, 102, 241, 0.8), inset 0 0 30px rgba(99, 102, 241, 0.2); }
        }

        @keyframes bounce-badge {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes liquid-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(168, 85, 247, 0.2); }
          50% { box-shadow: 0 0 50px rgba(99, 102, 241, 0.6), 0 0 80px rgba(168, 85, 247, 0.3); }
        }

        @keyframes shimmer-wave {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes flicker {
          0%, 100% { text-shadow: 0 0 10px rgba(99, 102, 241, 0.8); }
          50% { text-shadow: 0 0 20px rgba(99, 102, 241, 1), 0 0 40px rgba(168, 85, 247, 0.6); }
        }

        .shimmer-button {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        .gradient-bg {
          background: linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-bounce-badge {
          animation: bounce-badge 1.5s ease-in-out infinite;
        }

        .slide-up {
          animation: slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }

        .scale-pop {
          animation: scale-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .glass-effect {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .glass-effect-light {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(203, 213, 225, 0.3);
        }

        .neon-border {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.5);
        }

        .risk-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .risk-card:hover {
          transform: translateY(-4px);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }
        .stagger-8 { animation-delay: 0.8s; }

        .text-flicker {
          animation: flicker 3s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pulse-border {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${animateIn ? 'slide-down' : 'opacity-0'}`}>
              <div className="relative">
                <Shield className="w-8 h-8 text-indigo-500 animate-float" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">ContractLens</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-lg glass-effect hover:bg-slate-700/50 transition-all duration-300 text-slate-300 hover:text-white transform hover:scale-110"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-40 gradient-bg blur-3xl"></div>
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <div className={`inline-block px-6 py-2 rounded-full glass-effect mb-6 ${animateIn ? 'scale-pop' : 'opacity-0'}`}>
              <span className="text-sm font-mono text-indigo-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> AI-Powered Intelligence
              </span>
            </div>

            <h2 className={`font-serif text-6xl sm:text-7xl font-bold text-white mb-6 leading-tight ${animateIn ? 'slide-up stagger-1' : 'opacity-0'}`}>
              Understand any contract
              <br />
              <span className="gradient-text text-flicker">in seconds</span>
            </h2>

            <p className={`text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed ${animateIn ? 'slide-up stagger-2' : 'opacity-0'}`}>
              AI-powered contract analysis that identifies risks, explains terms, and gives you confidence in every signature
            </p>

            <div className={`flex gap-4 justify-center flex-wrap ${animateIn ? 'slide-up stagger-3' : 'opacity-0'}`}>
              <div className="px-4 py-2 rounded-lg glass-effect text-sm text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> Instant Analysis
              </div>
              <div className="px-4 py-2 rounded-lg glass-effect text-sm text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Risk Scoring
              </div>
              <div className="px-4 py-2 rounded-lg glass-effect text-sm text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Legal Insights
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="max-w-4xl mx-auto px-4 pb-32">
          <div className={`glass-effect rounded-3xl p-10 shadow-2xl neon-border ${animateIn ? 'slide-up stagger-4' : 'opacity-0'}`}>
            {/* Tab Switcher */}
            <div className="flex space-x-2 mb-8 bg-slate-800/30 rounded-xl p-1.5">
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'file'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-5 h-5" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'text'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-5 h-5" />
                Paste Text
              </button>
            </div>

            {/* File Upload Tab */}
            {activeTab === 'file' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/15 scale-105 pulse-border'
                    : 'border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                {file ? (
                  <div className="space-y-6 scale-pop">
                    <div className="inline-block p-4 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
                      <FileText className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{file.name}</p>
                      <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-300 underline"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 inline-block p-4 rounded-xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10">
                      <Upload className="w-16 h-16 text-slate-400" />
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">Drop your contract here</p>
                    <p className="text-slate-400 text-sm mb-8">or click to browse (PDF or TXT)</p>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
                    >
                      Browse Files
                    </label>
                  </>
                )}
              </div>
            )}

            {/* Text Input Tab */}
            {activeTab === 'text' && (
              <div className="scale-pop">
                <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste your contract text here..."
                  className="w-full h-72 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={loadSample}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-300 font-medium underline"
              >
                Load Sample Contract
              </button>
              <button
                onClick={analyzeContract}
                disabled={isAnalyzing}
                className="relative px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze Contract
                    </>
                  )}
                </span>
                <div className="absolute inset-0 shimmer-button"></div>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/15 border border-red-500/50 rounded-xl text-red-300 slide-up flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center">
            <div className="text-center space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-indigo-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute inset-4 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-indigo-400 animate-bounce" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-2xl font-semibold">{loadingMessage}</p>
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-32 right-4 glass-effect rounded-xl p-4 shadow-2xl slide-up z-50 flex items-center gap-3 border border-green-500/50">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white font-semibold">Analysis complete!</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section id="results" className="max-w-7xl mx-auto px-4 pb-32 space-y-16">
            {/* Risk Score Banner */}
            <div className="slide-up">
              <div className="glass-effect rounded-3xl p-12 neon-border">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1 flex flex-col justify-center items-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45"
                          fill="none"
                          stroke={`url(#gradient-${riskScore})`}
                          strokeWidth="8"
                          strokeDasharray={`${(riskScore / 100) * 283} 283`}
                          style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                        <defs>
                          <linearGradient id={`gradient-${riskScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">{riskScore}</div>
                          <div className="text-xs text-slate-400 mt-1">Risk Score</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 grid grid-cols-3 gap-6">
                    <div className="text-center slide-up stagger-1">
                      <div
                        className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '2px solid #ef4444',
                          animation: 'pulse-glow 2s ease-in-out infinite'
                        }}
                      >
                        <span className="text-5xl font-bold text-red-400">{riskCounts.high}</span>
                      </div>
                      <p className="text-slate-300 font-semibold">High Risk</p>
                      <p className="text-xs text-slate-500 mt-1">Critical Issues</p>
                    </div>
                    <div className="text-center slide-up stagger-2">
                      <div
                        className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: 'rgba(249, 115, 22, 0.15)',
                          border: '2px solid #f97316'
                        }}
                      >
                        <span className="text-5xl font-bold text-orange-400">{riskCounts.medium}</span>
                      </div>
                      <p className="text-slate-300 font-semibold">Medium Risk</p>
                      <p className="text-xs text-slate-500 mt-1">Review Needed</p>
                    </div>
                    <div className="text-center slide-up stagger-3">
                      <div
                        className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: 'rgba(234, 179, 8, 0.15)',
                          border: '2px solid #eab308'
                        }}
                      >
                        <span className="text-5xl font-bold text-yellow-400">{riskCounts.low}</span>
                      </div>
                      <p className="text-slate-300 font-semibold">Low Risk</p>
                      <p className="text-xs text-slate-500 mt-1">Minor Notes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plain English Summary */}
            <div className="slide-up stagger-1">
              <div className="glass-effect rounded-3xl p-10 border-l-4 border-indigo-500 neon-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-indigo-600/20 flex-shrink-0">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-bold text-white mb-4">Plain English Summary</h3>
                    <p className="text-slate-300 leading-relaxed text-lg">{result.plain_english_summary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="slide-up stagger-2">
              <h3 className="font-serif text-3xl font-bold text-white mb-8">Key Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Users, label: 'Parties', value: result.parties.join(', '), delay: 'stagger-1' },
                  { icon: Calendar, label: 'Effective Date', value: result.dates.effective, delay: 'stagger-2' },
                  { icon: DollarSign, label: 'Payment Terms', value: result.payment_terms, delay: 'stagger-3' },
                  { icon: FileSignature, label: 'Termination', value: result.termination, delay: 'stagger-4' },
                  { icon: Calendar, label: 'Renewal', value: result.renewal, delay: 'stagger-5' },
                  { icon: Lock, label: 'Confidentiality', value: result.confidentiality, delay: 'stagger-6' },
                  { icon: Shield, label: 'IP Ownership', value: result.ip_ownership, delay: 'stagger-7' },
                  { icon: Scale, label: 'Governing Law', value: result.governing_law, delay: 'stagger-8' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`glass-effect rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl slide-up risk-card ${item.delay}`}
                  >
                    <div className="p-3 rounded-lg bg-indigo-600/20 w-fit mb-3">
                      <item.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{item.label}</p>
                    <p className="text-white font-medium text-sm leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Flags */}
            <div className="slide-up stagger-3">
              <h3 className="font-serif text-3xl font-bold text-white mb-8">Risk Analysis</h3>
              <div className="space-y-4">
                {result.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`glass-effect rounded-2xl border-l-4 overflow-hidden transition-all duration-300 hover:shadow-xl risk-card slide-up stagger-${Math.min(idx + 1, 8)}`}
                    style={{
                      borderLeftColor: getRiskColor(risk.risk_level),
                      boxShadow: expandedRisks.has(idx) ? `0 0 40px ${getRiskColor(risk.risk_level)}40, inset 0 0 30px ${getRiskColor(risk.risk_level)}10` : 'none'
                    }}
                  >
                    <button
                      onClick={() => toggleRisk(idx)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <AlertTriangle
                          className="w-6 h-6 flex-shrink-0"
                          style={{ color: getRiskColor(risk.risk_level) }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base">{risk.clause}</h4>
                          <p className="text-slate-400 text-sm capitalize">{risk.category}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 ${
                            risk.risk_level === 'high' ? 'animate-bounce-badge' : ''
                          }`}
                          style={{
                            backgroundColor: `${getRiskColor(risk.risk_level)}20`,
                            color: getRiskColor(risk.risk_level)
                          }}
                        >
                          {risk.risk_level}
                        </span>
                      </div>
                      <div className={`ml-4 transition-transform duration-300 flex-shrink-0 ${expandedRisks.has(idx) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-500"
                      style={{
                        maxHeight: expandedRisks.has(idx) ? '600px' : '0',
                      }}
                    >
                      <div className="p-6 pt-0 space-y-4 border-t border-slate-700/50">
                        <div>
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Excerpt</p>
                          <blockquote className="border-l-2 pl-4 italic text-slate-300" style={{ borderLeftColor: getRiskColor(risk.risk_level) }}>
                            "{risk.text_excerpt}"
                          </blockquote>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Explanation</p>
                          <p className="text-slate-300 text-sm leading-relaxed">{risk.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center slide-up stagger-4">
              <button
                onClick={downloadMarkdown}
                className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 inline-flex items-center space-x-3 transform active:scale-95"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                <span>Download Full Report</span>
                <div className="absolute inset-0 rounded-lg shimmer-button opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
            <div className="h-1 w-64 mx-auto rounded-full gradient-bg blur-sm"></div>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Powered by advanced AI • Built for precision • Designed for clarity</p>
              <p className="text-slate-500 text-xs">Protect your contracts. Understand every clause. Make informed decisions.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
