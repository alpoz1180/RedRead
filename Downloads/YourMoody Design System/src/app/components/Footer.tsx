import React from 'react';
import { Link } from 'react-router';
import { Heart, Shield, FileText } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              to="/privacy"
              className="flex items-center gap-1.5 text-white/60 hover:text-coral transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Gizlilik Politikası</span>
            </Link>
            <span className="text-white/20">•</span>
            <Link
              to="/terms"
              className="flex items-center gap-1.5 text-white/60 hover:text-coral transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Kullanım Koşulları</span>
            </Link>
            <span className="text-white/20">•</span>
            <a
              href="mailto:support@yourmoody.com"
              className="text-white/60 hover:text-coral transition-colors"
            >
              Destek
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>© {currentYear} YourMoody</span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1">
              Türkiye'den sevgiyle yapıldı
              <Heart className="w-3 h-3 text-coral fill-coral" />
            </span>
          </div>

          {/* Legal Notice */}
          <p className="text-white/30 text-xs text-center max-w-2xl leading-relaxed">
            YourMoody tıbbi bir hizmet değildir. Ciddi ruh hali sorunları için lütfen bir sağlık 
            profesyoneline başvurun.
          </p>
        </div>
      </div>
    </footer>
  );
}
