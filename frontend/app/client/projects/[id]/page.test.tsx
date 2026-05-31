import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ApiInvoice, ApiProject, ApiQuote } from "@/lib/api";
import ClientProjectDetailPage from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "42" }),
}));

const acceptMutate = jest.fn();
const rejectMutate = jest.fn();

const mockProjectQuery = jest.fn();
const mockQuotesQuery = jest.fn();
const mockInvoicesQuery = jest.fn();

jest.mock("@/lib/hooks/queries", () => ({
  useProjectQuery: (id: number | undefined) => mockProjectQuery(id),
  useQuotesQuery: (id: number | undefined) => mockQuotesQuery(id),
  useInvoicesQuery: (id: number | undefined) => mockInvoicesQuery(id),
  useAcceptQuoteMutation: () => ({ mutate: acceptMutate, isPending: false }),
  useRejectQuoteMutation: () => ({ mutate: rejectMutate, isPending: false }),
  useClientProjectTicketsQuery: () => ({ data: [], isLoading: false }),
  useCreateClientTicketMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

const projectFixture: ApiProject = {
  id: 42,
  title: "Refonte site corporate",
  pipelineStage: "construction",
  client: {
    id: 1,
    name: "Acme",
    email: "client@acme.io",
    company: { id: 1, name: "Acme", slug: "acme" },
    createdAt: "2026-01-01T00:00:00Z",
  },
  startDate: "2026-02-01T00:00:00Z",
  endDate: null,
  createdAt: "2026-01-15T00:00:00Z",
};

function buildQuote(overrides: Partial<ApiQuote> = {}): ApiQuote {
  return {
    id: 100,
    status: "sent",
    notes: null,
    lines: [
      { id: 1, label: "Design", quantity: "2", unitPriceCents: 50000 },
      { id: 2, label: "Development", quantity: "10", unitPriceCents: 80000 },
    ],
    createdAt: "2026-02-10T00:00:00Z",
    invoice: null,
    ...overrides,
  };
}

function buildInvoice(overrides: Partial<ApiInvoice> = {}): ApiInvoice {
  return {
    id: 200,
    status: "paid",
    totalCents: 900000,
    paidAt: "2026-03-01T00:00:00Z",
    createdAt: "2026-02-15T00:00:00Z",
    ...overrides,
  };
}

function setupQueries({
  project = projectFixture,
  quotes = [] as ApiQuote[],
  invoices = [] as ApiInvoice[],
  projectError = false,
}: {
  project?: ApiProject | null;
  quotes?: ApiQuote[];
  invoices?: ApiInvoice[];
  projectError?: boolean;
} = {}) {
  mockProjectQuery.mockReturnValue({
    data: projectError ? undefined : project,
    isLoading: false,
    isError: projectError,
  });
  mockQuotesQuery.mockReturnValue({ data: quotes, isLoading: false });
  mockInvoicesQuery.mockReturnValue({ data: invoices, isLoading: false });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Client project detail page", () => {
  it("renders the project title with its pipeline stage", () => {
    setupQueries();

    render(<ClientProjectDetailPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Refonte site corporate" })
    ).toBeInTheDocument();
    expect(screen.getByText("Production")).toBeInTheDocument();
  });

  it("shows the load error when the project fails to fetch", () => {
    setupQueries({ projectError: true });

    render(<ClientProjectDetailPage />);

    expect(screen.getByText(/Impossible de charger vos projets/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no quotes", () => {
    setupQueries({ quotes: [] });

    render(<ClientProjectDetailPage />);

    expect(screen.getByText("Aucun devis.")).toBeInTheDocument();
  });

  it("shows the empty state when there are no invoices", () => {
    setupQueries({ invoices: [] });

    render(<ClientProjectDetailPage />);

    expect(screen.getByText("Aucune facture.")).toBeInTheDocument();
  });

  it("renders the grand total and status for each quote", () => {
    setupQueries({ quotes: [buildQuote({ status: "draft" })] });

    render(<ClientProjectDetailPage />);

    // 2 * 500€ + 10 * 800€ = 9 000€
    expect(screen.getByText(/9 000,00\s*€/)).toBeInTheDocument();
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("only exposes accept/reject buttons for quotes that have been sent", () => {
    setupQueries({
      quotes: [
        buildQuote({ id: 1, status: "draft" }),
        buildQuote({ id: 2, status: "sent" }),
        buildQuote({ id: 3, status: "accepted" }),
      ],
    });

    render(<ClientProjectDetailPage />);

    expect(screen.getAllByRole("button", { name: "Accepter" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Rejeter" })).toHaveLength(1);
  });

  it("triggers the accept mutation with the quote id when the client accepts", async () => {
    const user = userEvent.setup();
    setupQueries({ quotes: [buildQuote({ id: 77, status: "sent" })] });

    render(<ClientProjectDetailPage />);
    await user.click(screen.getByRole("button", { name: "Accepter" }));

    expect(acceptMutate).toHaveBeenCalledTimes(1);
    expect(acceptMutate).toHaveBeenCalledWith(77);
    expect(rejectMutate).not.toHaveBeenCalled();
  });

  it("triggers the reject mutation with the quote id when the client rejects", async () => {
    const user = userEvent.setup();
    setupQueries({ quotes: [buildQuote({ id: 88, status: "sent" })] });

    render(<ClientProjectDetailPage />);
    await user.click(screen.getByRole("button", { name: "Rejeter" }));

    expect(rejectMutate).toHaveBeenCalledTimes(1);
    expect(rejectMutate).toHaveBeenCalledWith(88);
    expect(acceptMutate).not.toHaveBeenCalled();
  });

  it("renders invoices with their total and status", () => {
    setupQueries({ invoices: [buildInvoice({ status: "paid", totalCents: 120000 })] });

    render(<ClientProjectDetailPage />);

    const invoicesHeading = screen.getByRole("heading", { name: "Factures" });
    const invoicesSection = invoicesHeading.closest("section");
    expect(invoicesSection).not.toBeNull();
    expect(within(invoicesSection!).getByText(/1 200,00\s*€/)).toBeInTheDocument();
    expect(within(invoicesSection!).getByText("Payée")).toBeInTheDocument();
  });
});
