import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("@/lib/api", () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.email : "No user"}</div>
      <div data-testid="token">{token ? "Token exists" : "No token"}</div>
      <div data-testid="authenticated">
        {isAuthenticated ? "Authenticated" : "Not authenticated"}
      </div>
      <button
        onClick={() => login("test@example.com", "password")}
        data-testid="login-btn"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should provide initial state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("token")).toHaveTextContent("No token");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Not authenticated"
    );
  });

  it("should restore user from localStorage on mount", () => {
    const mockUser = { id: "1", email: "test@example.com" };
    const mockToken = "mock-token";

    localStorageMock.getItem
      .mockReturnValueOnce(mockToken) // accessToken
      .mockReturnValueOnce(JSON.stringify(mockUser)); // user

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("token")).toHaveTextContent("Token exists");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Authenticated"
    );
  });

  it("should handle successful login", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    const mockToken = "mock-token";
    const mockResponse = {
      data: {
        user: mockUser,
        accessToken: mockToken,
      },
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId("login-btn");
    await userEvent.click(loginBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith(
        "test@example.com",
        "password"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "accessToken",
        mockToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
      expect(toast.success).toHaveBeenCalledWith("Успішно ввійшли в систему");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("token")).toHaveTextContent("Token exists");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Authenticated"
    );
  });

  it("should handle login error", async () => {
    const mockError = {
      response: {
        data: {
          message: "Invalid credentials",
        },
      },
    };

    (authApi.login as jest.Mock).mockRejectedValue(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId("login-btn");
    await userEvent.click(loginBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith(
        "test@example.com",
        "password"
      );
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("token")).toHaveTextContent("No token");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Not authenticated"
    );
  });

  it("should handle logout", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    const mockToken = "mock-token";

    // Set initial state
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    (authApi.logout as jest.Mock).mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId("logout-btn");
    await userEvent.click(logoutBtn);

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(toast.success).toHaveBeenCalledWith("Ви вийшли з системи");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("token")).toHaveTextContent("No token");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Not authenticated"
    );
  });

  it("should handle logout error gracefully", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    const mockToken = "mock-token";

    // Set initial state
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    (authApi.logout as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId("logout-btn");
    await userEvent.click(logoutBtn);

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(toast.success).toHaveBeenCalledWith("Ви вийшли з системи");
    });

    // Should still clear local state even if API call fails
    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("token")).toHaveTextContent("No token");
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "Not authenticated"
    );
  });
});

