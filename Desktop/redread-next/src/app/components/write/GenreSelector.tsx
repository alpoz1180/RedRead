import { motion } from 'motion/react';

const AVAILABLE_GENRES = [
  'Romantizm',
  'Gotik',
  'Dram',
  'Gizem',
  'Fantastik',
  'Psikolojik',
];

interface GenreSelectorProps {
  selectedGenres: string[];
  onToggle: (genre: string) => void;
  maxSelections?: number;
}

export function GenreSelector({ 
  selectedGenres, 
  onToggle, 
  maxSelections = 3 
}: GenreSelectorProps) {
  const canSelectMore = selectedGenres.length < maxSelections;

  const handleToggle = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);
    
    // Allow deselection or selection if under limit
    if (isSelected || canSelectMore) {
      onToggle(genre);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-[#8A8484] font-sans">
          Kategoriler
        </label>
        <span className="text-xs text-[#8A8484] font-sans">
          {selectedGenres.length}/{maxSelections}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_GENRES.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <motion.button
              key={genre}
              type="button"
              onClick={() => handleToggle(genre)}
              disabled={isDisabled}
              animate={{
                scale: isSelected ? 1.05 : 1,
                backgroundColor: isSelected
                  ? 'rgba(232, 93, 122, 0.2)'
                  : 'rgba(232, 93, 122, 0.1)',
                borderColor: isSelected ? '#E85D7A' : 'rgba(232, 93, 122, 0.2)',
              }}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className="px-4 py-2 rounded-full
                         border text-sm font-medium font-sans
                         transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-[#E85D7A]/20"
              style={{
                color: isSelected ? '#E85D7A' : '#8A8484',
              }}
            >
              {isSelected && '✓ '}
              {genre}
            </motion.button>
          );
        })}
      </div>

      {selectedGenres.length === 0 && (
        <p className="text-xs text-[#EF4444]">En az 1 kategori seçmelisiniz</p>
      )}
    </div>
  );
}
