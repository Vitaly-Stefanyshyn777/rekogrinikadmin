import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Simple test component
const LoginForm = () => {
  return (
    <div>
      <h1>Вхід в систему</h1>
      <form>
        <input type="email" placeholder="Email" data-testid="email-input" />
        <input
          type="password"
          placeholder="Пароль"
          data-testid="password-input"
        />
        <button type="submit" data-testid="login-button">
          Увійти
        </button>
      </form>
    </div>
  );
};

describe("Login Form", () => {
  it("should render login form elements", () => {
    render(<LoginForm />);

    expect(screen.getByText("Вхід в систему")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("should have correct input types", () => {
    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should have correct button text", () => {
    render(<LoginForm />);

    const loginButton = screen.getByTestId("login-button");
    expect(loginButton).toHaveTextContent("Увійти");
  });
});

