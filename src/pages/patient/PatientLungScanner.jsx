import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function PatientLungScanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detailedInsights, setDetailedInsights] = useState("");
  const [analyzingInsights, setAnalyzingInsights] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.name.endsWith('.nii') || selected.name.endsWith('.nii.gz'))) {
      setFile(selected);
      setError(null);
      setResult(null);
    } else {
      setFile(null);
      setError("Please upload a valid 3D CT Scan in .nii or .nii.gz format.");
    }
  };

  const handleScan = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8001/analyze-lung", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResult(data);
      
      // Fetch detailed AI insights after successful scan
      fetchDetailedInsights(data);
    } catch (err) {
      setError("Analysis failed. Please ensure the lung API is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedInsights = async (scanResult) => {
    setAnalyzingInsights(true);
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    
    const prompt = `You are SehatAI Medical Assistant. I have a 3D Lung CT Scan result:
- Filename: ${scanResult.filename}
- Severity: ${scanResult.severity}
- Tumor Voxel Count: ${scanResult.tumor_voxel_count}
- Message: ${scanResult.message}

Please provide:
1. A clear explanation of what these numbers mean for a patient.
2. Clinical significance of ${scanResult.severity} severity in lung scans.
3. Recommended next steps for the patient.
4. Dietary or lifestyle tips to support lung health.

Keep it structured, professional, yet empathetic. Use markdown formatting.`;

    // 1. Try Gemini first
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
          })
        });
        const data = await res.json();
        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          setDetailedInsights(data.candidates[0].content.parts[0].text);
          setAnalyzingInsights(false);
          return;
        }
        console.warn("Gemini failed, trying Groq fallback...");
      } catch (e) {
        console.error("Gemini error:", e);
      }
    }

    // 2. Fallback to Groq
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1000
          })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          setDetailedInsights(data.choices[0].message.content);
        } else {
          setDetailedInsights("Could not generate insights with any available AI model.");
        }
      } catch (e) {
        setDetailedInsights("Error fetching AI insights: " + e.message);
      }
    } else {
      setDetailedInsights("No AI keys configured for detailed insights.");
    }
    
    setAnalyzingInsights(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary">pulmonology</span>
          3D Lung CT Scanner
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Upload raw `.nii` or `.nii.gz` NIfTI volumes exclusively. Powered by advanced UNet architecture.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
          
          {/* Uploader UI */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-white dark:bg-slate-900 group">
            <input 
              type="file" 
              accept=".nii,.gz"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">upload_file</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {file ? file.name : "Drag & Drop CT Scan"}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {file ? "Ready for AI Analysis" : "or click to browse your computer"}
            </p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleScan}
              disabled={!file || loading}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                !file || loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-primary text-white hover:brightness-110 shadow-primary/25'
              }`}
            >
               {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin font-normal">progress_activity</span>
                  Analyzing Vast 3D Volume...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">biotech</span>
                  Commence AI Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results UI */}
        {result && (
          <div className="p-8 bg-green-50/50 border-t border-green-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-green-600">
               <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>coronavirus</span>
            </div>
            
            <h4 className="text-[11px] font-black uppercase tracking-widest text-green-600 mb-6 font-display">AI Diagnostic Result</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <p className="text-slate-500 font-bold mb-3 text-sm">Severity Flag</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border ${result.severity === 'HIGH' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                  <span className="material-symbols-outlined shrink-0 text-xl">{result.severity === 'HIGH' ? 'warning' : 'check_circle'}</span>
                  <span className="font-black tracking-wide text-lg">{result.severity}</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <p className="text-slate-500 font-bold mb-3 text-sm">Tumor Size (Voxels)</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{result.tumor_voxel_count.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 p-5 bg-white border border-green-100 rounded-2xl shadow-sm relative z-10">
              <p className="text-sm text-slate-700 font-medium leading-relaxed flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-0.5 rounded-lg bg-green-50 p-1">neurology</span>
                <span>{result.message} Standard 96³ multi-planar volumetric analysis was successfully utilized.</span>
              </p>
            </div>

            {/* AI Insights Section */}
            <div className="mt-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white">AI Deep Insights</h5>
                {analyzingInsights && <span className="text-[10px] font-bold text-emerald-500 animate-pulse uppercase tracking-widest">Generating...</span>}
              </div>

              {detailedInsights ? (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-white/70 dark:bg-slate-900/50 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-inner backdrop-blur-sm">
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed md-render-container">
                    <ReactMarkdown>{detailedInsights}</ReactMarkdown>
                  </div>
                </div>
              ) : analyzingInsights ? (
                <div className="flex flex-col gap-3 p-6 bg-white/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-emerald-200 animate-pulse">
                  <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded w-3/4"></div>
                  <div className="h-4 bg-emerald-50 dark:bg-emerald-900/30 rounded w-1/2"></div>
                  <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded w-5/6"></div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
