// SCIM 2.0 Schema definitions per RFC 7643

export const SCIM_SCHEMAS = {
  USER: "urn:ietf:params:scim:schemas:core:2.0:User",
  GROUP: "urn:ietf:params:scim:schemas:core:2.0:Group",
  LIST_RESPONSE: "urn:ietf:params:scim:api:messages:2.0:ListResponse",
  PATCH_OP: "urn:ietf:params:scim:api:messages:2.0:PatchOp",
  ERROR: "urn:ietf:params:scim:api:messages:2.0:Error",
  SERVICE_PROVIDER_CONFIG: "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig",
  RESOURCE_TYPE: "urn:ietf:params:scim:schemas:core:2.0:ResourceType",
  SCHEMA: "urn:ietf:params:scim:schemas:core:2.0:Schema",
} as const;

export function scimListResponse(resources: unknown[], totalResults: number, startIndex: number = 1) {
  return {
    schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
    totalResults,
    itemsPerPage: resources.length,
    startIndex,
    Resources: resources,
  };
}

export function scimError(status: number, detail: string, scimType?: string) {
  return {
    schemas: [SCIM_SCHEMAS.ERROR],
    status: String(status),
    detail,
    ...(scimType ? { scimType } : {}),
  };
}

export function toScimUser(user: {
  id: string;
  email: string;
  name: string;
  externalId?: string | null;
  active?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  const nameParts = user.name.split(" ");
  return {
    schemas: [SCIM_SCHEMAS.USER],
    id: user.id,
    externalId: user.externalId ?? undefined,
    userName: user.email,
    name: {
      givenName: nameParts[0] ?? "",
      familyName: nameParts.slice(1).join(" ") || (nameParts[0] ?? ""),
    },
    displayName: user.name,
    emails: [{ value: user.email, primary: true, type: "work" }],
    active: user.active !== false,
    roles: user.role ? [{ value: user.role }] : [],
    meta: {
      resourceType: "User",
      created: user.createdAt,
      lastModified: user.updatedAt ?? user.createdAt,
    },
  };
}

export function toScimGroup(group: {
  id: string;
  externalGroupId: string;
  displayName: string;
  members?: { value: string; display: string }[];
  createdAt?: string;
  updatedAt?: string;
}) {
  return {
    schemas: [SCIM_SCHEMAS.GROUP],
    id: group.id,
    externalId: group.externalGroupId,
    displayName: group.displayName,
    members: group.members ?? [],
    meta: {
      resourceType: "Group",
      created: group.createdAt,
      lastModified: group.updatedAt ?? group.createdAt,
    },
  };
}

export const SERVICE_PROVIDER_CONFIG = {
  schemas: [SCIM_SCHEMAS.SERVICE_PROVIDER_CONFIG],
  documentationUri: "https://agentgate.dev/docs/scim",
  patch: { supported: true },
  bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
  filter: { supported: true, maxResults: 200 },
  changePassword: { supported: false },
  sort: { supported: false },
  etag: { supported: false },
  authenticationSchemes: [
    {
      type: "oauthbearertoken",
      name: "OAuth Bearer Token",
      description: "Authentication scheme using the OAuth Bearer Token Standard",
    },
  ],
};

export const RESOURCE_TYPES = [
  {
    schemas: [SCIM_SCHEMAS.RESOURCE_TYPE],
    id: "User",
    name: "User",
    endpoint: "/Users",
    schema: SCIM_SCHEMAS.USER,
  },
  {
    schemas: [SCIM_SCHEMAS.RESOURCE_TYPE],
    id: "Group",
    name: "Group",
    endpoint: "/Groups",
    schema: SCIM_SCHEMAS.GROUP,
  },
];

export const SCHEMA_DEFINITIONS = [
  {
    schemas: [SCIM_SCHEMAS.SCHEMA],
    id: SCIM_SCHEMAS.USER,
    name: "User",
    description: "User Account",
  },
  {
    schemas: [SCIM_SCHEMAS.SCHEMA],
    id: SCIM_SCHEMAS.GROUP,
    name: "Group",
    description: "Group",
  },
];
