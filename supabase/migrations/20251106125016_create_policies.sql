SET ROLE postgres;

drop policy if exists "Enable read access for all users" on "public"."aliases";
drop policy if exists "Enable read access for all users" on "public"."qr_codes";
drop policy if exists "Enable read access for all users" on "public"."url_objects";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'aliases_url_object_id_key') THEN
        CREATE UNIQUE INDEX aliases_url_object_id_key ON public.aliases USING btree (url_object_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'qr_codes_pkey') THEN
        CREATE UNIQUE INDEX qr_codes_pkey ON public.qr_codes USING btree (id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'qr_codes_url_object_id_key') THEN
        CREATE UNIQUE INDEX qr_codes_url_object_id_key ON public.qr_codes USING btree (url_object_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'qr_codes_pkey' AND conrelid = 'public.qr_codes'::regclass) THEN
        alter table "public"."qr_codes" add constraint "qr_codes_pkey" PRIMARY KEY using index "qr_codes_pkey";
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'aliases_url_object_id_key' AND conrelid = 'public.aliases'::regclass) THEN
        alter table "public"."aliases" add constraint "aliases_url_object_id_key" UNIQUE using index "aliases_url_object_id_key";
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'qr_codes_url_object_id_key' AND conrelid = 'public.qr_codes'::regclass) THEN
        alter table "public"."qr_codes" add constraint "qr_codes_url_object_id_key" UNIQUE using index "qr_codes_url_object_id_key";
    END IF;
END $$;

set check_function_bodies = off;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_url_identifier') THEN
        CREATE FUNCTION public.generate_url_identifier()
            RETURNS text LANGUAGE sql
        AS $func$
        select string_agg(substr(characters, (random() * length(characters) + 1)::integer, 1), '')
        from (values('abcdefghijklmnopqrstuvwxyz0123456789-')) as symbols(characters)
        join generate_series(1, 6) on true;
        $func$;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_view' AND pronargs = 4) THEN
        CREATE FUNCTION public.record_view(objecttype text, identifier text, ip text, useragent text)
            RETURNS void LANGUAGE plpgsql
        AS $func$
        DECLARE
            alias_id uuid;
            qr_code_id uuid;
            url_object_id int;
        BEGIN
            IF objectType = 'url_objects' THEN
                select id into url_object_id from url_objects where id = record_view.identifier::int;
            END IF;
            IF objectType = 'qr_codes' THEN
                select id into qr_code_id from qr_codes where id = record_view.identifier::uuid;
            END IF;
            IF objectType = 'aliases' THEN
                select id into alias_id from aliases where id = record_view.identifier::uuid;
            END IF;
            insert into visits (ip, user_agent, url_object_id, qr_code_id, alias_id)
            values (ip, userAgent, url_object_id, qr_code_id, alias_id);
        END;
        $func$;
    END IF;
END $$;

grant delete on table "public"."aliases" to "postgres";
grant insert on table "public"."aliases" to "postgres";
grant references on table "public"."aliases" to "postgres";
grant select on table "public"."aliases" to "postgres";
grant trigger on table "public"."aliases" to "postgres";
grant truncate on table "public"."aliases" to "postgres";
grant update on table "public"."aliases" to "postgres";

grant delete on table "public"."qr_codes" to "postgres";
grant insert on table "public"."qr_codes" to "postgres";
grant references on table "public"."qr_codes" to "postgres";
grant select on table "public"."qr_codes" to "postgres";
grant trigger on table "public"."qr_codes" to "postgres";
grant truncate on table "public"."qr_codes" to "postgres";
grant update on table "public"."qr_codes" to "postgres";

grant delete on table "public"."url_objects" to "postgres";
grant insert on table "public"."url_objects" to "postgres";
grant references on table "public"."url_objects" to "postgres";
grant select on table "public"."url_objects" to "postgres";
grant trigger on table "public"."url_objects" to "postgres";
grant truncate on table "public"."url_objects" to "postgres";
grant update on table "public"."url_objects" to "postgres";

grant delete on table "public"."visits" to "postgres";
grant insert on table "public"."visits" to "postgres";
grant references on table "public"."visits" to "postgres";
grant select on table "public"."visits" to "postgres";
grant trigger on table "public"."visits" to "postgres";
grant truncate on table "public"."visits" to "postgres";
grant update on table "public"."visits" to "postgres";

drop policy if exists "Enable insert for authenticated users only" on "public"."aliases";
create policy "Enable insert for authenticated users only"
    on "public"."aliases" as permissive for insert to authenticated
    with check ((( SELECT auth.uid() AS uid) = ( SELECT url_objects.user_id FROM public.url_objects WHERE (url_objects.id = aliases.url_object_id))));

drop policy if exists "Enable users to view their own data only" on "public"."aliases";
create policy "Enable users to view their own data only"
    on "public"."aliases" as permissive for select to authenticated
    using ((( SELECT auth.uid() AS uid) = ( SELECT url_objects.user_id FROM public.url_objects WHERE (url_objects.id = aliases.url_object_id))));

drop policy if exists "Enable insert for users based on user_id" on "public"."qr_codes";
create policy "Enable insert for users based on user_id"
    on "public"."qr_codes" as permissive for insert to public
    with check ((( SELECT auth.uid() AS uid) = ( SELECT url_objects.user_id FROM public.url_objects WHERE (url_objects.id = qr_codes.url_object_id))));

drop policy if exists "Enable users to view their own data only" on "public"."qr_codes";
create policy "Enable users to view their own data only"
    on "public"."qr_codes" as permissive for select to authenticated
    using ((( SELECT auth.uid() AS uid) = ( SELECT url_objects.user_id FROM public.url_objects WHERE (url_objects.id = qr_codes.url_object_id))));

drop policy if exists "Enable insert for users based on user_id" on "public"."url_objects";
create policy "Enable insert for users based on user_id"
    on "public"."url_objects" as permissive for insert to public
    with check ((( SELECT auth.uid() AS uid) = user_id));

drop policy if exists "Enable users to view their own data only" on "public"."url_objects";
create policy "Enable users to view their own data only"
    on "public"."url_objects" as permissive for select to authenticated
    using ((( SELECT auth.uid() AS uid) = user_id));

drop trigger if exists "enforce_bucket_name_length_trigger" on "storage"."buckets";
drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";
drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";
drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'storage' AND table_name = 'prefixes'
    ) THEN
        DROP TRIGGER IF EXISTS "prefixes_create_hierarchy" ON "storage"."prefixes";
        DROP TRIGGER IF EXISTS "prefixes_delete_hierarchy" ON "storage"."prefixes";
    END IF;
END $$;

RESET ROLE;
