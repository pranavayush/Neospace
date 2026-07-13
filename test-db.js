import { supabase } from './supabaseClient.js';

async function test() {
  const { data, error } = await supabase.from('collections').select('*').limit(1);
  console.log('collections:', data, error);
  const { data: d2, error: e2 } = await supabase.from('collection_items').select('*').limit(1);
  console.log('collection_items:', d2, e2);
}
test();
