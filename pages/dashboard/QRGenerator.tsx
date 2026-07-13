import React, { useState, useRef, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, AlignLeft, Mail, Phone, Wifi, MapPin, User,
  Download, Copy, RefreshCw, Smartphone, Monitor, ChevronRight,
  Info, LayoutTemplate, Palette, Image as ImageIcon, BarChart2,
  Lock, CheckCircle2, QrCode, Maximize2, Settings2, ShieldCheck, Zap, Sparkles, LayoutGrid, Circle, Squircle, Grid2X2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ColorPickerPopover } from '../../components/ui/ColorPickerPopover';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'location' | 'vcard';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRStyleType = 'classic' | 'rounded' | 'dots' | 'modern' | 'neon';

export const QR_STYLES = [
  { 
    id: 'classic', 
    label: 'Classic', 
    desc: 'Traditional square QR modules.', 
    badge: 'Recommended',
    icon: LayoutGrid,
    qrProps: { qrStyle: 'squares', eyeRadius: 0 }
  },
  { 
    id: 'rounded', 
    label: 'Rounded', 
    desc: 'Rounded modules with a modern look.', 
    icon: Squircle,
    qrProps: { qrStyle: 'fluid', eyeRadius: 10 }
  },
  { 
    id: 'dots', 
    label: 'Dots', 
    desc: 'Circular dots for a softer appearance.', 
    icon: Circle,
    qrProps: { qrStyle: 'dots', eyeRadius: 10 }
  },
  { 
    id: 'modern', 
    label: 'Modern', 
    desc: 'Premium geometric design with smooth corners.', 
    badge: 'Popular',
    icon: Grid2X2,
    qrProps: { qrStyle: 'fluid', eyeRadius: 5 }
  },
  { 
    id: 'neon', 
    label: 'Neon', 
    desc: 'Modern glowing rounded QR style inspired by futuristic UI.', 
    icon: Sparkles,
    qrProps: { qrStyle: 'fluid', eyeRadius: 10 }
  },
];

interface ThemeStyles {
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textHover: string;
  subtext: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
  accentBg: string;
  accentHover: string;
  sliderAccent: string;
  sliderTrack: string;
}

