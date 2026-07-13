import re

with open('App.tsx', 'r') as f:
    content = f.read()

handler = """
function DocumentTitleHandler() {
  const location = useLocation();

  useEffect(() => {
    let title = 'Neonotex';
    const path = location.pathname;

    if (path === RoutePath.HOME) title = 'Home | Neonotex';
    else if (path.startswith('/tasks')) title = 'Tasks | Neonotex';
    else if (path.startswith('/notes/new')) title = 'Create Note | Neonotex';
    else if (re.match(r'^/notes/[^/]+/edit$', path)) title = 'Edit Note | Neonotex';
    else if (re.match(r'^/notes/[^/]+$', path)) title = 'Note | Neonotex';
    else if (path.startswith('/notes')) title = 'My Notes | Neonotex';
    else if (path.startswith('/collections')) title = 'Collections | Neonotex';
    else if (path.startswith('/qr')) title = 'QR Generator | Neonotex';
    else if (path.startswith('/favorites')) title = 'Favorites | Neonotex';
    else if (path.startswith('/trash')) title = 'Trash | Neonotex';
    else if (path.startswith('/store')) title = 'Store | Neonotex';
    else if (path.startswith('/account')) title = 'Account | Neonotex';
    else if (path.startswith('/login')) title = 'Sign In | Neonotex';
    else if (path.startswith('/signup')) title = 'Sign Up | Neonotex';
    else if (path.startswith('/forgot-password')) title = 'Forgot Password | Neonotex';
    
    document.title = title;
  }, [location.pathname]);

  return null;
}
"""

js_handler = """
function DocumentTitleHandler() {
  const location = useLocation();

  useEffect(() => {
    let title = 'Neonotex';
    const path = location.pathname;

    if (path === RoutePath.HOME) title = 'Home | Neonotex';
    else if (path.startsWith('/tasks')) title = 'Tasks | Neonotex';
    else if (path.startsWith('/notes/new')) title = 'Create Note | Neonotex';
    else if (path.match(/^\\/notes\\/[^\\/]+\\/edit$/)) title = 'Edit Note | Neonotex';
    else if (path.match(/^\\/notes\\/[^\\/]+$/)) title = 'Note | Neonotex';
    else if (path.startsWith('/notes')) title = 'My Notes | Neonotex';
    else if (path.startsWith('/collections')) title = 'Collections | Neonotex';
    else if (path.startsWith('/qr')) title = 'QR Generator | Neonotex';
    else if (path.startsWith('/favorites')) title = 'Favorites | Neonotex';
    else if (path.startsWith('/trash')) title = 'Trash | Neonotex';
    else if (path.startsWith('/store')) title = 'Store | Neonotex';
    else if (path.startsWith('/account')) title = 'Account | Neonotex';
    else if (path.startsWith('/login')) title = 'Sign In | Neonotex';
    else if (path.startsWith('/signup')) title = 'Sign Up | Neonotex';
    else if (path.startsWith('/forgot-password')) title = 'Forgot Password | Neonotex';
    
    document.title = title;
  }, [location.pathname]);

  return null;
}
"""

content = content.replace("function App() {", js_handler + "\nfunction App() {")
content = content.replace("<ForceHomeOnRefresh />", "<ForceHomeOnRefresh />\n        <DocumentTitleHandler />")

with open('App.tsx', 'w') as f:
    f.write(content)

