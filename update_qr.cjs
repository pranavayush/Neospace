const fs = require('fs');
const file = 'pages/dashboard/QRGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `      {/* Hero Section */}
      <div className="pt-16 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Free. Fast. No Login Required.</span>
        </div>
        <h1 className={\`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 \${currentTheme.text}\`}>
          Generate beautiful <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">QR Codes</span> in seconds.
        </h1>
      </div>`;

const replace = `      {/* Hero Section */}
      <div className="pt-16 pb-12 flex flex-col items-center text-center">
        <h1 className={\`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 \${currentTheme.text}\`}>
          Generate beautiful <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">QR Codes</span> in seconds.
        </h1>
        <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Free. Fast. No Login Required.
        </p>
      </div>`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log("Done");
