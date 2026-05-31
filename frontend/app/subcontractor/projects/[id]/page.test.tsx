import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ApiProject, ApiTask } from "@/lib/api";
import SubcontractorProjectDetailPage from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "7" }),
}));

const updateTaskMutate = jest.fn();

const mockProjectQuery = jest.fn();
const mockTasksQuery = jest.fn();

jest.mock("@/lib/hooks/queries", () => ({
  useSubcontractorProjectQuery: (id: number | undefined) => mockProjectQuery(id),
  useTasksQuery: (id: number | undefined) => mockTasksQuery(id),
  useUpdateTaskMutation: () => ({ mutate: updateTaskMutate, isPending: false }),
}));

const projectFixture: ApiProject = {
  id: 7,
  title: "Charpente entrepôt",
  pipelineStage: "construction",
  client: {
    id: 5,
    name: "BatiCo",
    email: "ops@batico.fr",
    company: { id: 5, name: "BatiCo", slug: "batico" },
    createdAt: "2026-01-01T00:00:00Z",
  },
  startDate: null,
  endDate: null,
  createdAt: "2026-01-15T00:00:00Z",
};

function buildTask(overrides: Partial<ApiTask> = {}): ApiTask {
  return {
    id: 1,
    title: "Poser la structure",
    description: null,
    status: "open",
    dueDate: null,
    assignee: null,
    createdAt: "2026-02-10T00:00:00Z",
    ...overrides,
  };
}

function setupQueries({
  project = projectFixture,
  tasks = [] as ApiTask[],
  projectError = false,
}: {
  project?: ApiProject | null;
  tasks?: ApiTask[];
  projectError?: boolean;
} = {}) {
  mockProjectQuery.mockReturnValue({
    data: projectError ? undefined : project,
    isLoading: false,
    isError: projectError,
  });
  mockTasksQuery.mockReturnValue({ data: tasks, isLoading: false });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Subcontractor project detail page", () => {
  it("renders the project title with its pipeline stage", () => {
    setupQueries();

    render(<SubcontractorProjectDetailPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Charpente entrepôt" })
    ).toBeInTheDocument();
    expect(screen.getByText("Production")).toBeInTheDocument();
  });

  it("shows the load error when the project fails to fetch", () => {
    setupQueries({ projectError: true });

    render(<SubcontractorProjectDetailPage />);

    expect(screen.getByText(/Impossible de charger vos projets/i)).toBeInTheDocument();
  });

  it("shows the empty state when no tasks are assigned", () => {
    setupQueries({ tasks: [] });

    render(<SubcontractorProjectDetailPage />);

    expect(screen.getByText("Aucune tâche.")).toBeInTheDocument();
  });

  it("lists every task with its localized status badge", () => {
    setupQueries({
      tasks: [
        buildTask({ id: 1, title: "Préparer le terrain", status: "open" }),
        buildTask({ id: 2, title: "Couler la dalle", status: "in_progress" }),
        buildTask({ id: 3, title: "Lever la charpente", status: "done" }),
      ],
    });

    render(<SubcontractorProjectDetailPage />);

    expect(screen.getByText("Préparer le terrain")).toBeInTheDocument();
    expect(screen.getByText("Couler la dalle")).toBeInTheDocument();
    expect(screen.getByText("Lever la charpente")).toBeInTheDocument();
    expect(screen.getByText("Ouvert")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Terminé")).toBeInTheDocument();
  });

  it("only exposes the mark-done action for tasks that are not done yet", () => {
    setupQueries({
      tasks: [
        buildTask({ id: 1, status: "open" }),
        buildTask({ id: 2, status: "in_progress" }),
        buildTask({ id: 3, status: "done" }),
      ],
    });

    render(<SubcontractorProjectDetailPage />);

    expect(screen.getAllByRole("button", { name: "Marquer comme terminé" })).toHaveLength(2);
  });

  it("marks a task as done by triggering the update mutation with status='done'", async () => {
    const user = userEvent.setup();
    setupQueries({ tasks: [buildTask({ id: 99, status: "open" })] });

    render(<SubcontractorProjectDetailPage />);
    await user.click(screen.getByRole("button", { name: "Marquer comme terminé" }));

    expect(updateTaskMutate).toHaveBeenCalledTimes(1);
    expect(updateTaskMutate).toHaveBeenCalledWith({
      taskId: 99,
      body: { status: "done" },
    });
  });
});
