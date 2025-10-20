// Спільні типи для фронтенду і бекенду
// Цей файл можна використовувати в обох частинах проекту

export interface Photo {
  id: number;
  url: string;
  title: string;
  description?: string;
  albumId: number;
  tag?: "before" | "after" | "general"; // Мітка для фільтрації
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeforeAfterPair {
  id: number;
  albumId: number;
  beforePhotoId: number;
  afterPhotoId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response типи
export interface CreatePairRequest {
  albumId: number;
  beforePhotoId: number;
  afterPhotoId: number;
  label?: string;
}

export interface CreatePairResponse {
  id: number;
  albumId: number;
  beforePhotoId: number;
  afterPhotoId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadPhotoRequest {
  file: File;
  albumId: number;
  title: string;
  description?: string;
}

export interface UploadPhotoResponse {
  id: number;
  url: string;
  publicId: string;
  title: string;
}

// Валідаційні схеми
export const CreatePairSchema = {
  albumId: { type: "number", required: true, min: 1 },
  beforePhotoId: { type: "number", required: true, min: 1 },
  afterPhotoId: { type: "number", required: true, min: 1 },
  label: { type: "string", required: false, maxLength: 255 },
};

export const UploadPhotoSchema = {
  albumId: { type: "number", required: true, min: 1 },
  title: { type: "string", required: true, maxLength: 255 },
  description: { type: "string", required: false, maxLength: 1000 },
  tag: {
    type: "string",
    required: false,
    enum: ["before", "after", "general"],
  },
};

// Типи для фільтрації фото
export interface PhotoFilters {
  albumId?: number;
  tag?: "before" | "after" | "general";
  sortBy?: "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// API запити з фільтрацією
export interface GetPhotosRequest {
  albumId: number;
  filters?: PhotoFilters;
}

export interface GetPhotosResponse {
  photos: Photo[];
  total: number;
  hasMore: boolean;
}