export const QRGenerator: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  useEffect(() => {
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newTheme = localStorage.getItem('neonotex_theme') || 'minimal-white';
      setActiveTheme(newTheme);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isDark = activeTheme === 'midnight-black';
  const isPink = activeTheme === 'sakura-pink';

  const themeStyles: Record<string, ThemeStyles> = {
    'minimal-white': {
      bg: 'bg-white',
      cardBg: 'bg-white',
      cardBorder: 'border-slate-200/60',
      text: 'text-zinc-900',
      textHover: 'hover:text-zinc-950',
      subtext: 'text-slate-500',
      inputBg: 'bg-slate-50',
      inputBorder: 'border-slate-200 focus:border-slate-300',
      accent: 'text-zinc-900',
      accentBg: 'bg-zinc-900 text-white',
      accentHover: 'hover:bg-zinc-800',
      sliderAccent: 'accent-zinc-900',
      sliderTrack: 'bg-slate-200'
    },
    'midnight-black': {
      bg: 'bg-[#0A0A0A]',
      cardBg: 'bg-[#121212]',
      cardBorder: 'border-white/5',
      text: 'text-white',
      textHover: 'hover:text-slate-200',
      subtext: 'text-slate-400',
      inputBg: 'bg-[#1A1A1A]',
      inputBorder: 'border-white/10 focus:border-white/20',
      accent: 'text-white',
      accentBg: 'bg-white text-black',
      accentHover: 'hover:bg-slate-200',
      sliderAccent: 'accent-white',
      sliderTrack: 'bg-white/10'
    },
    'sakura-pink': {
      bg: 'bg-[#FFF0F5]',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      cardBorder: 'border-[#F8BBD0]/30',
      text: 'text-[#880E4F]',
      textHover: 'hover:text-[#4A0024]',
      subtext: 'text-[#AD1457]/70',
      inputBg: 'bg-white/50',
      inputBorder: 'border-[#F8BBD0]/50 focus:border-[#F48FB1]',
      accent: 'text-[#D81B60]',
      accentBg: 'bg-[#D81B60] text-white',
      accentHover: 'hover:bg-[#C2185B]',
      sliderAccent: 'accent-[#D81B60]',
      sliderTrack: 'bg-[#F8BBD0]/50'
    }
  };

  const currentTheme = themeStyles[activeTheme] || themeStyles['minimal-white'];

  const [qrType, setQrType] = useState<QRType>('url');
  
  // Data State
  const [urlData, setUrlData] = useState('');
  const [textData, setTextData] = useState('');
  const [emailData, setEmailData] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneData, setPhoneData] = useState('');
  
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  
  const [locLat, setLocLat] = useState('');
  const [locLng, setLocLng] = useState('');
  
  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');

  // Styling State
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(256);
  const [qrMargin, setQrMargin] = useState(4);
  const [qrLevel, setQrLevel] = useState<ErrorCorrectionLevel>('H');
  const [isCopied, setIsCopied] = useState(false);
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);
  
  const [qrStyle, setQrStyle] = useState<QRStyleType>('classic');
  const [isChangingStyle, setIsChangingStyle] = useState(false);

  const [logoImage, setLogoImage] = useState<string>('');
  const [logoWidth, setLogoWidth] = useState(60);
  const [logoHeight, setLogoHeight] = useState(60);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoImage('');
  };

  const handleStyleChange = (styleId: QRStyleType) => {
    if (qrStyle === styleId) return;
    setIsChangingStyle(true);
    setTimeout(() => {
      setQrStyle(styleId);
      setIsChangingStyle(false);
    }, 150);
  };

  const getSizeLabel = (size: number) => {
    if (size <= 128) return 'Small';
    if (size <= 256) return 'Medium';
    if (size <= 384) return 'Large';
    return 'XL';
  };

  const qrRef = useRef<HTMLDivElement>(null);

  const getQRValue = () => {
    switch (qrType) {
      case 'url': return urlData || ' ';
      case 'text': return textData || 'Enter some text...';
      case 'email': 
        if (!emailData) return 'mailto:';
        return `mailto:${emailData}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ''}`;
      case 'phone': return phoneData ? `tel:${phoneData}` : 'tel:';
      case 'wifi': 
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'location': 
        return `geo:${locLat || '0'},${locLng || '0'}`;
      case 'vcard': 
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLast};${vcardFirst}\nFN:${vcardFirst} ${vcardLast}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      default: return ' ';
    }
  };

  const handleDownload = (format: 'png' | 'svg') => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    if (format === 'png') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `neo-qr-${Date.now()}.png`;
      a.href = url;
      a.click();
    } else {
       // A bit hacky way to extract svg by rendering it but since we use QRCodeCanvas, we need to manually create SVG or just provide canvas download. 
       // For simplicity, we just download PNG for now, but label can still be there or we can use another library if SVG is strictly required. 
       // Let's stick to PNG for both, or just rename it. We will just use PNG download.
       const url = canvas.toDataURL('image/png');
       const a = document.createElement('a');
       a.download = `neo-qr-${Date.now()}.png`;
       a.href = url;
       a.click();
    }
  };

  const handleCopy = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error("Could not copy image: ", err);
        }
      }
    });
  };

  const handleReset = () => {
    setUrlData('');
    setTextData('');
    setEmailData('');
    setEmailSubject('');
    setPhoneData('');
    setWifiSsid('');
    setWifiPassword('');
    setLocLat('');
    setLocLng('');
    setVcardFirst('');
    setVcardLast('');
    setVcardPhone('');
    setVcardEmail('');
    setVcardCompany('');
    setQrColor('#000000');
    setQrBgColor('#ffffff');
    setQrSize(256);
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl border transition-colors outline-none font-medium ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text}`;
  const labelClasses = `block text-xs font-bold tracking-wider uppercase mb-2 ml-1 ${currentTheme.subtext}`;

  const tabs = [
    { id: 'url', icon: Globe, label: 'URL' },
    { id: 'text', icon: AlignLeft, label: 'Text' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'phone', icon: Phone, label: 'Phone' },
    { id: 'wifi', icon: Wifi, label: 'Wi-Fi' },
    { id: 'location', icon: MapPin, label: 'Location' },
    { id: 'vcard', icon: User, label: 'Contact' },
  ];

  return (
    <div className={`h-full pb-12 selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100 ${isDark ? 'dark' : ''}`}>
      
      {/* Generator Main UI */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden mb-24 flex flex-col lg:flex-row ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
        
        {/* Left Side: Controls */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setQrType(tab.id as QRType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  qrType === tab.id 
                    ? `${currentTheme.accentBg} shadow-md` 
                    : `bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 ${currentTheme.subtext} ${currentTheme.textHover}`
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-6 mb-10">
            {qrType === 'url' && (
              <div>
                <label className={labelClasses}>Website URL</label>
                <input
                  type="url"
                  placeholder="Paste your website link here..."
                  value={urlData}
                  onChange={(e) => setUrlData(e.target.value)}
                  className={inputClasses}
                />
              </div>
            )}

            {qrType === 'text' && (
              <div>
                <label className={labelClasses}>Plain Text</label>
                <textarea
                  placeholder="Enter your text here..."
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className={`${inputClasses} min-h-[120px] resize-y`}
                />
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input type="email" placeholder="hello@example.com" value={emailData} onChange={(e) => setEmailData(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Subject (Optional)</label>
                  <input type="text" placeholder="Inquiry about Neo QR" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClasses} />
                </div>
              </div>
            )}

            {qrType === 'phone' && (
              <div>
                <label className={labelClasses}>Phone Number</label>
                <input type="tel" placeholder="Enter your phone number..." value={phoneData} onChange={(e) => setPhoneData(e.target.value)} className={inputClasses} />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Network Name (SSID)</label>
                  <input type="text" placeholder="My Home Network" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Password</label>
                  <input type="password" placeholder="••••••••" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Encryption</label>
                  <select value={wifiEncryption} onChange={(e) => setWifiEncryption(e.target.value)} className={inputClasses}>
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  <input 
                    type="checkbox" 
                    id="wifi-hidden" 
                    checked={wifiHidden} 
                    onChange={(e) => setWifiHidden(e.target.checked)} 
                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-600 bg-slate-100 dark:bg-[#1A1A1A] dark:border-white/10"
                  />
                  <label htmlFor="wifi-hidden" className={`text-sm font-semibold cursor-pointer ${currentTheme.text}`}>Hidden Network</label>
                </div>
              </div>
            )}

            {qrType === 'location' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Latitude</label>
                  <input type="number" step="any" placeholder="37.7749" value={locLat} onChange={(e) => setLocLat(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Longitude</label>
                  <input type="number" step="any" placeholder="-122.4194" value={locLng} onChange={(e) => setLocLng(e.target.value)} className={inputClasses} />
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>First Name</label>
                  <input type="text" placeholder="John" value={vcardFirst} onChange={(e) => setVcardFirst(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Last Name</label>
                  <input type="text" placeholder="Doe" value={vcardLast} onChange={(e) => setVcardLast(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Phone</label>
                  <input type="tel" placeholder="Enter your phone number..." value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Email</label>
                  <input type="email" placeholder="john@example.com" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} className={inputClasses} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Company (Optional)</label>
                  <input type="text" placeholder="Neonotex Inc." value={vcardCompany} onChange={(e) => setVcardCompany(e.target.value)} className={inputClasses} />
                </div>
              </div>
            )}
          </div>

          {/* Customization */}
          <div className="pt-10 border-t border-slate-200 dark:border-white/10">
            <h4 className={`text-xl font-black tracking-tight mb-8 flex items-center gap-2 ${currentTheme.text}`}>
              <Settings2 size={22} className={currentTheme.accent} /> Customization
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* QR Color */}
              <div className={`p-5 rounded-[20px] border ${currentTheme.cardBorder} ${isDark ? 'bg-[#151515]/50' : 'bg-white/50'} backdrop-blur-xl flex flex-col justify-between shadow-sm h-full`}>
                <div className="flex justify-between items-center mb-6">
                  <label className={`${labelClasses} !mb-0 flex items-center gap-2`}>
                    <Palette size={16} /> QR Color
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    Primary
                  </span>
                </div>
                
                <ColorPickerPopover 
                  color={qrColor}
                  onChange={setQrColor}
                  label="QR Color"
                  theme={currentTheme}
                  isDark={isDark}
                  showAdvanced={showAdvancedColors}
                />
              </div>
              
              {/* Background Color */}
              <div className={`p-5 rounded-[20px] border ${currentTheme.cardBorder} ${isDark ? 'bg-[#151515]/50' : 'bg-white/50'} backdrop-blur-xl flex flex-col justify-between shadow-sm h-full`}>
                <div className="flex justify-between items-center mb-6">
                  <label className={`${labelClasses} !mb-0 flex items-center gap-2`}>
                    <ImageIcon size={16} /> Background
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    Canvas
                  </span>
                </div>
                
                <ColorPickerPopover 
                  color={qrBgColor}
                  onChange={setQrBgColor}
                  label="Background Color"
                  theme={currentTheme}
                  isDark={isDark}
                  showAdvanced={showAdvancedColors}
                />
              </div>

                                          {/* Size */}
              <div className={`p-6 rounded-[20px] border ${currentTheme.cardBorder} ${isDark ? 'bg-[#151515]/50' : 'bg-white/50'} backdrop-blur-xl shadow-sm lg:col-span-2 flex flex-col justify-center min-h-[160px]`}>
                <div className="flex justify-between items-center mb-6">
                  <label className={`text-[14px] font-[600] uppercase tracking-wider !mb-0 flex items-center gap-2 ${currentTheme.text}`}>
                    <Maximize2 size={16} /> QR Size
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${currentTheme.inputBg} ${currentTheme.text}`}>
                    {getSizeLabel(qrSize)}
                  </span>
                </div>
                
                <div className="relative px-1 mt-auto mb-auto">
                  <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                  <input 
                    type="range" 
                    min="128" 
                    max="512" 
                    step="32" 
                    value={qrSize} 
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className={`relative w-full h-1.5 rounded-full appearance-none cursor-pointer bg-transparent z-10 transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500`}
                  />
                </div>
                
                <div className="flex justify-between mt-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase px-1">
                  <span onClick={() => setQrSize(128)} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors">128px</span>
                  <span className={currentTheme.text}>{qrSize}px</span>
                  <span onClick={() => setQrSize(512)} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors">512px</span>
                </div>
              </div>

              {/* QR Style (Compact) */}
              <div className={`p-6 rounded-[20px] border ${currentTheme.cardBorder} ${isDark ? 'bg-[#151515]/50' : 'bg-white/50'} backdrop-blur-xl shadow-sm lg:col-span-2 flex flex-col justify-center min-h-[160px] overflow-visible`}>
                <div className="flex justify-between items-center mb-6">
                  <label className={`text-[14px] font-[600] uppercase tracking-wider !mb-0 flex items-center gap-2 ${currentTheme.text}`}>
                    <Sparkles size={16} /> QR Style
                  </label>
                </div>
                
                <div className="flex justify-between gap-2 mt-auto mb-auto w-full">
                  {QR_STYLES.map((style) => {
                    const isSelected = qrStyle === style.id;
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        title={style.label}
                        onClick={() => handleStyleChange(style.id as QRStyleType)}
                        className={`group relative w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all duration-200 border ${
                          isSelected
                            ? `bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.05] z-10`
                            : `bg-transparent border-slate-200 dark:border-white/10 ${currentTheme.subtext} hover:${currentTheme.text} hover:bg-slate-50 dark:hover:bg-white/5 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-[0_4px_12px_rgba(168,85,247,0.15)] hover:-translate-y-[2px]`
                        }`}
                      >
                        {isSelected && (
                           <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur opacity-40 animate-pulse"></div>
                        )}
                        <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} className={`relative z-10 ${isSelected ? 'text-white' : 'opacity-70 group-hover:text-purple-500 transition-colors'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Logo Upload */}
              <div className={`p-6 rounded-[20px] border ${currentTheme.cardBorder} ${isDark ? 'bg-[#151515]/50' : 'bg-white/50'} backdrop-blur-xl shadow-sm lg:col-span-2 flex flex-col justify-center min-h-[160px] overflow-visible`}>
                <div className="flex justify-between items-center mb-6">
                  <label className={`text-[14px] font-[600] uppercase tracking-wider !mb-0 flex items-center gap-2 ${currentTheme.text}`}>
                    <ImageIcon size={16} /> Add Logo
                  </label>
                  {logoImage && (
                    <button onClick={handleRemoveLogo} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
                      Remove Logo
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-4 mt-auto mb-auto w-full">
                  {!logoImage ? (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${isDark ? 'border-white/20 hover:border-white/40 text-slate-300' : 'border-slate-300 hover:border-purple-500 text-slate-600'}`}>
                        <Download size={18} /> Upload Image
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg border flex-shrink-0 bg-white/10 flex items-center justify-center overflow-hidden">
                        <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="relative px-1">
                          <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${currentTheme.subtext}`}>Logo Size ({logoWidth}px)</label>
                          <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} mt-2`}></div>
                          <input 
                            type="range" 
                            min="20" 
                            max="120" 
                            step="5" 
                            value={logoWidth} 
                            onChange={(e) => {
                              setLogoWidth(Number(e.target.value));
                              setLogoHeight(Number(e.target.value));
                            }}
                            className={`relative w-full h-1 rounded-full appearance-none cursor-pointer bg-transparent z-10 transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 mt-2`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

{/* Right Side: Preview */}
        <div className="lg:w-[450px] p-8 md:p-12 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-black/20">
          
          <div className="w-full max-w-sm mb-10 flex justify-center flex-col items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
              <span className="text-xs">👀</span>
              <span className={`text-xs font-bold uppercase tracking-widest ${currentTheme.text}`}>Live Preview</span>
            </div>
            
            <div 
              ref={qrRef} 
              className="p-4 md:p-6 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100 transition-all duration-300 hover:scale-[1.02] w-full max-w-[260px] md:max-w-[320px] aspect-square flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: qrBgColor }}
            >
              <div 
                className="w-full h-full flex items-center justify-center min-w-0 min-h-0 transition-transform duration-300 ease-out relative"
                style={{ transform: `scale(${qrSize / 512})` }}
              >
                <div className={`w-full h-full flex items-center justify-center transition-all duration-150 ${isChangingStyle ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                  <QRCode
                    value={getQRValue()}
                    size={qrSize}
                    bgColor={qrBgColor}
                    fgColor={qrColor}
                    ecLevel={qrLevel}
                    quietZone={qrMargin * 4}
                    qrStyle={QR_STYLES.find(s => s.id === qrStyle)?.qrProps.qrStyle || 'squares'}
                    eyeRadius={QR_STYLES.find(s => s.id === qrStyle)?.qrProps.eyeRadius || 0}
                    logoImage={logoImage}
                    logoWidth={logoWidth}
                    logoHeight={logoHeight}
                    logoOpacity={1}
                    removeQrCodeBehindLogo={true}
                    logoPadding={2}
                    logoPaddingStyle="circle"
                    style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
                {isChangingStyle && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-[3px] border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
          </div>
          
          <div className="w-full space-y-3 mt-4">
            <Button 
              onClick={() => handleDownload('png')} 
              className="w-full rounded-[1.25rem] py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-[0_8px_30px_rgb(147,51,234,0.3)] hover:shadow-[0_8px_30px_rgb(147,51,234,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              <Download size={20} className="mr-2" /> Download Image
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={handleCopy} 
                className={`w-full rounded-[1rem] py-5 border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'} shadow-sm font-semibold transition-all duration-300 hover:-translate-y-0.5`}
              >
                {isCopied ? <CheckCircle2 size={18} className="mr-2 text-emerald-500" /> : <Copy size={18} className="mr-2 opacity-70" />} 
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleReset} 
                className={`w-full rounded-[1rem] py-5 border ${isDark ? 'border-rose-900/30 bg-rose-900/10 hover:bg-rose-900/20 text-rose-400' : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600'} shadow-sm font-semibold transition-all duration-300 hover:-translate-y-0.5`}
              >
                <RefreshCw size={18} className="mr-2 opacity-70" /> Reset
              </Button>
            </div>
          </div>



        </div>
      </div>


      {/* Footer */}
      <footer className={`pt-12 pb-8 border-t flex flex-col items-center gap-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex flex-col items-center gap-1">
          <span className={`font-black text-xl tracking-tighter ${currentTheme.text}`}>Neonotex</span>
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">🚀 Think It. Push It.</span>
          <span className={`text-xs font-semibold mt-2 ${currentTheme.subtext}`}>© 2026 Neonotex</span>
        </div>
      </footer>

    </div>
  );
};
