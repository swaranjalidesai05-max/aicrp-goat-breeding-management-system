                        ┌───────────────────────────┐
                        │   React.js Admin Panel    │
                        │  (Director/HoD/Scientist/ │
                        │   Co-PI web dashboard)    │
                        └─────────────┬─────────────┘
                                      │ HTTPS/REST (JWT)
                                      │
┌─────────────────────┐               │              ┌───────────────────────┐
│ Flutter Mobile App  │◄─────────────-┼─────────────►│   Nginx Reverse Proxy │
│(Data Enumerator –   │  HTTPS/REST   │              │   + Rate Limiting     │
|ffline-first, sync)  │  (JWT)        │              └───────────┬───────────┘
└─────────────────────┘               │                          │
                                      │              ┌───────────▼───────────┐
                                      └─────────────►│  Node.js + Express    │
                                                     │  REST API (v1)        │
                                                     │  - Auth (JWT+refresh) │
                                                     │  - RBAC middleware    │
                                                     │  - Validation (zod)   │ 
                                                     │  - Sync engine        │
                                                     │  - Excel export       │
                                                     │  - Audit logging      │
                                                     └───────┬───────┬───────┘
                                                             │       │
                                          ┌──────────────────┘       └───────────────┐
                                          ▼                                          ▼
                              ┌───────────────────────┐               ┌───────────────────────┐
                              │  PostgreSQL (Prisma)  │               │  Object Storage (S3/  │
                              │  Primary data store   │               │  MinIO) — photos,     │
                              │                       │               │  documents, exports   │
                              └───────────────────────┘               └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │ Background Jobs       │
                              │ (node-cron / BullMQ)  │
                              │ - Scheduled reports   │
                              │  Notification dispatch│
                              │ -Sync conflict alerts │
                              └───────────────────────┘