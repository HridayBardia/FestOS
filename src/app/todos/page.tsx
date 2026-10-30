import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Supabase Connection Test</h1>
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          Error: {error.message}
        </div>
      )}
      {!error && todos && todos.length === 0 && (
        <p className="text-sm text-gray-500">Connected to Supabase. Table &quot;todos&quot; is currently empty or does not exist yet.</p>
      )}
      <ul className="space-y-1">
        {todos?.map((todo: any) => (
          <li key={todo.id} className="text-sm text-gray-800 bg-white p-2 rounded shadow-sm border border-gray-100">
            {todo.name || todo.title || JSON.stringify(todo)}
          </li>
        ))}
      </ul>
    </div>
  );
}
