create schema prumo_jobs;
revoke all on schema prumo_jobs from public, anon, authenticated;
grant usage on schema prumo_jobs to service_role;

create table prumo_jobs.control (
  singleton boolean primary key default true check (singleton),
  gateway_digest text not null check (gateway_digest ~ '^[a-f0-9]{64}$'),
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 3000000),
  profile jsonb not null default '{}'::jsonb check (jsonb_typeof(profile) = 'object' and octet_length(profile::text) <= 1000000),
  revision bigint not null default 0,
  lease_owner uuid,
  lease_until timestamptz
);
alter table prumo_jobs.control enable row level security;
revoke all on prumo_jobs.control from public, anon, authenticated;
grant select, update on prumo_jobs.control to service_role;

create function public.prumo_telegram_store(p_digest text, p_command jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_control prumo_jobs.control%rowtype;
  v_owner uuid;
  v_revision bigint;
begin
  select * into v_control from prumo_jobs.control where singleton for update;
  if not found or p_digest is distinct from v_control.gateway_digest then
    raise insufficient_privilege using message = 'Acesso não autorizado.';
  end if;
  if jsonb_typeof(p_command) is distinct from 'object' then raise exception 'Comando inválido.'; end if;
  if p_command->>'op' = 'configure' then
    if v_control.revision <> 0 or v_control.profile <> '{}'::jsonb or v_control.lease_owner is not null then
      raise exception 'Importação inicial já realizada.';
    end if;
    if jsonb_typeof(p_command->'state') is distinct from 'object'
       or jsonb_typeof(p_command->'profile') is distinct from 'object'
       or substring(decode(p_command->'profile'->>'resumeBase64', 'base64') from 1 for 5) is distinct from convert_to('%PDF-', 'UTF8')
       or encode(extensions.digest(decode(p_command->'profile'->>'resumeBase64', 'base64'), 'sha256'), 'hex')
          is distinct from p_command->'profile'->>'resumeSha256' then
      raise exception 'Perfil ou PDF inválido.';
    end if;
    update prumo_jobs.control set state = p_command->'state', profile = p_command->'profile', revision = 1 where singleton;
    return '{"configured":true}'::jsonb;
  end if;
  if p_command->>'op' = 'profile' then return v_control.profile; end if;
  v_owner := (p_command->>'owner')::uuid;
  if v_owner is null then raise exception 'Proprietário obrigatório.'; end if;
  if p_command->>'op' = 'acquire' then
    if v_control.lease_until > clock_timestamp() then return 'null'::jsonb; end if;
    update prumo_jobs.control set lease_owner = v_owner, lease_until = clock_timestamp() + interval '5 minutes' where singleton;
    return jsonb_build_object('state', v_control.state, 'revision', v_control.revision, 'profile', v_control.profile - 'resumeBase64');
  elsif p_command->>'op' = 'save' then
    if v_control.lease_owner is distinct from v_owner or v_control.lease_until <= clock_timestamp()
       or v_control.revision is distinct from (p_command->>'revision')::bigint then
      raise exception 'Gravação não autorizada ou desatualizada.';
    end if;
    if jsonb_typeof(p_command->'state') is distinct from 'object' then raise exception 'Estado inválido.'; end if;
    update prumo_jobs.control set state = p_command->'state', revision = revision + 1,
      lease_until = clock_timestamp() + interval '5 minutes' where singleton returning revision into v_revision;
    return jsonb_build_object('revision', v_revision);
  elsif p_command->>'op' = 'release' then
    update prumo_jobs.control set lease_owner = null, lease_until = null where singleton and lease_owner = v_owner;
    return 'true'::jsonb;
  end if;
  raise exception 'Comando desconhecido.';
end;
$$;
revoke all on function public.prumo_telegram_store(text, jsonb) from public, anon, authenticated;
grant execute on function public.prumo_telegram_store(text, jsonb) to service_role;

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
