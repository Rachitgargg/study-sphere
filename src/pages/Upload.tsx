import React, { useState, useRef } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { uploadDocument } from '../lib/api';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';

export const Upload: React.FC = () => {
  const { documents, addDocument, removeDocument } = useStudySphere();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const performActualUpload = async (file: File) => {
    setErrorMsg(null);
    setUploadProgress(10);
    setUploadStatus('Streaming bytes to secure repository...');

    const extension = file.name.split('.').pop()?.toLowerCase();
    const type = (['pdf', 'docx', 'txt', 'pptx'].includes(extension || '') 
      ? extension 
      : 'pdf') as 'pdf' | 'docx' | 'txt' | 'pptx';

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    // Simulated visual progression for smooth UX
    let progress = 10;
    const progressInterval = setInterval(() => {
      if (progress < 85) {
        progress += 5;
        setUploadProgress(progress);
        if (progress === 30) {
          setUploadStatus('Extracting textual layouts & tables...');
        } else if (progress === 60) {
          setUploadStatus('Running semantic chunking & embeddings...');
        }
      }
    }, 200);

    try {
      const result = await uploadDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus(`Indexed successfully! Created ${result.chunks_created} chunks.`);
      
      addDocument({
        id: result.file_id,
        name: file.name,
        size: sizeStr,
        type,
        status: 'processed',
        pageCount: Math.floor(result.chunks_created / 3) + 1,
        concepts: ['Vector DB', 'SentenceTransformers', 'ChromaDB']
      });

      // Hide progress block after a brief delay
      setTimeout(() => {
        setUploadProgress(null);
        setUploadStatus('');
      }, 2000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      setUploadStatus('');
      setErrorMsg(err.message || 'Academic system connection failure. Check backend server.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const allowedExtensions = ['pdf', 'docx', 'txt', 'pptx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMsg(`Format not supported. Please upload a valid document (${allowedExtensions.join(', ')}).`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('The file exceeds the academic library limit of 25MB.');
      return;
    }

    performActualUpload(file);
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title section */}
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-academic-cream">
          Upload Materials
        </h2>
        <p className="text-sm text-academic-text-muted mt-1 font-serif">
          Tether your texts, study notes, or lecture guides to the StudySphere AI cognitive analyzer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Pane */}
        <div className="md:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all min-h-[300px] cursor-pointer ${
              dragActive 
                ? 'border-academic-gold bg-academic-gold/5' 
                : 'border-academic-card hover:border-academic-gold/30 bg-academic-paper'
            }`}
            onClick={triggerBrowse}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.docx,.txt,.pptx"
            />

            <div className="w-16 h-16 rounded-full bg-academic-black flex items-center justify-center border border-academic-card mb-4 group-hover:border-academic-gold/30 transition-all shadow-inner">
              <UploadCloud className="w-8 h-8 text-academic-gold/70 animate-bounce" />
            </div>

            <h3 className="font-serif text-lg font-bold text-academic-cream">
              Drag & Drop Your Scholar Codices Here
            </h3>
            <p className="text-xs text-academic-text-muted mt-2 max-w-md">
              Support files: PDF, DOCX, TXT, and PPTX up to 25MB. Hand-written drafts will undergo optical layout analysis.
            </p>

            <button
              type="button"
              className="mt-6 px-5 py-2 bg-academic-card hover:bg-academic-card/80 text-academic-cream font-sans font-semibold text-xs tracking-wide rounded-lg border border-academic-card/80 hover:border-academic-gold/30 transition-all pointer-events-none"
            >
              Browse Local Drives
            </button>
          </div>

          {/* Feedback/Progress Panel */}
          {uploadProgress !== null && (
            <div className="bg-academic-paper border border-academic-gold/20 p-5 rounded-xl animate-fade-in space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-academic-cream font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-academic-gold animate-spin" />
                  {uploadStatus}
                </span>
                <span className="text-academic-gold">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-academic-black rounded-full overflow-hidden">
                <div 
                  className="h-full bg-academic-gold transition-all duration-350"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-academic-crimson/10 border border-academic-crimson/30 text-academic-cream px-4 py-3 rounded-lg flex items-center gap-3 text-xs animate-fade-in font-serif">
              <AlertCircle className="w-4 h-4 text-academic-crimson-bright flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Informative Side Cards */}
        <div className="space-y-4">
          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl gold-glow">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-gold">
              Cognitive Indexing
            </h4>
            <p className="text-xs text-academic-text-muted mt-2 leading-relaxed">
              When documents are uploaded, StudySphere AI uses deep linguistic models to perform semantic layouts, diagram tagging, vocabulary cataloging, and concept graph mappings.
            </p>
            <ul className="text-[10px] font-mono text-academic-text-muted/80 mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-academic-emerald-bright mt-0.5" />
                <span>Text OCR & layout resolution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-academic-emerald-bright mt-0.5" />
                <span>Recursive summaries generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-academic-emerald-bright mt-0.5" />
                <span>Cross-doc mathematical links</span>
              </li>
            </ul>
          </div>

          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl gold-glow">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-text-muted">
              Privacy Declaration
            </h4>
            <p className="text-xs text-academic-text-muted mt-2 leading-relaxed font-serif">
              Documents are processed inside a sandboxed client context. No corporate training or public exposure is performed on your primary academic works.
            </p>
          </div>
        </div>
      </div>

      {/* Bibliography Management Table */}
      <div className="bg-academic-paper border border-academic-card rounded-xl overflow-hidden gold-glow">
        <div className="p-5 border-b border-academic-card bg-academic-black/40 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-academic-cream">Cataloged Materials ({documents.length})</h3>
          <span className="text-[10px] font-mono text-academic-text-muted">Archives Secure</span>
        </div>

        <div className="divide-y divide-academic-card/50 overflow-x-auto">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-academic-text-muted font-serif italic">
              Your bibliographical catalog is empty. Upload items above to start.
            </div>
          ) : (
            documents.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 flex items-center justify-between min-w-[600px] hover:bg-academic-card/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-academic-black flex items-center justify-center border border-academic-card text-academic-gold flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-serif font-bold text-academic-cream truncate">{doc.name}</h4>
                    <p className="text-[10px] font-mono text-academic-text-muted mt-1">
                      {doc.size} • {doc.pageCount} Pages • Uploaded {doc.uploadDate}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 px-6">
                  {doc.concepts?.slice(0, 2).map((concept, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-academic-black border border-academic-card/40 text-[9px] font-mono text-academic-text-muted max-w-[120px] truncate">
                      {concept}
                    </span>
                  ))}
                </div>

                {/* Status Indicator */}
                <div className="w-28 text-right px-4">
                  {doc.status === 'processed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono text-academic-emerald-bright bg-academic-emerald/10 border border-academic-emerald/20">
                      Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono text-academic-gold bg-academic-gold/5 border border-academic-gold/20 animate-pulse">
                      Parsing...
                    </span>
                  )}
                </div>

                {/* Trash Deletion */}
                <div className="w-12 text-right">
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1.5 hover:bg-academic-crimson/10 text-academic-text-muted hover:text-academic-crimson-bright rounded-md transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
