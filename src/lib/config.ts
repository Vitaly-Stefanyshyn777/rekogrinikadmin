const configuredBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
  /\/$/,
  "",
);

if (!configuredBackendUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
}

export const BACKEND_URL = configuredBackendUrl;
