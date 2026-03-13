import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { GenreSelector } from './GenreSelector';
import { CharacterCounter } from './CharacterCounter';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { useCreateStory } from '../../../hooks/stories/useCreateStory';
import { useAutoSave } from '../../../hooks/utils/useAutoSave';

interface WriteStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  genres: string[];
  description: string;
  content: string;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 10,
    transition: { duration: 0.3 },
  },
};

export function WriteStoryModal({ isOpen, onClose, onSuccess }: WriteStoryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    genres: [],
    description: '',
    content: '',
  });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isSavingRef = useRef(false);
  const { createStory, updateStory, loading, error } = useCreateStory();

  // Auto-expand textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [formData.content]);

  // Calculate stats
  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  // Shared save logic — prevents auto-save and manual save from running concurrently
  const performDraftSave = async (data: FormData) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      if (draftId) {
        await updateStory(draftId, { ...data, status: 'draft' });
      } else {
        const result = await createStory({ ...data, status: 'draft' });
        if (result?.id) setDraftId(result.id);
      }
    } finally {
      isSavingRef.current = false;
    }
  };

  // Auto-save
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: performDraftSave,
    interval: 30000,
    minCharsToTrigger: 10,
    enabled: isOpen,
  });

  // Validation
  const isValid =
    formData.title.length >= 3 &&
    formData.title.length <= 100 &&
    formData.genres.length >= 1 &&
    formData.genres.length <= 3 &&
    formData.content.length >= 100 &&
    formData.content.length <= 10000;

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSaveDraft = async () => {
    await performDraftSave(formData);
  };

  const handlePublish = async () => {
    if (!isValid) return;

    setIsPublishing(true);
    try {
      if (draftId) {
        const updatedStory = await updateStory(draftId, { ...formData, status: 'published' });
        if (updatedStory) {
          onSuccess?.();
          onClose();
        }
      } else {
        const newStory = await createStory({ ...formData, status: 'published' });
        if (newStory?.id) {
          onSuccess?.();
          onClose();
        }
      }
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: '',
      genres: [],
      description: '',
      content: '',
    });
    setDraftId(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] overflow-y-auto flex items-start justify-center p-4 sm:p-6">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-3xl bg-[#0A0909] rounded-2xl shadow-2xl border border-[#2A2929] my-8"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-4 bg-[#0A0909]/80 backdrop-blur-lg border-b border-[#2A2929] rounded-t-2xl">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 text-[#8A8484] hover:text-[#E8E6E1] transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-sans">ESC</span>
                </button>

                <AutoSaveIndicator status={autoSaveStatus} />
              </div>

              {/* Form */}
              <div className="px-6 sm:px-8 py-6 space-y-8">
                {/* Title */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-[#8A8484] font-sans">
                    Başlık
                  </label>

                  <input
                    type="text"
                    autoFocus
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Başlıksız Hikaye"
                    className="w-full px-0 py-2 bg-transparent border-none text-[24px] sm:text-[32px] font-serif font-semibold text-[#E8E6E1] placeholder:text-[#4A4644] focus:outline-none focus:ring-0 selection:bg-[#E85D7A] selection:text-white"
                  />

                  <CharacterCounter current={formData.title.length} max={100} />

                  {formData.title.length > 0 && formData.title.length < 3 && (
                    <p className="text-xs text-[#EF4444]">En az 3 karakter gerekli</p>
                  )}
                </div>

                {/* Genres */}
                <GenreSelector
                  selectedGenres={formData.genres}
                  onToggle={handleGenreToggle}
                  maxSelections={3}
                />

                {/* Description */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-[#8A8484] font-sans">
                    Özet (Opsiyonel)
                  </label>

                  <textarea
                    rows={3}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Okuyucuyu çekecek bir özet yazın..."
                    className="w-full px-4 py-3 bg-[#151414] border border-[#2A2929] rounded-lg resize-none text-[16px] font-serif leading-relaxed text-[#E8E6E1] placeholder:text-[#4A4644] focus:bg-[#1A1919] focus:border-[#E85D7A] focus:outline-none transition-all duration-300 selection:bg-[#E85D7A] selection:text-white"
                  />

                  <CharacterCounter current={formData.description.length} max={500} />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-[#8A8484] font-sans">
                    Hikaye
                  </label>

                  <textarea
                    ref={contentRef}
                    rows={12}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Bir zamanlar..."
                    className="w-full px-6 py-4 bg-transparent border border-[#2A2929] rounded-lg resize-none text-[16px] sm:text-[18px] font-serif leading-[1.8] text-[#E8E6E1] placeholder:text-[#4A4644] focus:border-[#E85D7A] focus:outline-none transition-all duration-300 min-h-[400px] selection:bg-[#E85D7A] selection:text-white"
                    style={{
                      textRendering: 'optimizeLegibility',
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <CharacterCounter
                      current={formData.content.length}
                      min={100}
                      max={10000}
                      showMinimum={formData.content.length > 0 && formData.content.length < 100}
                    />

                    <div className="text-xs text-[#8A8484] font-sans">
                      {wordCount} kelime · {readingTime} dk okuma
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg">
                    <p className="text-sm text-[#EF4444]">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 sm:px-8 py-4 bg-[#0A0909]/80 backdrop-blur-lg border-t border-[#2A2929] rounded-b-2xl">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading || formData.content.length < 10}
                  className="px-6 py-3 rounded-lg bg-transparent border border-[#E85D7A] text-[#E85D7A] font-sans font-medium hover:bg-[#E85D7A]/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={!isValid || isPublishing}
                  className="px-8 py-3 rounded-lg bg-[#E85D7A] text-white font-sans font-medium hover:bg-[#FF6B8A] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#E85D7A]/20"
                >
                  {isPublishing ? 'Yayınlanıyor...' : 'Yayınla →'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
