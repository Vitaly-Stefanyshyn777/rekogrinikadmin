import axios from "axios";
import { authApi, galleryApi, contentApi } from "../api";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authApi", () => {
    it("should call login endpoint with correct data", async () => {
      const mockResponse = {
        data: {
          user: { id: "1", email: "test@example.com" },
          accessToken: "mock-token",
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.login("test@example.com", "password123");

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call logout endpoint", async () => {
      const mockResponse = { data: { message: "Logged out successfully" } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(mockResponse);
    });

    it("should call register endpoint with correct data", async () => {
      const mockResponse = {
        data: {
          user: { id: "1", email: "new@example.com" },
          accessToken: "mock-token",
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.register(
        "new@example.com",
        "password123",
        "New User"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/register", {
        email: "new@example.com",
        password: "password123",
        name: "New User",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call forgot password endpoint", async () => {
      const mockResponse = { data: { message: "Reset email sent" } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.forgotPassword("test@example.com");

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call reset password endpoint", async () => {
      const mockResponse = { data: { message: "Password reset successfully" } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.resetPassword("token123", "newpassword123");

      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: "token123",
        password: "newpassword123",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("galleryApi", () => {
    it("should call get albums endpoint", async () => {
      const mockResponse = {
        data: [
          { id: "1", name: "Album 1", slug: "album-1" },
          { id: "2", name: "Album 2", slug: "album-2" },
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await galleryApi.getAlbums();

      expect(mockedAxios.get).toHaveBeenCalledWith("/gallery/albums");
      expect(result).toEqual(mockResponse);
    });

    it("should call create album endpoint", async () => {
      const mockResponse = {
        data: { id: "1", name: "New Album", slug: "new-album" },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await galleryApi.createAlbum({
        name: "New Album",
        slug: "new-album",
      });

      expect(mockedAxios.post).toHaveBeenCalledWith("/gallery/albums", {
        name: "New Album",
        slug: "new-album",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call get photos endpoint with album ID", async () => {
      const mockResponse = {
        data: [
          { id: "1", url: "photo1.jpg", title: "Photo 1" },
          { id: "2", url: "photo2.jpg", title: "Photo 2" },
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await galleryApi.getPhotos("album-1");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/gallery/albums/album-1/photos"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should call create photo endpoint", async () => {
      const mockResponse = {
        data: { id: "1", url: "photo.jpg", title: "New Photo" },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await galleryApi.createPhoto({
        albumId: "album-1",
        url: "photo.jpg",
        publicId: "public-id",
        title: "New Photo",
        description: "Photo description",
      });

      expect(mockedAxios.post).toHaveBeenCalledWith("/gallery/photos", {
        albumId: "album-1",
        url: "photo.jpg",
        publicId: "public-id",
        title: "New Photo",
        description: "Photo description",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call delete photo endpoint", async () => {
      const mockResponse = { data: { message: "Photo deleted" } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await galleryApi.deletePhoto("photo-1");

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/gallery/photos/photo-1"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("contentApi", () => {
    it("should call get content blocks endpoint", async () => {
      const mockResponse = {
        data: [
          { id: "1", blockNumber: 1, name: "header", text: "Header text" },
          { id: "2", blockNumber: 2, name: "hero", text: "Hero text" },
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await contentApi.getContentBlocks();

      expect(mockedAxios.get).toHaveBeenCalledWith("/content");
      expect(result).toEqual(mockResponse);
    });

    it("should call update content block endpoint", async () => {
      const mockResponse = {
        data: { id: "1", blockNumber: 1, name: "header", text: "Updated text" },
      };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await contentApi.updateContentBlock("1", {
        text: "Updated text",
        imageUrl: "image.jpg",
      });

      expect(mockedAxios.put).toHaveBeenCalledWith("/content/1", {
        text: "Updated text",
        imageUrl: "image.jpg",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Error handling", () => {
    it("should handle network errors in login", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(
        authApi.login("test@example.com", "password")
      ).rejects.toThrow("Network Error");
    });

    it("should handle API errors with status codes", async () => {
      const apiError = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      };
      mockedAxios.post.mockRejectedValue(apiError);

      await expect(
        authApi.login("test@example.com", "wrongpassword")
      ).rejects.toEqual(apiError);
    });
  });
});

