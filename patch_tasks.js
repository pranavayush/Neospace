const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/Tasks.tsx', 'utf-8');
code = code.replace(
  /        <\/AnimatePresence>,\n        document\.body\n      \)}\n    <\/div>/g,
  '        </AnimatePresence>\n    </div>'
);
fs.writeFileSync('src/pages/dashboard/Tasks.tsx', code);
