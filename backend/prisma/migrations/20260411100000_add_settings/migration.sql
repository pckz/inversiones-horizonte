CREATE TABLE IF NOT EXISTS "settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

INSERT INTO "settings" ("key", "value", "updated_at") VALUES
  ('contact_email', 'pckz+inversioneshorizonte@pckz.cl', NOW()),
  ('transfer_instructions', E'Banco: Banco Estado\nTipo de cuenta: Cuenta Corriente\nN° de cuenta: 123456789\nRUT: 12.345.678-9\nNombre: Inversiones Horizonte SpA\nEmail: pckz+inversioneshorizonte@pckz.cl', NOW())
ON CONFLICT ("key") DO NOTHING;
