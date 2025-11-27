import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://drvurgbsuiwnmwgikykg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydnVyZ2JzdWl3bm13Z2lreWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjc2NzIsImV4cCI6MjA3OTg0MzY3Mn0.pMAsD8ogQWLy-GPXs5fAmFCeokThb3pU4q46pdzDeyw"
);
