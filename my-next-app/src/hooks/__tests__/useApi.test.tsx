import React from "react";
import { renderHook } from "@testing-library/react";
import { useApi } from "../useApi";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("axios");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create axios instance with correct base configuration", () => {
    mockedUseAuth.mockReturnValue({
      token: "mock-token",
      user: { id: "1", email: "test@example.com" },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useApi());
    const api = result.current;

    expect(api.defaults.baseURL).toBe("/api/v1");
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("should add Authorization header when token exists", () => {
    const mockToken = "mock-token";
    mockedUseAuth.mockReturnValue({
      token: mockToken,
      user: { id: "1", email: "test@example.com" },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useApi());
    const api = result.current;

    // Mock the interceptor
    const requestInterceptor = api.interceptors.request.handlers[0];
    const mockConfig = {
      headers: {},
      url: "/test",
    };

    const resultConfig = requestInterceptor.fulfilled(mockConfig);

    expect(resultConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it("should not add Authorization header when token is null", () => {
    mockedUseAuth.mockReturnValue({
      token: null,
      user: null,
      loading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useApi());
    const api = result.current;

    const requestInterceptor = api.interceptors.request.handlers[0];
    const mockConfig = {
      headers: {},
      url: "/test",
    };

    const resultConfig = requestInterceptor.fulfilled(mockConfig);

    expect(resultConfig.headers.Authorization).toBeUndefined();
  });

  it("should recreate axios instance when token changes", () => {
    const { rerender } = renderHook(() => useApi());

    // First render with no token
    mockedUseAuth.mockReturnValue({
      token: null,
      user: null,
      loading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result: result1 } = renderHook(() => useApi());

    // Second render with token
    mockedUseAuth.mockReturnValue({
      token: "new-token",
      user: { id: "1", email: "test@example.com" },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result: result2 } = renderHook(() => useApi());

    // Should create new instance when token changes
    expect(result1.current).not.toBe(result2.current);
  });

  it("should handle response errors", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockedUseAuth.mockReturnValue({
      token: "mock-token",
      user: { id: "1", email: "test@example.com" },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useApi());
    const api = result.current;

    const responseInterceptor = api.interceptors.response.handlers[0];
    const mockError = {
      response: {
        status: 500,
        data: { message: "Internal Server Error" },
      },
    };

    expect(() => responseInterceptor.rejected(mockError)).rejects.toEqual(
      mockError
    );
    expect(consoleSpy).toHaveBeenCalledWith("API помилка:", 500, {
      message: "Internal Server Error",
    });

    consoleSpy.mockRestore();
  });

  it("should pass through successful responses", () => {
    mockedUseAuth.mockReturnValue({
      token: "mock-token",
      user: { id: "1", email: "test@example.com" },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useApi());
    const api = result.current;

    const responseInterceptor = api.interceptors.response.handlers[0];
    const mockResponse = { data: { success: true } };

    const resultResponse = responseInterceptor.fulfilled(mockResponse);

    expect(resultResponse).toBe(mockResponse);
  });
});

