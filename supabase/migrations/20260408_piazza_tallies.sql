create table if not exists public.digital_piazza_tallies (
    box_id text primary key,
    total_tally integer not null default 0
);

-- Enable RLS
alter table public.digital_piazza_tallies enable row level security;

-- Create an open policy for select
create policy "Allow public read access to digital piazza tallies"
    on public.digital_piazza_tallies
    for select
    to public
    using (true);

-- Create an RPC to safely batch upsert tallies
create or replace function batch_increment_piazza_tallies(increments jsonb)
returns void
language plpgsql
security definer
as $$
declare
    rec record;
begin
    -- increments format expected: [{"box_id": "stone_5_2", "increments": 45}, ...]
    for rec in select * from jsonb_to_recordset(increments) as x(box_id text, increments integer) loop
        insert into public.digital_piazza_tallies (box_id, total_tally)
        values (rec.box_id, rec.increments)
        on conflict (box_id)
        do update set total_tally = digital_piazza_tallies.total_tally + rec.increments;
    end loop;
end;
$$;
