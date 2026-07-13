const fs = require('fs');
const file = 'pages/dashboard/QRGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex flex-nowrap overflow-x-auto lg:flex-wrap xl:flex-nowrap gap-\[10px\] scrollbar-none pb-2 lg:pb-0 px-1 mt-auto mb-auto">[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `<div className="flex flex-wrap gap-2 mt-auto mb-auto w-full">
                  {QR_STYLES.map((style) => {
                    const isSelected = qrStyle === style.id;
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleStyleChange(style.id as QRStyleType)}
                        className={\`h-[36px] px-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-200 border \${
                          isSelected
                            ? \`\${currentTheme.accentBg} text-white border-transparent shadow-[0_0_15px_rgba(147,51,234,0.3)]\`
                            : \`bg-transparent border-slate-200 dark:border-white/10 \${currentTheme.subtext} hover:\${currentTheme.text} hover:bg-slate-50 dark:hover:bg-white/5\`
                        }\`}
                      >
                        <Icon size={14} className={\`shrink-0 \${isSelected ? 'text-white' : 'opacity-70'}\`} />
                        <span className={\`text-[13px] font-medium tracking-normal whitespace-nowrap \${isSelected ? 'text-white' : ''}\`}>
                          {style.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully patched QR Style");
} else {
    console.log("Could not find regex match");
}
