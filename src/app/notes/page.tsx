import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Notes() {
  const supabase = createSupabaseServerClient();
  const { data: notes, error } = await supabase.from("notes").select();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error loading notes
            </h2>
            <p className="text-red-600 dark:text-red-300">{error.message}</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-4">
              Make sure to create the notes table in your Supabase database
              first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Notes from Supabase
        </h1>

        {notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note: any) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <p className="text-gray-700 dark:text-gray-300">{note.title}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                  ID: {note.id}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              No notes found. Add some notes to your Supabase database.
            </p>
          </div>
        )}

        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Raw Data (JSON):
          </h2>
          <pre className="text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
            {JSON.stringify(notes, null, 2)}
          </pre>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Setup Instructions:
          </h3>
          <ol className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
            <li>1. Go to your Supabase project dashboard</li>
            <li>2. Open the SQL Editor</li>
            <li>3. Run the following SQL commands:</li>
          </ol>
          <pre className="mt-3 p-3 bg-white dark:bg-gray-900 rounded text-xs overflow-x-auto">
            {`-- Create the table
create table notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert sample data
insert into notes (title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

-- Enable RLS
alter table notes enable row level security;

-- Add public read policy
create policy "public can read notes"
on public.notes
for select to anon
using (true);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
