create or replace function public.prumo_telegram_store(p_digest text, p_command jsonb)
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
  if p_command->>'op' = 'connect_gupy' then
    if v_control.state->>'userId' is null then raise exception 'Vincule a conta do Telegram antes de conectar.'; end if;
    if v_control.lease_until > clock_timestamp() then raise exception 'Operação em andamento.'; end if;
    if jsonb_typeof(p_command->'session') is distinct from 'object'
       or (p_command->'session'->>'iv' ~ '^[a-f0-9]{24}$') is distinct from true
       or (p_command->'session'->>'tag' ~ '^[a-f0-9]{32}$') is distinct from true
       or (p_command->'session'->>'data' ~ '^[A-Za-z0-9+/]+={0,2}$') is distinct from true
       or octet_length((p_command->'session')::text) > 150000 then
      raise exception 'Sessão cifrada inválida.';
    end if;
    update prumo_jobs.control set profile = jsonb_set(profile, '{gupySession}', p_command->'session'),
      state = state - 'gupy', revision = revision + 1 where singleton;
    return 'true'::jsonb;
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

