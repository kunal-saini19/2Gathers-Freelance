import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("HomePage", () => {
  it("shows the landing page hero", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /hire and get hired/i })).toBeInTheDocument();
  });
});
