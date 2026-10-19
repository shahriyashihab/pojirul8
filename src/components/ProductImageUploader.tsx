import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { compressImageFile, PRESET_FEED_IMAGES, DEFAULT_PRODUCT_IMAGE, FALLBACK_SVG_DATA } from '../utils/imageUtils';

interface ProductImageUploaderProps {
  currentImageUrl: string;
  onChange: (url: string) => void;
  productName?: string;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  currentImageUrl,
  onChange,
  productName = 'পণ্য',
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [customUrl, setCustomUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setUploadError(null);

    try {
      const dataUrl = await compressImageFile(file, 800, 800, 0.82);
      onChange(dataUrl);
      setCustomUrl(dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be chosen again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyCustomUrl = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setShowUrlInput(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    onChange(url);
    setCustomUrl(url);
  };

  const handleRemoveImage = () => {
    onChange(DEFAULT_PRODUCT_IMAGE);
    setCustomUrl(DEFAULT_PRODUCT_IMAGE);
  };

  return (
    <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>পণ্যের ছবি আপলোড (Photo Upload)</span>
        </label>
        <span className="text-[10px] text-slate-500">গ্যালারি / ক্যামেরা থেকে তুলুন</span>
      </div>

      {uploadError && (
        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          {uploadError}
        </div>
      )}

      {/* Preview and Upload Buttons */}
      <div className="flex items-start gap-3">
        {/* Thumbnail Preview */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-emerald-300 bg-white overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center text-emerald-700 p-2 text-center">
              <Loader2 className="w-6 h-6 animate-spin mb-1" />
              <span className="text-[10px] font-semibold">প্রসেস হচ্ছে...</span>
            </div>
          ) : currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={productName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = '1';
                  target.src = DEFAULT_PRODUCT_IMAGE;
                } else {
                  target.src = FALLBACK_SVG_DATA;
                }
              }}
            />
          ) : (
            <div className="text-center p-2 text-slate-400">
              <ImageIcon className="w-6 h-6 mx-auto mb-0.5 opacity-60" />
              <span className="text-[10px]">ছবি নেই</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📷 ছবি আপলোড করুন</span>
            </button>

            {currentImageUrl && currentImageUrl !== DEFAULT_PRODUCT_IMAGE && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1 px-2 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-slate-200"
                title="ছবি মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>রিমুভ</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            মোবাইল দিয়ে সরাসরি ছবি তুলুন অথবা ফোন মেমোরি / কম্পিউটার থেকে সিলেক্ট করুন। সাইজ স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে।
          </p>

          <div className="flex items-center gap-3 pt-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setShowPresets(!showPresets);
                setShowUrlInput(false);
              }}
              className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline underline-offset-2"
            >
              {showPresets ? '▲ তৈরি ছবি লুকান' : '▼ ডিফল্ট ভুসি/খইল ছবি থেকে বাছাই'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                setShowPresets(false);
              }}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline underline-offset-2"
            >
              {showUrlInput ? '▲ লিংক ইনপুট লুকান' : '🌐 ছবির ওয়েব লিংক'}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Feed Images Selector */}
      {showPresets && (
        <div className="pt-2 border-t border-slate-200 mt-2">
          <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
            নিচের যেকোনো একটি খাবারের ছবি ক্লিক করে সেট করুন:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_FEED_IMAGES.map((preset, idx) => {
              const isSelected = currentImageUrl === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold truncate">{preset.label}</div>
                    <div className="text-[9px] text-slate-500 truncate">{preset.category}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom URL Input Box */}
      {showUrlInput && (
        <div className="pt-2 border-t border-slate-200 mt-2 flex gap-1.5">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCustomUrl();
                }
              }}
              placeholder="https://example.com/photo.jpg"
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => handleApplyCustomUrl()}
            className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            সেট করুন
          </button>
        </div>
      )}
    </div>
  );
};
