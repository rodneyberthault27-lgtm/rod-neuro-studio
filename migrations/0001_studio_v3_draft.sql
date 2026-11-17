-- ROD-003: modelo de referência para homologação PostgreSQL.
-- NÃO APLICAR EM PRODUÇÃO. Falta integração com autenticação e políticas RLS testadas.
-- Este esquema não migra documentos nem blobs do Artifact Claude.
CREATE SCHEMA IF NOT EXISTS rod;

CREATE TABLE IF NOT EXISTS rod.workspaces (
    id uuid PRIMARY KEY,
    name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 180),
    owner_user_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rod.memberships (
    workspace_id uuid NOT NULL REFERENCES rod.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS rod.projects (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES rod.workspaces(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 220),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN
        ('draft','briefing','analysis','creation','testing','complete','archived')),
    origin text NOT NULL DEFAULT 'native',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (workspace_id,id)
);

CREATE TABLE IF NOT EXISTS rod.documents (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES rod.workspaces(id) ON DELETE CASCADE,
    project_id uuid,
    kind text NOT NULL CHECK (kind IN
        ('analysis','legacy_briefing','creative_brief','experiment','creative_version','observation')),
    revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
    review_state text NOT NULL DEFAULT 'unverified_legacy'
        CHECK (review_state IN ('unverified_legacy','needs_link_review','verified')),
    payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
    legacy_collection text,
    legacy_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_doc_project FOREIGN KEY (workspace_id,project_id)
        REFERENCES rod.projects(workspace_id,id) ON DELETE RESTRICT,
    UNIQUE (workspace_id,id),
    UNIQUE (workspace_id,legacy_collection,legacy_id,revision)
);

CREATE TABLE IF NOT EXISTS rod.asset_references (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES rod.workspaces(id) ON DELETE CASCADE,
    document_id uuid NOT NULL,
    source_ref text NOT NULL,
    storage_key text,
    state text NOT NULL DEFAULT 'unresolved'
        CHECK (state IN ('unresolved','verified','missing','quarantined')),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_asset_document FOREIGN KEY (workspace_id,document_id)
        REFERENCES rod.documents(workspace_id,id) ON DELETE RESTRICT,
    UNIQUE (workspace_id,id)
);

CREATE TABLE IF NOT EXISTS rod.import_runs (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES rod.workspaces(id) ON DELETE CASCADE,
    started_by uuid NOT NULL,
    input_sha256 text NOT NULL CHECK (input_sha256 ~ '^[a-f0-9]{64}$'),
    state text NOT NULL DEFAULT 'staged' CHECK (state IN
        ('staged','review','ready','applied','rolled_back','failed')),
    manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- FAIL CLOSED: nenhuma policy é criada nesta fase.
-- O backend somente poderá operar depois de policies específicas por workspace,
-- testes de isolamento, papéis e restrições de service-role.
ALTER TABLE rod.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod.asset_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod.import_runs ENABLE ROW LEVEL SECURITY;
