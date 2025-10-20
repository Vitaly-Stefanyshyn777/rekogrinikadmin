const API_BASE_URL = "http://localhost:3002/api/v1";

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // Hero methods
  async getHero() {
    return this.request("/hero");
  }

  async createHero(data: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  }) {
    return this.request("/hero", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHero(data: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
  }) {
    return this.request("/hero", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHero() {
    return this.request("/hero", {
      method: "DELETE",
    });
  }

  // Content methods
  async getContent() {
    return this.request("/content");
  }

  async getContentById(id: string) {
    return this.request(`/content/${id}`);
  }

  async createContent(data: {
    blockNumber: number;
    name: string;
    text: string;
    imageUrl?: string;
  }) {
    return this.request("/content", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContent(
    id: string,
    data: {
      name?: string;
      text?: string;
      imageUrl?: string;
    }
  ) {
    return this.request(`/content/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContent(id: string) {
    return this.request(`/content/${id}`, {
      method: "DELETE",
    });
  }

  // Gallery - Albums
  async getAlbums() {
    return this.request("/gallery/albums");
  }

  async createAlbum(data: {
    name: string;
    slug: string;
    type: "GENERAL" | "BEFORE_AFTER";
  }) {
    return this.request("/gallery/albums", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAlbum(
    id: string,
    data: {
      name?: string;
      slug?: string;
    }
  ) {
    return this.request(`/gallery/albums/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAlbum(id: string) {
    return this.request(`/gallery/albums/${id}`, {
      method: "DELETE",
    });
  }

  // Gallery - Photos
  async getAlbumPhotos(albumId: string, tag?: string) {
    const endpoint = tag
      ? `/gallery/albums/${albumId}/photos?tag=${tag}`
      : `/gallery/albums/${albumId}/photos`;
    return this.request(endpoint);
  }

  async uploadPhoto(formData: FormData) {
    return this.request("/upload/photo", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async updatePhoto(
    id: string,
    data: {
      title?: string;
      description?: string;
      tag?: string;
    }
  ) {
    return this.request(`/gallery/photos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePhoto(id: string) {
    return this.request(`/gallery/photos/${id}`, {
      method: "DELETE",
    });
  }

  // Gallery - Pairs
  async getAlbumPairs(albumId: string) {
    return this.request(`/gallery/albums/${albumId}/pairs`);
  }

  async recreatePairs(albumId: string) {
    return this.request(`/gallery/albums/${albumId}/recreate-pairs`, {
      method: "POST",
    });
  }

  async createPair(data: {
    albumId: string;
    beforePhotoId: string;
    afterPhotoId: string;
    label?: string;
  }) {
    return this.request("/gallery/pairs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deletePair(id: string) {
    return this.request(`/gallery/pairs/${id}`, {
      method: "DELETE",
    });
  }

  // Upload methods
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request("/upload/image", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

