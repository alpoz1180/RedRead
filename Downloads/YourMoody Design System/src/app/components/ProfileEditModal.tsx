import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { MoodyButton } from './MoodyButton';
import { MoodyCard } from './MoodyCard';
import { triggerHaptic, HapticFeedbackType } from '../../lib/haptics';
import { sanitizeProfileName } from '../../lib/sanitize';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string | null;
  currentEmoji: string | null;
  onSave: (name: string, emoji: string) => Promise<void>;
}

const AVATAR_EMOJIS = [
  '😊', '😎', '🤗', '🥰', '😇',
  '🤓', '😺', '🦊', '🐻', '🐼',
  '🦄', '🌟', '💫', '✨', '🎨',
  '🎭', '🎪', '🎯', '🎮', '🎸',
];

export function ProfileEditModal({
  isOpen,
  onClose,
  currentName,
  currentEmoji,
  onSave,
}: ProfileEditModalProps) {
  const [name, setName] = useState(currentName || '');
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || '😊');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Sanitize input
    const sanitizedName = sanitizeProfileName(name);
    
    if (!sanitizedName) {
      triggerHaptic(HapticFeedbackType.Warning);
      return;
    }

    setSaving(true);
    try {
      await onSave(sanitizedName, selectedEmoji);
      triggerHaptic(HapticFeedbackType.Success);
      onClose();
    } catch (error) {
      triggerHaptic(HapticFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    triggerHaptic(HapticFeedbackType.Selection);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md"
            >
              <MoodyCard padding="lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-foreground text-xl font-bold">Profili Düzenle</h3>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Avatar Emoji Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Avatar Seç
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          aspect-square rounded-2xl text-3xl flex items-center justify-center
                          transition-all duration-200
                          ${
                            selectedEmoji === emoji
                              ? 'bg-coral text-white ring-2 ring-coral ring-offset-2 ring-offset-background shadow-lg'
                              : 'bg-secondary/50 hover:bg-secondary'
                          }
                        `}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <label htmlFor="profile-name" className="block text-sm font-semibold text-foreground mb-2">
                    İsim
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adını gir"
                    maxLength={50}
                    className="
                      w-full px-4 py-3 rounded-2xl
                      bg-input-background border border-border
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-coral/50
                      transition-all
                    "
                  />
                </div>

                {/* Preview */}
                <div className="mb-6 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Önizleme:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center text-2xl">
                      {selectedEmoji}
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">
                        {name.trim() || 'İsimsiz'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="
                      flex-1 px-4 py-3 rounded-2xl
                      bg-secondary text-secondary-foreground
                      font-semibold
                      hover:bg-secondary/80
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    "
                  >
                    İptal
                  </button>
                  <MoodyButton
                    onClick={handleSave}
                    disabled={!name.trim() || saving}
                    loading={saving}
                    className="flex-1"
                  >
                    <Check size={18} />
                    Kaydet
                  </MoodyButton>
                </div>
              </MoodyCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
