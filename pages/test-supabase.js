import { supabase } from "@/lib/supabase"

export default async function TestPage() {
  const { data, error } = await supabase.from("profiles").select("*").limit(1)
  return (
    <div>
      <h1>Supabase Test</h1>
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
