const fs = require('fs');
const path = require('path');

// Ambil kredensial dari Environment Variables Netlify
const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

// Buat isi template yang persis dengan supabase-client.js milikmu
const fileContent = `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${anonKey}';

export const isSupabaseConfigured = () => {
\treturn Boolean(
\t\tSUPABASE_URL &&
\t\tSUPABASE_ANON_KEY &&
\t\tSUPABASE_URL.trim() !== '' &&
\t\tSUPABASE_ANON_KEY.trim() !== '' &&
\t\t!SUPABASE_URL.includes('PASTE_SUPABASE_PROJECT_URL_DI_SINI') &&
\t\t!SUPABASE_ANON_KEY.includes('PASTE_SUPABASE_PUBLIC_KEY_DI_SINI')
\t);
};

let client = null;
if (isSupabaseConfigured()) {
\tclient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = client;
window.supabase = client;
window.isSupabaseConfigured = isSupabaseConfigured;

// Beritahu script lain bahwa client supabase sudah disiapkan
window.dispatchEvent(new CustomEvent('supabase:ready', { detail: { client, isConfigured: isSupabaseConfigured() } }));
`;

// Pastikan folder js/ ada sebelum menulis file
const targetDir = path.join(__dirname, 'js');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Tuliskan ke js/supabase-client.js
const targetFile = path.join(targetDir, 'supabase-client.js');
fs.writeFileSync(targetFile, fileContent, 'utf8');

console.log('✅ File js/supabase-client.js berhasil di-generate untuk deployment Netlify!');