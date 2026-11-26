import React, { useState } from 'react';
import { VISION_SAMPLES, DIY_HACKS } from '../data/mockData';
import { VisionInspectionSample } from '../types';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
} from 'lucide-react';

export const VisionInspectorView: React.FC = () => {
  const [subTab, setSubTab] = useState<'inspector' | 'hacks'>('inspector');
  const [selectedSample, setSelectedSample] = useState<VisionInspectionSample>(VISION_SAMPLES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Trigger analysis simulation
  const handleSelectSample = (sample: VisionInspectionSample) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 600);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredHacks =
    selectedCategory === 'All'
      ? DIY_HACKS
      : DIY_HACKS.filter((h) => h.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Subnavigation Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DIY IAQ Hacks & Multimodal Vision Inspector
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Empower your home defense with AI computer vision inspection and scientifically validated low-cost indoor air hacks.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubTab('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'inspector'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vision AI Inspector
          </button>
          <button
            type="button"
            onClick={() => setSubTab('hacks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'hacks'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DIY Hacks Library
          </button>
        </div>
      </div>

      {subTab === 'inspector' ? (
        <div className="space-y-6">
          {/* Sample Preset Selector */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Realistic Test Image or Upload Custom Photo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VISION_SAMPLES.map((sample) => {
                const isSelected = selectedSample.id === sample.id && !customImage;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div>
                      <span className="text-sm font-bold block">{sample.name}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        {sample.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Zone */}
          <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center space-y-2">
            <label
              htmlFor="vision-upload-input"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Custom Room or Filter Photo</span>
            </label>
            <input
              id="vision-upload-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileUpload}
            />
            <p className="text-[11px] text-slate-500">
              Supports PNG, JPG, WebP. Real-time vision analysis examines filter saturation, air gaps, and seal integrity.
            </p>
          </div>

          {/* Vision Inspection Analysis Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
            {/* Image Preview with Scan Overlay */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={customImage || selectedSample.imageUrl}
                alt="Selected target for AI vision analysis"
                className="w-full h-full object-cover max-h-[380px]"
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-cyan-300 animate-pulse">
                    Multimodal Vision Model Scanning Particulate Saturation...
                  </span>
                </div>
              )}

              {/* Status Badge Overlay */}
              {!isAnalyzing && (
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      selectedSample.mockAnalysis.status === 'Optimal'
                        ? 'bg-emerald-500 text-slate-950'
                        : selectedSample.mockAnalysis.status === 'Requires Replacement'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {selectedSample.mockAnalysis.status} ({selectedSample.mockAnalysis.confidence}% Confidence)
                  </span>
                </div>
              )}
            </div>

            {/* Analysis Findings Breakdown */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">AI Vision Diagnostics</h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    Model: Gemini Multimodal Vision
                  </span>
                </div>

                {/* Efficiency Penalty */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Performance Impact
                  </span>
                  <p className="text-sm font-bold text-rose-300">
                    {selectedSample.mockAnalysis.pm25EfficiencyPenalty}
                  </p>
                </div>

                {/* Key Observations */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Detected Visual Anomalies
                  </span>
                  <ul className="space-y-2">
                    {selectedSample.mockAnalysis.findings.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DIY Fix Recommendation */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-1.5">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Recommended Remediation
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedSample.mockAnalysis.diyFixRecommendation}
                  </p>
                </div>
              </div>

              {/* Action checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Prescribed Actions
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedSample.mockAnalysis.actionItems.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DIY Hacks Library Tab */
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Purification', 'Sealing', 'Ventilation'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHacks.map((hack) => (
              <div
                key={hack.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {hack.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {hack.prepTime}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{hack.costTier} Cost</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{hack.title}</h3>
                    <p className="text-xs font-semibold text-emerald-400 mt-1">
                      Effectiveness: {hack.effectiveness}
                    </p>
                  </div>

                  {/* Supplies */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Required Supplies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hack.supplies.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Step-by-Step Instructions
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-300">
                      {hack.steps.map((st, i) => (
                        <li key={i} className="leading-relaxed">
                          <span className="text-slate-200">{st}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <span className="font-bold text-amber-300 block mb-0.5">Engineering Pro Tip:</span>
                    <span className="text-slate-300">{hack.proTip}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block italic">
                    Principle: {hack.scientificPrinciple}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
