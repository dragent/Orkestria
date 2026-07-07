import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ApiTicket } from "@/lib/api";
import AdminTicketsPage from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({}),
}));

const updateMutate = jest.fn();
const createMutate = jest.fn();

const mockTicketsQuery = jest.fn();

jest.mock("@/lib/hooks/queries", () => ({
  useTicketsQuery: (filters?: unknown) => mockTicketsQuery(filters),
  useProjectsQuery: () => ({ data: [] }),
  useEmployeesQuery: () => ({ data: [] }),
  useUpdateTicketMutation: () => ({ mutateAsync: updateMutate, isPending: false }),
  useCreateTicketMutation: () => ({ mutateAsync: createMutate, isPending: false }),
}));

function buildTicket(overrides: Partial<ApiTicket> = {}): ApiTicket {
  return {
    id: 1,
    title: "Bug critique",
    description: "Plantage en prod",
    type: "bug",
    priority: "high",
    status: "open",
    source: "internal",
    project: null,
    reporter: { id: 9, email: "dev@orkestria.app", firstName: "Dev", lastName: "User" },
    assignee: null,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
    closedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Admin tickets page", () => {
  it("displays the empty state when there is no ticket", () => {
    mockTicketsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<AdminTicketsPage />);
    expect(screen.getByText("Aucun ticket.")).toBeInTheDocument();
  });

  it("renders ticket cards on the board view", () => {
    mockTicketsQuery.mockReturnValue({
      data: [
        buildTicket({ id: 1, title: "Premier ticket", status: "open" }),
        buildTicket({ id: 2, title: "Deuxième ticket", status: "in_progress" }),
      ],
      isLoading: false,
      isError: false,
    });

    render(<AdminTicketsPage />);

    expect(screen.getByText("Premier ticket")).toBeInTheDocument();
    expect(screen.getByText("Deuxième ticket")).toBeInTheDocument();
  });

  it("switches to list view and shows table rows", async () => {
    const user = userEvent.setup();
    mockTicketsQuery.mockReturnValue({
      data: [buildTicket({ id: 99, title: "Ticket test" })],
      isLoading: false,
      isError: false,
    });

    render(<AdminTicketsPage />);
    await user.click(screen.getByRole("button", { name: /vue liste/i }));

    expect(screen.getByRole("link", { name: "Ticket test" })).toHaveAttribute(
      "href",
      "/admin/tickets/99",
    );
  });
});
