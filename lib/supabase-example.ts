/**
 * Example usage of Supabase client
 * 
 * Import the client:
 * import { supabase } from '@/lib/supabase';
 * 
 * Example queries:
 * 
 * // Fetch data
 * const { data, error } = await supabase
 *   .from('your_table')
 *   .select('*');
 * 
 * // Insert data
 * const { data, error } = await supabase
 *   .from('your_table')
 *   .insert([{ column: 'value' }]);
 * 
 * // Update data
 * const { data, error } = await supabase
 *   .from('your_table')
 *   .update({ column: 'new_value' })
 *   .eq('id', 1);
 * 
 * // Delete data
 * const { data, error } = await supabase
 *   .from('your_table')
 *   .delete()
 *   .eq('id', 1);
 * 
 * // Authentication
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'example@email.com',
 *   password: 'password123'
 * });
 * 
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'example@email.com',
 *   password: 'password123'
 * });
 */

export {};

